import createDOM from './dom-helper'
import createDispatch from './lib/create-dispatch'
import createStore from './lib/create-store'
import { app, renderlayer } from './renderers'

import sass from './styles/style.css'


const replaceElement = (oldEl, newEl) => {
  oldEl.parentNode.replaceChild(newEl, oldEl)
}

const createElementUpdate = (rootEl, path, componentFn) => {
  return (state) => {
    let element = getElementByPath(path, rootEl)
    replaceElement(element, componentFn(createElementUpdate(rootEl, path, componentFn), state))
  }
}

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


const render = (vdom, el, firstTime = false) => {
  let t0 = performance.now()
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
  let t1 = performance.now()
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
        return todo.id != action.id
      })

    case 'TOGGLE_FINISHED':
      let index = todos.indexOf(action.todo)
      if (~index) {
        todos[index].finished = !action.todo.finished
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
      if (location != action.location) {
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
    type: 'ADD_BATCH_TODO',
    todos
  })
}

store.listen(state => {
  render(app(state, { history, DOM, dispatch }), el)
})


//bind listeners + is server-side / not
render(app(initialState, { history, DOM, dispatch }), el, el.innerHTML.length)



