import createDOM from './dom-helper'
import createDispatch from './lib/create-dispatch'
import createStore from './lib/create-store'
import { render, renderlayer } from './renderers'

import sass from './styles/style.sass'

const DOM = createDOM(document)

const todos = (todos, action) => {
  console.log(todos, action)
  switch(action.TYPE) {
    case 'ADD_TODO':
      return todos.concat([
        {
          text: action.text,
          id: new Date().getTime()
        } 
      ])
    case 'DELETE_TODO':
      return todos.filter(todo => {
        console.log(todo)
        return todo.id != action.id
      })
  }

  return state
}

const store = createStore({ todos })

let state = window.__INITIAL__

const dispatch = createDispatch(state, store)
const el = document.getElementById('app')


store.listen(state => {
  el.innerHTML = ''
  console.time('render')
  el.appendChild(render(DOM, state, dispatch))
  console.timeEnd('render')
})


//bind listeners + is server-side / not
if (el.innerHTML.length == 0) {
  dispatch({
    type: 'INIT'
  })
} else {
  render(DOM, state, dispatch)
}


