const ObservablePromise = (promise) => {
  let listeners = [];
  let resolved = false;
  let resolvedValue = null;

  const subscribe = (l) => {
    listeners = [...listeners, l];
    if (resolved) {
      l(resolvedValue);
    }
  };

  const getListeners = () => listeners;

  const setListeners = newListeners => {
    listeners = newListeners;
  };

  promise.then(response => {
    resolved = true;
    resolvedValue = response;
    listeners.forEach(listener => listener(response)); //call listeners
  });

  return { subscribe, getListeners, setListeners };
};

class AtlasRequestHandler {
  constructor(atlasRequest, { fetcher }) {
    this.atlasRequest = atlasRequest;
    this.fetcher = fetcher;
    this.fetching = false;
    this.fetchComplete = false;
    this.lastResponse = null;
    this.listeners = []; // array of subscribers of current request
    this.resolvers = []; // array of resolve functions (call functions passed through then)
    this.fetcher$ = null; // the current Observable fetcher
  }

  // force a new request, keep listeners and resolvers. Once resolved, clear listeners and resolvers
  doFetch() {
    return new Promise(resolver => {
      this.fetching = true;
      this.lastResponse = null;
      this.fetchComplete = false;
      this.resolvers = [...this.resolvers, resolver];

      // have a previous fetcher in flight than change to new fetcher
      if (this.fetcher$) {
        this.fetcher$.setListeners([]); //remove listeners
      }

      // create a new fetcher
      this.fetcher$ = ObservablePromise(this.fetcher(this.atlasRequest));

      // subscribe a new listener
      this.fetcher$.subscribe(atlasResponse => {
        this.fetching = false;
        this.fetchComplete = true;
        this.lastResponse = atlasResponse;
        this.listeners.forEach(
          listener => listener(atlasResponse),
        );
        this.resolvers.forEach(
          resolver => resolver(atlasResponse),
        );
        this.listeners = [];
        this.resolvers = [];
        this.fetcher$ = null;
      });
    });
  }

  // subscribe to current request or start a new one if no request is in flight
  subscribe(listener) {
    const isFirstListener = this.listeners.length === 0;
    this.listeners = [...this.listeners, listener];
    if (isFirstListener && !this.fetching && !this.fetchComplete) {
      this.doFetch();
    }
    if (this.fetchComplete) {
      listener(this.lastResponse);
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export default AtlasRequestHandler;
