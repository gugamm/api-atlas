class AtlasRequestHandler {
  constructor(atlasRequest, { fetcher }) {
    this.atlasRequest = atlasRequest;
    this.fetcher = fetcher;
    this.fetching = false;
    this.fetchComplete = false;
    this.lastResponse = null;
    this.listeners = [];
  }

  doFetch() {
    this.fetching = true;
    this.lastResponse = null;
    this.fetchComplete = false;
    return this.fetcher(this.atlasRequest).then(atlasResponse => {
      this.fetching = false;
      this.fetchComplete = true;
      this.lastResponse = atlasResponse;
      this.listeners.forEach(
        listener => listener(atlasResponse),
      );
      return atlasResponse;
    });
  }

  resetCache() {
    this.fetchComplete = false;
    this.lastResponse = null;
  }

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
