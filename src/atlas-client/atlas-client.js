import AtlasRequest from './atlas-request';
import AtlasRequestHandler from './atlas-request-handler';

const defBuildRequestId = ({ url }) => url;

class AtlasClient {
  constructor({ networkInterface, buildRequestId = defBuildRequestId }) {
    this.networkInterface = networkInterface;
    this.buildRequestId = buildRequestId;
    this.requestsState = {};
    this.requestsHandlersInFlight = {};
    this.requestStateListeners = {};
  }

  getRequestState(requestId) {
    if (!this.requestsState[requestId]) {
      this.requestsState[requestId] = {
        loading: false,
        error: null,
        data: null,
      };
    }
    return this.requestsState[requestId];
  }

  setRequestState(requestId, state) {
    const defaultState = { loading: false, error: null, data: null };
    this.requestsState[requestId] = { ...defaultState, ...state };
    const requestStateListeners = this.getRequestStateListeners(requestId);
    requestStateListeners.forEach(
      listener => listener(this.requestsState[requestId]),
    );
  }

  // returns a promise that resolves to an AtlasResponse
  fetch(atlasRequestDescription, atlasOptions) {
    // Build the request id
    const atlasRequest = new AtlasRequest(atlasRequestDescription, atlasOptions);
    const requestId = this.buildRequestId(atlasRequest);
    const requestState = this.getRequestState(requestId);

    // Check if request in flight
    const handlerInFlight = this.requestsHandlersInFlight[requestId];
    if (handlerInFlight) {
      return new Promise(resolve => handlerInFlight.subscribe(resolve));
    }

    // Check if value in cache
    if (requestState.data) {
      return Promise.resolve(requestState.data);
    }

    // register first handler
    const requestHandler = new AtlasRequestHandler(atlasRequest, this.networkInterface);
    this.requestsHandlersInFlight[requestId] = requestHandler;

    // first subscribe to handler
    return new Promise(resolve => {
      requestHandler.subscribe(atlasResponse => {
        this.requestsHandlersInFlight[requestId] = null;
        if (atlasResponse.ok) {
          this.setRequestState(requestId, {
            data: atlasResponse.data,
          });
        } else {
          this.setRequestState(requestId, {
            error: atlasResponse.error,
          });
        }
        resolve(atlasResponse);
      });
    });
  }

  getRequestStateListeners(requestId) {
    if (!this.requestStateListeners[requestId]) {
      this.requestStateListeners[requestId] = [];
    }
    return this.requestStateListeners[requestId];
  }

  subscribeForRequestState(requestId, listener) {
    const listeners = this.getRequestStateListeners(requestId);
    this.requestStateListeners[requestId] = [...listeners, listener];
    return () => {
      this.requestStateListeners[requestId] = this.getRequestStateListeners(requestId).filter(l => l !== listener);
    };
  }

  updateRequestState(requestId, updater) {
    const requestState = this.getRequestState(requestId);
    this.setRequestState(requestId, updater(requestState));
  }
}

export default AtlasClient;
