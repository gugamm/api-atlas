import buildPlainUrl from '../utils/build-plain-url';
import omit from '../utils/omit';

const AtlasRequestState = () => {
  const state = {};

  return state;
}


const AtlasClient = ({ networkInterface, getIdFromRequest }) => {
  getIdFromRequest = getIdFromRequest || ((fetchUrl) => fetchUrl);
  const atlasRequestState = AtlasRequestState();
  const cacheListeners = {};
  
  const buildRequest = (atlasRequestDescription, options = {}) => {
    const params = {
      ...atlasRequestDescription.options.params,
      ...options.params,
    };

    const fetchUrl = buildPlainUrl(atlasRequestDescription.url, params);
    const fetchOptions = {
      ...atlasRequestDescription.options,
      ...options,
    };

    const cache = (fetchOptions.cache === undefined || fetchOptions.cache === null) ? 
                  true : 
                  fetchOptions.cache;

    return {
      fetchUrl,
      fetchOptions: omit(['cache', 'params'], fetchOptions),
      cache,
    };
  }

  const getCacheId = (atlasRequestDescription, options = {}) => {
    const request = buildRequest(atlasRequestDescription, options);
    return getIdFromRequest(request.fetchUrl, request.fetchOptions);
  }

  // options: fetch options + (params, cache)
  const fetch = (atlasRequestDescription, options = {}) => {
    const { fetchUrl, fetchOptions, cache } = buildRequest(atlasRequestDescription, options);
    const cacheId = getIdFromRequest(fetchUrl, fetchOptions);

    if (cache) {
      // Check cache
      if (atlasRequestState[cacheId]) {
        return atlasRequestState[cacheId].fetchPromise;
      }
    }

    // Create element on cache
    const fetchPromise = 
      networkInterface.fetch(fetchUrl, fetchOptions)
      .then(response => {
        atlasRequestState[cacheId].lastResponse = response;
        atlasRequestState[cacheId].fetchPromise = Promise.resolve(response);
        nextCache(cacheId, response);
        return response;      
      })
      .catch(err => {
        atlasRequestState[cacheId].lastResponse = err;
        atlasRequestState[cacheId].fetchPromise = Promise.reject(err);
        nextCache(cacheId, err);
        return Promise.reject(err);
      });

      atlasRequestState[cacheId] = {
        fetchPromise,
      };

      return fetchPromise;
  };

  const clearCache = (cacheId) => {
    delete atlasRequestState[cacheId];
    nextCache(cacheId, null);
  };

  const updateCache = (cacheId, updater) => {
    return new Promise(resolve => {
      const cacheData = atlasRequestState[cacheId];
      Promise.resolve(updater(cacheData))
      .then(
        newCacheData => {
          const newRefCacheData = {...newCacheData};
          atlasRequestState[cacheId].lastResponse = newRefCacheData;
          atlasRequestState[cacheId].fetchPromise = Promise.resolve(newRefCacheData);
          nextCache(cacheId, newRefCacheData);
          resolve(newRefCacheData);
        }
      );
    });
  };

  const nextCache = (cacheId, value) => {
    if (cacheListeners[cacheId]) {
      cacheListeners[cacheId].forEach(
        cacheListener => cacheListener(value),
      );
    }
  }

  const subscribeForCache = (cacheId, listener) {
    if (!cacheListeners[cacheId]) {
      cacheListeners[cacheId] = [];
    }

    cacheListeners[cacheId] = [...cacheListeners[cacheId], listener];
    
    return () => {
      cacheListeners[cacheId] = cacheListeners[cacheId].filter(
        l => l !== listener,
      );
    }
  }

  return {
    fetch: fetch,
    clearCache: clearCache,
    getCacheId: getCacheId,
    updateCache: updateCache,
    subscribeForCache: subscribeForCache,
  };
}

export default AtlasClient;
