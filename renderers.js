
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
      lastProps = args[1]
      renderedComponent = component(...args)
      return renderedComponent
    } else {
      return renderedComponent
    }
  }
}


const form = shouldComponentUpdate(({ DOM, dispatch }, { addText = '' }) => {

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


const renderItem = shouldComponentUpdate(({ DOM, dispatch}, { selectedTodoId, todo }) => {

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

const todosList = shouldComponentUpdate(({ DOM, dispatch }, { selectedTodoId, todos }) => {
  return DOM.ul({
      className: 'todo-list',
    }, todos.map(todo => renderItem({ DOM,  dispatch }, { selectedTodoId, todo }))
  )
})

const app = ({ DOM, dispatch }, state) => {

  return DOM.div({
      className: 'app'
    },
    DOM.h1({},
      'What needs to be done?'),
    form({ DOM, dispatch }, { addText: state.addText }),
    todosList({ DOM, dispatch }, { todos: state.todos, selectedTodoId: state.selectedTodoId })
  )
}


export default {
  renderItem,
  app
}
