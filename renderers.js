
const areSame = (lastProps, props) => {
  if (lastProps === props) {
    return true
  }

  return Object.keys(props).every(key => {
    return lastProps[key] === props[key]
  })
}


const shouldComponentUpdate = (component) => {
  let lastProps = {},
      renderedComponent = null

  return (...args) => {
    if (!areSame(lastProps, args[1]) || !renderedComponent) {
      lastProps = args[0]
      renderedComponent = component(...args)
      return renderedComponent
    } else {
      return renderedComponent
    }
  }
}


const form = shouldComponentUpdate(({ addText = '' }, { DOM, dispatch }) => {

  const onToDoFormSubmit = (ev) => {
    ev.preventDefault()
    const txt = DOM.doc.getElementById('todo-textarea')
    if (txt.value.length == 0) return
    dispatch({
      TYPE: 'ADD_TODO',
      text: txt.value
    })
  }

  return DOM.form({
      id: 'todo-form',
      submit: onToDoFormSubmit
    },
    DOM.div({
      className: 'form-group',
    }, DOM.input({
        id: 'todo-textarea',
        className: 'todo-textarea',
        type: 'text',
        value: addText,
        keyup: (ev) => {
          dispatch({
            TYPE: 'ADD_TEXT_CHANGE',
            value: ev.target.value
          })
        }
      })
    ),
    DOM.div({
      className: 'form-btns'
    },
      DOM.button({
        type: 'submit'
      }, 'Add TODO')
    )
  )
})


const renderItem = shouldComponentUpdate(({ selectedTodoId, todo }, { DOM, dispatch}) => {

  const deleteTodo = (ev) => {
    dispatch({
      TYPE: 'DELETE_TODO',
      id: todo.id,
      text: todo.text
    })
  }

  return DOM.li({
      className: todo.id == selectedTodoId ? 'todo-item todo--selected': 'todo-item'
    },
    DOM.span({}, todo.text),
    DOM.span({
      click: deleteTodo,
      className: 'pull-right close-icon'
    }, 'X'))
})

const todosList = shouldComponentUpdate(({ selectedTodoId, todos }, { DOM, dispatch }) => {
  return DOM.ul({
      className: 'todo-list',
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
  return services.components[state.location](state, services)
})

const todos = shouldComponentUpdate((state, services) => {
  const { DOM } = services
  return DOM.div({
      className: 'app'
    },
    DOM.h1({},
      'What needs to be done?'),
    DOM.div({},
      link({ text: 'O aplikaci', 'path': '/about' }, services)),
    form({ addText: state.addText }, services),
    todosList({ todos: state.todos, selectedTodoId: state.selectedTodoId }, services)
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
        '/about': about
      }
    })
  )
}


export default {
  renderItem,
  app
}
