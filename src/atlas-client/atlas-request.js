import buildPlainUrl from '../utils/build-plain-url';

class AtlasRequest {
    constructor({ url, atlasOptions: desAtlasOptions }, atlasOptions = {}) {
        const params = {
          ...desAtlasOptions.params,
          ...atlasOptions.params,
        };
        this.url = buildPlainUrl(url, params);
        this.atlasOptions = {
            fetchOptions: {
              ...desAtlasOptions.fetchOptions,
              ...atlasOptions.fetchOptions,
            },
            params,
        };
    }
};

export default AtlasRequest;
