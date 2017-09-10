/***********
 *  UTILS  *
 ***********/

const mergePaths = (root = 'http://localhost', resource = '/', endPoint = '/') => {
  return `${root}${resource}${endPoint}`;
}

const mergeOptions = (root = {}, resource = {}, endPoint = {}) => {
  return {
    ...root,
    ...resource,
    ...endPoint,
  };
}

const buildAtlasRequestDescription = (rootConfig, resourceConfig, endPointConfig) => {
  const description = {};
  description.url = mergePaths(rootConfig.host, resourceConfig.path, endPointConfig.path);
  description.options = mergeOptions(rootConfig.options, resourceConfig.options, endPointConfig.options);
  return description;
}


/***********
 *  ATLAS  *
 ***********/

const AtlasMap = (targetConfig) => {
  const atlasMap = {};

  const resourceNames = Object.getOwnPropertyNames(targetConfig.resources);
  resourceNames.forEach(
    resourceName => {
      atlasMap[resourceName] = AtlasResource(targetConfig, targetConfig.resources[resourceName]);
    },
  );

  return atlasMap;
}

const AtlasResource = (rootConfig, resourceConfig) => {
  const atlasResource = {};

  const endPointNames = Object.getOwnPropertyNames(resourceConfig.endPoints);
  endPointNames.forEach(
    endPointName => {
      atlasResource[endPointName] = AtlasEndPoint(rootConfig, resourceConfig, resourceConfig.endPoints[endPointName]);
    },
  );

  return atlasResource;
}

const AtlasEndPoint = (rootConfig, resourceConfig, endPointConfig) => {
  const atlasEndPoint = () => buildAtlasRequestDescription(rootConfig, resourceConfig, endPointConfig);
  return atlasEndPoint;
}

export default AtlasMap;
