export default (initialState, store) => {

  var state = initialState //"mutable"

  const areSame = (prevState, nextState) => {
    let keys = Object.keys(nextState)
    for(let key in keys) {
      if (!prevState.hasOwnProperty(key) || prevState[key] !== nextState[key]) {
        return false
      }
    }
    return true
  }

  return action => {
    var newState = store.reduceState(state, action)
    if (!areSame(state, newState)) {
      state = newState
      store.changed(state)  
    }
    return state
  }
}

