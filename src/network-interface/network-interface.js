import { buildAtlasResponse } from '../atlas-client';

const defaultFetcher = ({ url, fetchOptions }) => {
  return fetch(url, fetchOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response;
    })
    .then(response => response.json())
    .then(parsedResponse => buildAtlasResponse({ data: parsedResponse }))
    .catch(error => buildAtlasResponse({ ok: false, error }));
};

const createNetworkInterface = ({ fetcher = defaultFetcher } = {}) => ({
  fetcher,
});

export default createNetworkInterface;
