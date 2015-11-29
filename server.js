const fs = require('fs')

const express = require('express')
const compress = require('compression')

const renderers = require('./renderers')
const createDom = require('./dom-helper')
const doc = require('./server/document')

const PROD = process.env.NODE_ENV == 'production'

const app = express()

app.use(compress())
app.use(express.static('./dist'))

var HTML = fs.readFileSync('./index.html', 'utf-8')

app.get('/', function(req, res) {
  const DOMHelper = createDom(doc)

  const state = {
    name: 'Vojta Tranta',
    email: 'vojta.tranta@gmail.com',
    todos: [
      {
        text: 'First todo',
        id: 'xyfd54584',
      },
      {
        text: 'Second todo',
        id: 'dsf55554'
      }
    ],
    selectedTodoId: null
  }

  res.send(
    HTML
    .replace('{APP}', renderers.app(DOMHelper, state).toString())
    .replace('{STATE}', JSON.stringify(state))
    .replace('{BUNDLE_PATH}', PROD ? '/generated/bundle.js' : '//localhost:9000/static/bundle.js')
    .replace('{STYLES_BUNDLE}', PROD ? '/generated/style.css' : '')
  )

})

const port = 3333
app.listen(port, () => console.log(`App is listening ${port}`))