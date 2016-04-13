export default store => {
  return action => {
    return store.dispatch(action)
  }
}

