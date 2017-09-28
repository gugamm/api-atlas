const buildAtlasResponse = ({
  ok = true,
  data = null,
  error = null,
  ...rest,
}) => ({
  ok, data, error, ...rest,
});

export default buildAtlasResponse;
