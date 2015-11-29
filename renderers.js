const inlineFn = require('./events')


const form = (DOM, state, dispatch) => {

  const onToDoFormSubmit = (ev) => {
    ev.preventDefault()
    const txtArea = DOM.doc.getElementById('todo-textarea')
    if (txtArea.value.length == 0) return
    dispatch({
      TYPE: 'ADD_TODO',
      text: txtArea.value
    })
  }

  return DOM.form({
      id: 'todo-form',
      submit: onToDoFormSubmit
    },
    DOM.div({
      className: 'form-group',
    }, DOM.textarea({
        id: 'todo-textarea',
        className: 'todo-textarea'
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
}


const renderItem = (DOM, todo, state, dispatch) => {

  var deleteTodo = function(ev) {
    dispatch({
      TYPE: 'DELETE_TODO',
      id: todo.id,
      text: todo.text
    })
  }

  return DOM.li({
      className: todo.id == state.selectedTodoId ? 'todo-item todo--selected': 'todo-item'
    },
    DOM.span({}, todo.text),
    DOM.span({
      click: deleteTodo,
      className: 'pull-right close-icon'
    }, 'X'))
}

const app = (DOM, state, dispatch) => {
  
  return DOM.div({
      className: 'app'
    },
    DOM.h1({},
      'What needs to be done?'),
    form(DOM, state, dispatch),
    DOM.ul({
      className: 'todo-list',
    }, state.todos.map(todo => renderItem(DOM, todo, state, dispatch)))
  )
}


module.exports = {
  renderItem,
  app
}
