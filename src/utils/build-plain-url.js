function buildPlainUrl(url, params) {
  let queryString = "";
  let tmpUrl = url.slice();
  for (let param in params) {
    let reg = new RegExp(`{${param}}`);
    const newUrl = tmpUrl.replace(reg, params[param]);
    if (newUrl === tmpUrl)
      queryString = (queryString) ? queryString + `&${param}=${params[param]}` : `${param}=${params[param]}`;
    tmpUrl = newUrl;
  }
  const parsedUrl = (queryString) ? tmpUrl + '?' + queryString : tmpUrl;
  return encodeURI(parsedUrl);
}

export default buildPlainUrl;
