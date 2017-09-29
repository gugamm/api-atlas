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
    doFetch() {
      if (!this.state.data && !this.state.error && !this.state.loading) {
        this.setState({ loading: true });
        return new Promise(resolve => {
          const unsubscribe = this.fetchHandler.subscribe(atlasResponse => {
            if (atlasResponse.ok) {
              this.setState({ data: atlasResponse.data });
            } else {
              this.setState({ error: atlasResponse.error });
            }
            resolve(atlasResponse);
            unsubscribe();
          });
        });
      }
      return new Promise(resolve => this.fetchHandler.subscribe(resolve));
    }

    refetch() {
      // clear cache
      this.fetchHandler.resetCache();
      this.setState({ loading: true });
      this.fetchHandler.doFetch().then(atlasResponse => {
        if (atlasResponse.ok) {
          this.setState({ data: atlasResponse.data });
        } else {
          this.setState({ error: atlasResponse.error });
        }
      });
    }
};

export default AtlasRequest;
