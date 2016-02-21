import createDOM from './dom-helper'
import createDispatch from './lib/create-dispatch'
import createStore from './lib/create-store'
import { app, renderlayer } from './renderers'

import sass from './styles/style.sass'


const flattenElementTree = (elements, parentIndex = []) => {
  var flatElements = []
  elements = Array.prototype.slice.apply(elements)
  for (let i in elements) {
    const element = elements[i]
    const index = parentIndex.concat([i])
    flatElements.push([element, index])
    if (element.children) {
      flatElements = flatElements.concat(flattenElementTree(element.children, index))
    }
  }
  return flatElements
}

const getElementAndHandler = (elements) => {
  var matchedElements = []
  for(let elementAndPath of elements) {
    const [element, path] = elementAndPath
    if (element.events) {
      const mapped = Object.keys(element.events).map(eventType => {
        return [path, eventType, element.events[eventType]]
      })
      matchedElements = matchedElements.concat(mapped)
    }
  }
  return matchedElements
}

const getElementByPath = (path, rootEl) => {
  return path.reduce((element, nextIndex) => {
      return element.children[nextIndex]
  }, rootEl)
}


const render = (vdom, el, onServerRendered = false) => {

  if (onServerRendered) {
    const flatten = flattenElementTree([vdom])
    const matchedEvents = getElementAndHandler(flatten)

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
}

const DOM = createDOM(document)

const addText = (addText, action) => {
  switch (action.TYPE) {
    case 'ADD_TEXT_CHANGE':
      return action.value
  }
  return addText
}


const todos = (todos, action) => {
  switch(action.TYPE) {
    case 'ADD_TODO':
      return todos.concat([
        {
          text: action.text,
          id: new Date().getTime()
        }
      ])
    case 'ADD_BATCH_TODO':
      return action.todos
    case 'DELETE_TODO':
      return todos.filter(todo => {
        return todo.id != action.id
      })
  }

  return todos
}

const location = (location, action) => {
  switch(action.TYPE) {
    case 'LOCATION_CHANGE':
      if (location != action.location) {
        return action.location
      }
  }
  return location
}

const store = createStore({ todos, addText, location })

let initialState = window.__INITIAL__
initialState.location = window.location.pathname

const dispatch = createDispatch(initialState, store)
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

  const locationChangeListener = (ev) => {
    dispatchLocationChange()
  }

  window.onpopstate = locationChangeListener

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
    TYPE: 'ADD_BATCH_TODO',
    todos
  })
}

store.listen(state => {
  console.time('render')
  render(app({ history, DOM, dispatch }, state), el)
  console.timeEnd('render')
})


//bind listeners + is server-side / not
render(app({ history, DOM, dispatch }, initialState), el, el.innerHTML.length)



