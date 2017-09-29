const mergeAtlasOptions = (a, b) => ({
  ...a,
  ...b,
  params: {
    ...a.params,
    ...b.params,
  },
  fetchOptions: {
    ...a.fetchOptions,
    ...b.fetchOptions,
  },
});

export default mergeAtlasOptions;
