
const areSame = (lastProps, props) => {
  if (lastProps === props) {
    return true
  }

  if (Object.keys(lastProps).length == 0 && Object.keys(props) == 0) {
    return true
  }

  return Object.keys(props).every(key => {
    return lastProps[key] === props[key]
  })
}


const shouldComponentUpdate = (component) => {
  var lastProps = {},
      renderedComponent = null

  return (...args) => {
    if (!areSame(lastProps, args[0]) || !renderedComponent) {
      lastProps = args[0]
      renderedComponent = component(...args)
      return renderedComponent
    } else {
      return renderedComponent
    }
  }
}


const form = shouldComponentUpdate((state, { DOM, dispatch }) => {


  const onToDoFormSubmit = (ev) => {
    ev.preventDefault()
    const txt = DOM.doc.getElementById('new-todo')
    if (txt.value.length === 0) return
    dispatch({
      type: 'ADD_TODO',
      text: txt.value
    })

    txt.value = ''
  }

  return DOM.div({
      id: 'header'
    },
    DOM.form({
        id: 'todo-form',
        submit: onToDoFormSubmit
      },
      DOM.div({
        className: 'form-group',
      }, DOM.input({
          id: 'new-todo',
          className: 'todo-textarea',
          placeholder: 'What needs to be done?',
          type: 'text',
          submit: onToDoFormSubmit
        })
      )
    )
  )
})


const renderItem = shouldComponentUpdate(({ selectedTodoId, todo }, { DOM, dispatch}) => {

  const deleteTodo = (ev) => dispatch({
    type: 'DELETE_TODO',
    id: todo.id,
    text: todo.text
  })

  const toggleFinished = (ev) => {
    ev.preventDefault()
    dispatch({
      type: 'TOGGLE_FINISHED',
      todo: todo
    })
  }

  let checkBoxState = {
    className: 'toggle',
    type: 'checkbox',
    change: toggleFinished
  }

  if (todo.finished) {
    checkBoxState.checked = true
  }

  return DOM.li({
      className: todo.id == selectedTodoId ? 'todo-item todo--selected': 'todo-item'
    },
    DOM.div({
      className: 'view',
      },
      DOM.input(checkBoxState),
      DOM.label({}, todo.text),
      DOM.button({
        click: deleteTodo,
        className: 'destroy pull-right close-icon'
      })
    )
  )
})

const todosList = shouldComponentUpdate(({ selectedTodoId, todos }, { DOM, dispatch }) => {
  return DOM.ul({
      id: 'todo-list',
    }, todos.map(todo => renderItem({ selectedTodoId, todo }, { DOM,  dispatch }))
  )
})

const link = shouldComponentUpdate(({ path, text }, { history, DOM, dispatch }) => {

  const handleClick = (ev) => {
    ev.preventDefault()
    history.change(path, dispatch)
  }

  return DOM.a({
    className: 'link',
    href: path,
    click: handleClick
  }, text)
})

const router = shouldComponentUpdate((state, services) => {
  const handler = services.components[state.location]
  if (handler) {
    return handler(state, services)
  } else {
    return services.components['!!NOT_FOUND!!'](state, services)
  }
})

const todos = shouldComponentUpdate((state, services) => {
  const { DOM } = services
  const unFinishedTodosCount = state.todos.filter(todo => !todo.finished).length

  return DOM.div({
      id: 'todoapp'
    },
    DOM.h1({},
      'todos'),
    form({}, services),
    todosList({ todos: state.todos, selectedTodoId: state.selectedTodoId }, services),
    DOM.div({
      id: 'footer',
    }, DOM.span({ id: 'todo-count' },
      DOM.strong({}, String(unFinishedTodosCount)), ' items left')),
    DOM.div({
      className: 'text-center footer-links'
    }, link({ text: 'About this library', 'path': '/about', className: 'link link--about' }, services))
  )
})

const about = (state, { DOM, dispatch }) => {
  return DOM.h1({}, 'This is about page')
}

const app = (state, services) => {

  return router(
    state,
    Object.assign(services, {
      components: {
        '/': todos,
        '/about': about,
        '!!NOT_FOUND!!': todos
      }
    })
  )
}


export default {
  renderItem,
  app
}
