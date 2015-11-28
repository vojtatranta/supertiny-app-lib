if (typeof window == 'undefined') {
  global.window = {}
}   

module.exports = (fnKeyValue) => {
  for(var fnName of Object.keys(fnKeyValue)) {
    window[fnName] = fnKeyValue[fnName]
    return `${fnName}(this, event);`
  }

}

