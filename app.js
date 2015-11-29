import createDOM from './dom-helper'
import createDispatch from './lib/create-dispatch'
import createStore from './lib/create-store'
import { app, renderlayer } from './renderers'

import sass from './styles/style.sass'

const flattenElementTree = (elements, parentIndex = []) => {
  var flatElements = []
  elements = Array.prototype.slice.apply(elements)
  for (var i in elements) {
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
  for(const elementAndPath of elements) {
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
  return path.reduce((prev, next) => {
    if (next) {
      return prev.children[next]
    } else {
      return prev
    }
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

const todos = (todos, action) => {
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
        return todo.id != action.id
      })
  }

  return state
}

const store = createStore({ todos })

let state = window.__INITIAL__

const dispatch = createDispatch(state, store)
const el = document.getElementById('app')


render(app(DOM, state, dispatch), el, true)
store.listen(state => {
  console.time('render')
  render(app(DOM, state, dispatch), el)
  console.timeEnd('render')
})


//bind listeners + is server-side / not
if (el.innerHTML.length == 0) {
  dispatch({
    type: 'INIT'
  })
} else {
}


