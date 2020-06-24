module.exports = (inPost, inOptions, inHexo) => {
  const lj = require('./list-json.js')
  const list = lj.getList(inOptions, inPost, inHexo)
  return list
}
