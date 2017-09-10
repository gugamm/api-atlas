const FetchNetworkInterface = ({ responseParser } = {}) => {
  const defaultParser = response => response.json();
  const parser = responseParser || defaultParser;

  return {
    fetch(url, options) {
      return fetch(url, options)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw Error(response.statusText);
      });
    },
  };
}

export default FetchNetworkInterface;
