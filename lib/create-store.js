export default (reducers) => {
  var listeners = []
  return Object.create({
    reduceState(state, action) {
      var newState = {}
      Object.keys(reducers).forEach(stateKey => {
        newState[stateKey] = reducers[stateKey](state[stateKey], action)
      })

      return Object.assign({}, state, newState)
    },

    changed(newState) {
      listeners.forEach(listener => listener(newState))
    },

    listen(fn) {
      listeners.push(fn)
    }
  })
}
