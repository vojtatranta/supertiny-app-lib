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


const cachedRender = (app, el) => {
  let renderedApp = null

  return (...args) => {
    let renderedApp = app(...args)

    return el.appendChild()
  }

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

const store = createStore({ todos, addText })

let initialState = window.__INITIAL__

const dispatch = createDispatch(initialState, store)
const el = document.getElementById('app')

window.lotsOfTodos = () => {
  var todos = []
  for (var i = 0, l = 1000; i < l; i++) {
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
  render(app({ DOM, dispatch }, state), el)
  console.timeEnd('render')
})


//bind listeners + is server-side / not
render(app({ DOM, dispatch }, initialState), el, el.innerHTML.length)



