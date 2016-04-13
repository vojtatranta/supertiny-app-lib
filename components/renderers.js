import shouldComponentUpdate from './should-component-update'


const form = shouldComponentUpdate((state, { DOM, dispatch }) => {

  const onToDoFormSubmit = (ev) => {
    ev.preventDefault()
    const txt = DOM.doc.getElementById('new-todo')
    if (txt.value.length === 0) {
      return
    }

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

const todoItemLabel = shouldComponentUpdate((todo, { DOM, dispatch, toggleEditing, quitEditing }) => {

  const handleKeyup = (ev, input) => {
    if (ev.keyCode === 27) {
      return toggleEditing()
    }

    if (ev.keyCode !== 13) {
      return
    }

    dispatch({
      type: 'EDIT_TODO_TEXT',
      todo: todo,
      text: input.value
    })

    quitEditing()

    ev.stopPropagation()
  }

  return DOM.div({},
    Boolean(todo.editing) ? 
    DOM.input({
      value: todo.text,
      focusout: quitEditing,
      classname: 'edit',
      autofocus: true,
      id: `edit-${todo.id}`,
      keyup: handleKeyup
    }) :
    DOM.label({
      dblclick: toggleEditing
    }, todo.text)
  )
})


const todoItem = shouldComponentUpdate((todo, { DOM, dispatch }) => {

  const quitEditing = () => {
    return dispatch({
      type: 'QUIT_EDITING'
    })
  }

  const deleteTodo = () => dispatch({
    type: 'DELETE_TODO',
    id: todo.id,
    text: todo.text
  })

  const toggleFinished = ev => {
    ev.preventDefault()
    quitEditing()

    dispatch({
      type: 'TOGGLE_FINISHED',
      todo: todo
    })
  }

  const toggleEditing = () => {
    dispatch({
      type: 'TOGGLE_EDITING',
      todo: todo
    })

    if (!Boolean(todo.editing)) {
      DOM.doc.getElementById(`edit-${todo.id}`).select()
    }
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
      className: Boolean(todo.editing) ? 'editing todo-item' : 'todo-item',
    },
    DOM.div({
      className: 'view',
      },
      DOM.input(checkBoxState),
      DOM.button({
        click: deleteTodo,
        className: 'destroy pull-right close-icon'
      })
    ),
    todoItemLabel(todo, { DOM, dispatch, toggleEditing, quitEditing })
  )
})


const todosList = shouldComponentUpdate(({ selectedTodoId, todos }, { DOM, dispatch }) => {
  return DOM.ul({
      id: 'todo-list',
    }, todos.map(todo => todoItem(todo, { DOM,  dispatch }))
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


const todos = shouldComponentUpdate((state, services) => {

  const { DOM } = services
  const unFinishedTodosCount = state.todos.filter(todo => !todo.finished).length

  return DOM.div({
      id: 'todoapp'
    },
    DOM.h1({}, 'todos'),
    form({}, services),
    todosList({ todos: state.todos, selectedTodoId: state.selectedTodoId }, services),
    DOM.div({
      id: 'footer',
    }, DOM.span({ id: 'todo-count' },
      DOM.strong({}, String(unFinishedTodosCount)), ' items left')),
    DOM.div({
      className: 'text-center footer-links'
    },
    DOM.p({}, 'In console call ', DOM.strong({}, 'lotsOfTodos()'),  ' to add 1000 todos (count might be specified via argument)'),
    link({ text: 'About this library', 'path': '/about', className: 'link link--about' }, services))
  )
})

const about = (state, { DOM }) => {
  return DOM.div({},
    DOM.h1({}, 'Supertiny application library?'),
    DOM.p({}, 'What does "supertiny" stands for? Well, just check your dev tools and go to "Network tab".'),
    DOM.p({}, 'You will see that whole bundle for this very small todo app weights just around ', DOM.strong({}, '8KBs! (gziped just 4KBs)')),
    DOM.h2({}, 'What can it do?'),
    DOM.p({}, 'Well, not much. There is no DOM diffing so app tree is rerendered every time. However shouldComponentupdate decorator works well, so app is still fast'),
    DOM.p({}, 'And as you can see, routing works well either, but it does not support older browser. Well, I wanted to keep this library with no dependency...'),
    DOM.p({}, "For more info, check githup repo's ", DOM.a({ href: 'https://github.com/vojtatranta/supertiny-app-lib' }, 'README.md.'))
  )
}


const router = (state, services) => {
  const handler = services.components[state.location]
  if (handler) {
    return handler(state, services)
  } else {
    return services.components['!!NOT_FOUND!!'](state, services)
  }
}


const app = (state, services) => {

  return services.DOM.div({},
    router(
      state,
      Object.assign(services, {
        components: {
          '/': todos,
          '/about': about,
          '!!NOT_FOUND!!': todos
        }
      })
    )
  )
}


export default {
  todoItem,
  app
}
