const fs = require('fs')

const express = require('express')
const compress = require('compression')

const renderers = require('./components/renderers')
const createDom = require('./dom-helper')
const doc = require('./server/document')

const PROD = process.env.NODE_ENV === 'production'

const app = express()

app.use(compress())
app.use(express.static('./dist'))

var HTML = fs.readFileSync('./server_index.html', 'utf-8')

app.get('*', function(req, res) {
  const DOMHelper = createDom(doc)

  const state = require('./initial-state.js')

  res.send(
    HTML
    .replace('{APP}', '')
    .replace('{STATE}', JSON.stringify(state))
    .replace('{BUNDLE_PATH}', PROD ? '/bundle.js' : '//localhost:9000/bundle.js')
    .replace('{STYLES_BUNDLE}', PROD ? '/style.css' : '')
  )

})

const port = 3333
app.listen(port, () => console.log(`App is listening ${port}`))
