const omit = (props, obj) => {
  let omitObj = {...obj};
  props.forEach(
    prop => delete omitObj[prop],
  );
  return omitObj;
}

export default omit;
