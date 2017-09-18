const createNetworkInterface = ({ responseParser } = {}) => {
  const defaultParser = response => response.json();
  const parseResponse = responseParser || defaultParser;

  let beforeRequestListener;

  const handleBeforeRequestListener = (oldUrl, oldOptions) => {
    return new Promise(resolve => {
      if (beforeRequestListener) {
        beforeRequestListener(oldUrl, oldOptions).then(
          ({ url = oldUrl, options = oldOptions } = {}) => {
            resolve({
              url,
              options: {
                ...oldOptions,
                ...options,
              },
            });
          },
        );
      } else {
        resolve({
          url: oldUrl,
          options: oldOptions
        });
      }
    });
  }

  return {
    fetch(url, options) {
      return handleBeforeRequestListener(url, options)
      .then(({ url, options }) => fetch(url,options))
      .then(parseResponse);
    },
    setBeforeRequestListener(listener) {
      beforeRequestListener = listener;
    },
  };
}

export default createNetworkInterface;
