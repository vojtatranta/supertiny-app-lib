export default (initialState, reducers) => {

  const store = {
    reducers: reducers,
    listeners: [],
    state: initialState,

    dispatch(action) {
      this.state = this.reduceState(this.state, action)
      this.changed(this.state)
    },

    reduceState(state, action) {
      return Object.keys(this.reducers).reduce((newState, stateKey) => {
        newState[stateKey] = this.reducers[stateKey](state[stateKey], action)
        return newState
      }, {})
    },

    changed(newState) {
      this.listeners.forEach(listener => listener(newState))
    },

    listen(fn) {
      this.listeners.push(fn)
    }
  }

  return Object.create(store)
}
