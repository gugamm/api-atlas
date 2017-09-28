const mergePaths = (root = 'http://localhost', resource = '/', endPoint = '/') => {
  return `${root}${resource}${endPoint}`;
};

// config = { params, fetchOptions, path }
const mergeOptions = (rootConfig = {}, resourceConfig = {}, endPointConfig = {}) => {
  const mergedConfigs = { ...rootConfig, ...resourceConfig, ...endPointConfig };
  const mergedFetchOptions = { ...rootConfig.fetchOptions, ...resourceConfig.fetchOptions, ...endPointConfig.fetchOptions };
  const mergedParams = { ...rootConfig.params, ...resourceConfig.params, ...endPointConfig.params };
  mergedConfigs.fetchOptions = mergedFetchOptions;
  mergedConfigs.params = mergedParams;
  return mergedConfigs;
};

const buildAtlasRequestDescription = (rootConfig, resourceConfig, endPointConfig) => {
  const description = {};
  description.url = mergePaths(rootConfig.host, resourceConfig.path, endPointConfig.path);
  description.atlasOptions = mergeOptions(rootConfig, resourceConfig, endPointConfig);
  return description;
};

const AtlasMap = (targetConfig) => {
  const atlasMap = {};

  const resourceNames = Object.getOwnPropertyNames(targetConfig.resources);
  resourceNames.forEach(
    resourceName => {
      atlasMap[resourceName] = AtlasResource(targetConfig, targetConfig.resources[resourceName]);
    },
  );

  return atlasMap;
};

const AtlasResource = (rootConfig, resourceConfig) => {
  const atlasResource = {};

  const endPointNames = Object.getOwnPropertyNames(resourceConfig.endPoints);
  endPointNames.forEach(
    endPointName => {
      atlasResource[endPointName] = AtlasEndPoint(rootConfig, resourceConfig, resourceConfig.endPoints[endPointName]);
    },
  );

  return atlasResource;
};

const AtlasEndPoint = (rootConfig, resourceConfig, endPointConfig) => {
  const atlasEndPoint = () => buildAtlasRequestDescription(rootConfig, resourceConfig, endPointConfig);
  return atlasEndPoint;
};

export default AtlasMap;
