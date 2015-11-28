const inlineFn = require('./events')


const form = (DOM, state, dispatch) => {

  const onToDoFormSubmit = (el, ev) => {
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
      onSubmit: inlineFn({ onToDoFormSubmit })
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

  return DOM.li({
      className: todo.id == state.selectedTodoId ? 'todo-item todo--selected': 'todo-item'
    },
    DOM.span({}, todo.text))
}

const render = (DOM, state, dispatch) => {
  
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
  render
}
