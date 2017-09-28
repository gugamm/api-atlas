class AtlasRequestHandler {
  constructor(atlasRequest, { fetcher }) {
    this.atlasRequest = atlasRequest;
    this.fetcher = fetcher;
    this.fetching = false;
    this.listeners = [];
  }

  doFetch() {
    this.fetching = true;
    this.fetcher(this.atlasRequest).then(atlasResponse => {
      this.fetching = false;
      this.listeners.forEach(
        listener => listener(atlasResponse),
      );
    });
  }

  subscribe(listener) {
    const isFirstListener = this.listeners.length === 0;
    this.listeners = [...this.listeners, listener];
    if (isFirstListener && !this.fetching) {
      this.doFetch();
    }
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export default AtlasRequestHandler;
