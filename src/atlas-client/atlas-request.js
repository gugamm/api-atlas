import AtlasRequestHandler from './atlas-request-handler';

class AtlasRequest {
    constructor({ url, atlasOptions }, networkInterface) {
        this.url = url;
        this.atlasOptions = atlasOptions;
        this.state = {
          loading: false,
          data: null,
          error: null,
        };
        this.listeners = [];
        this.fetchHandler = new AtlasRequestHandler(this, networkInterface);
    }

    /* State Management Functions */
    getState() {
      return this.state;
    }

    setState(newState) {
      const shouldSetState = Object.getOwnPropertyNames(newState).reduce((acc, key) => {
        if (acc) {
          return true;
        }
        if (newState[key] !== this.state[key]) {
          return true;
        }
        return false;
      }, false);

      if (shouldSetState) {
        const defaultState = {
          loading: false,
          data: null,
          error: null,
        };
        this.state = {
          ...defaultState,
          ...newState
        };
        this.listeners.forEach(listener => {
          listener(this.state);
        });
      }
    }

    subscribeForState(listener) {
      this.listeners = [...this.listeners, listener];
      return () => {
        this.listeners = this.listeners.filter(l => l !== listener);
      };
    }

    updateState(updater) {
      const prevState = this.getState();
      this.setState(updater(prevState));
    }

  /* Http layer handler functions */

    // subscribe to current fetcher or start a new request if none (use subscribe)
    doFetch() {
      const cache = this.atlasOptions.cache;

      // if state is crystalline then first request
      if (!this.state.data && !this.state.error && !this.state.loading) {
        this.setState({ loading: true });
        return new Promise(resolve => {
          const unsubscribe = this.fetchHandler.subscribe(atlasResponse => {
            if (atlasResponse.ok) {
              this.setState({ data: atlasResponse.data });
            } else {
              this.setState({ error: atlasResponse.error });
            }
            unsubscribe();
            resolve(atlasResponse);
          });
        });
      }

      // batching
      if (this.state.loading) {
        return new Promise(resolve => this.fetchHandler.subscribe(resolve));
      }

      // caching
      if (cache) {
        return Promise.resolve(this.fetchHandler.lastResponse);
      }

      // no caching
      return this.refetch();
    }

    // force a new request (use doFetch)
    refetch() {
      this.setState({ loading: true });
      return this.fetchHandler.doFetch().then(atlasResponse => {
        if (atlasResponse.ok) {
          this.setState({ data: atlasResponse.data });
        } else {
          this.setState({ error: atlasResponse.error });
        }
        return atlasResponse;
      });
    }
};

export default AtlasRequest;
