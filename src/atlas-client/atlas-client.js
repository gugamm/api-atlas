import AtlasRequest from './atlas-request';
import buildPlainUrl from '../utils/build-plain-url';
import mergeAtlasOptions from '../utils/merge-atlas-options';

const defBuildRequestId = ({ url }) => url;

class AtlasClient {
  constructor({ networkInterface, buildRequestId = defBuildRequestId }) {
    this.networkInterface = networkInterface;
    this.buildRequestId = buildRequestId;
    this.requests = {};
  }

  buildRequest({ url, atlasOptions: desAtlasOptions }, atlasOptions = {}) {
    const mergedOptions = mergeAtlasOptions(desAtlasOptions, atlasOptions);
    const plainUrl = buildPlainUrl(url, mergedOptions.params);
    const cache = mergedOptions.cache;
    let request;

    if (cache) {
      const requestId = this.buildRequestId({ url: plainUrl, atlasOptions: mergedOptions });
      if (!this.requests[requestId]) {
        this.requests[requestId] = new AtlasRequest({ url: plainUrl, atlasOptions: mergedOptions }, this.networkInterface);
      }
      request = this.requests[requestId];
    } else {
      request = new AtlasRequest({ url: plainUrl, atlasOptions: mergedOptions }, this.networkInterface);
    }

    return request;
  }
}

export default AtlasClient;
