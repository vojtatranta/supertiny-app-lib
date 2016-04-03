// @flow

import createDOM from './dom-helper'
import createDispatch from './lib/create-dispatch'
import createStore from './lib/create-store'
import { app } from './components/renderers'

import sass from './styles/style.css'


const flattenElementTree = (rootEl, elements, parentIndex = []) => {
  var flatElements = []
  elements = Array.prototype.slice.apply(elements)
  for (let i in elements) {
    const index = parentIndex.concat([i])
    let element = elements[i]

    flatElements.push([element, index])
    if (element.children) {
      flatElements = flatElements.concat(flattenElementTree(rootEl, element.children, index))
    }
  }
  return flatElements
}

const getElementAndHandler = (elements) => {
  var matchedElements = []
  for(let elementAndPath of elements) {
    const [element, path] = elementAndPath
    if (element.events) {
      let mapped = Object.keys(element.events).map(eventType => [path, eventType, element.events[eventType]])
      matchedElements = matchedElements.concat(mapped)
    }
  }
  return matchedElements
}

const getElementByPath = (path, rootEl) => {
  window.e = rootEl
  return path.reduce((element, nextIndex) =>{
    return element.children[nextIndex]
  }, rootEl)
}


const debounce = (duration, fn) => {
  var timeout = null
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), duration)
  }
}

const async = (fn) => {
  return (...args) => fn(...args)
}


const render = (vdomFn, vdomFnArgs, el, firstTime = false) => {
  let t0 = window.performance.now()
  let vdom = vdomFn.apply(null, vdomFnArgs)

  if (firstTime && el.innerHTML.length > 0) {
    const flattenedElements = flattenElementTree(el, [ vdom ])
    const matchedEvents = getElementAndHandler(flattenedElements)

    for (const matchedEvent of matchedEvents) {
      const [ pathToElement, eventType, handler ] = matchedEvent
      const matchedElement = getElementByPath(pathToElement, el)
      if (!matchedElement) {
        throw new Error('Server-side and client-side render tree differs!')
      } else {
        matchedElement.addEventListener(eventType, handler)
      }
    }
  } else {
    el.innerHTML = ''
    el.appendChild(vdom)
  }
  let t1 = window.performance.now()
  console.log('render', (t1 - t0).toFixed(4) + 'ms')
}


const DOM = createDOM(document, {
  'SHOULD_COMPONENT_UPDATE': (elementType, scopedIndex) => elementType.component(elementType.id + scopedIndex)
})

const addText = (addText, action) => {
  switch (action.TYPE) {
    case 'ADD_TEXT_CHANGE':
      return action.value
  }
  return addText
}


const todos = (todos, action) => {

  switch(action.type) {
    case 'EDIT_TODO_TEXT':
      const matchedTodos = todos.filter(todo => todo.id === action.todo.id)
      if (matchedTodos.length) {
        const modifiedTodos = matchedTodos.map(todo => Object.assign({}, todo, { text: action.text, editing: false }))
        let modifiedTodoIds = {}
        modifiedTodos.forEach(todo => modifiedTodoIds[todo.id] = todo)

        return todos.map(todo => {
          if (modifiedTodoIds[todo.id]) {
            return modifiedTodoIds[todo.id]
          } else {
            return todo
          }
        })
      } else {
        return todos
      }

    case 'QUIT_EDITING':
      return todos.map(todo => {
        if (todo.editing) {
          return Object.assign({}, todo, { editing: false })
        } else {
          return todo
        }
      })

    case 'TOGGLE_EDITING':
      return todos.map(todo => {
        if (String(todo.id) === String(action.todo.id)) {
          return Object.assign({}, todo, { editing: !Boolean(action.todo.editing) })
        }

        if (todo.editing) {
          return Object.assign({}, todo, { editing: false })
        }

        return todo
      })

    case 'ADD_TODO':
      return todos.concat(
        [{
          text: action.text,
          finished: false,
          id: new Date().getTime()
        }]
      )

    case 'ADD_BATCH_TODO':
      return action.todos

    case 'DELETE_TODO':
      return todos.filter(todo => {
        return todo.id !== action.id
      })

    case 'TOGGLE_FINISHED':
      let index = todos.indexOf(action.todo)

      if (~index) {
        todos[index] = Object.assign({}, action.todo, { finished: !Boolean(action.todo.finished) })
        return todos.slice()
      } else {
        return todos
      }
  }

  return todos
}

const location = (location, action) => {
  switch(action.TYPE) {
    case 'LOCATION_CHANGE':
      if (location !== action.location) {
        return action.location
      }
  }
  return location
}

let initialState = window.__INITIAL__
const store = createStore(initialState, { todos, addText, location })

initialState.location = window.location.pathname

const dispatch = createDispatch(store)
const el = document.getElementById('app')

const createHistory = (window, history, location, dispatch) => {

  const dispatchLocationChange = () => {
    dispatch({
      TYPE: 'LOCATION_CHANGE',
      location: location.pathname
    })
  }

  const back = () => {
    history.back()
    dispatchLocationChange()
  }

  const forward = () => {
    history.forward()
    dispatchLocationChange()
  }

  const change = (nextLocation) => {
    history.pushState(null, null, nextLocation)
    dispatchLocationChange()
  }

  const locationChangeListener = () => {
    dispatchLocationChange()
  }

  window.addEventListener('popstate', locationChangeListener)

  return {
    back,
    forward,
    change
  }
}

const history = createHistory(window, window.history, window.location, dispatch)

window.lotsOfTodos = (howMuch = 1000) => {
  var todos = []
  for (var i = 0, l = howMuch; i < l; i++) {
    todos.push({
      text: "This is #" + i,
      id: i
    })
  }

  dispatch({
    type: 'ADD_BATCH_TODO',
    todos
  })
}

store.listen(state => {
  render(app, [state, { history, DOM, dispatch }], el)
})


//bind listeners + is server-side / not
render(app, [initialState, { history, DOM, dispatch }], el, el.innerHTML.length)



