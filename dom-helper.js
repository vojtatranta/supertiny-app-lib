
export default (doc, customRenderers = {}) => {

  const adjustKey = (key) => {
    if (key.toLowerCase() === 'classname') {
      key = 'class'
    }

    return key
  }

  const getCustomTypeRenderer = (renderers, type) => {
    const renderer = renderers[type]

    if (!Boolean(renderer)) {
      throw new Error(`No renderer specified for type ${type}.
        Pass customRenderers object with key of ${type} and function as value that is capable of rendering element type.`)
    }

    return renderer
  }

  const createEl = (tag, attrs, content, children) => {
    var el = doc.createElement(tag)
    if (attrs) {
      Object.keys(attrs).forEach(key => {
        if (typeof attrs[key] !== 'function') {
          el.setAttribute(adjustKey(key), attrs[key])
        } else {
          if (!el.events) {
            el.events = {}
          }
          el.events[key] = attrs[key]
          el.addEventListener(key, function(ev) {
            attrs[key](ev, this)
          })
        }
      })
    }

    if (content) {
      el.appendChild(
        doc.createTextNode(content))
    }

    if (children) {
      children.forEach((child, i) => {
        if (Array.isArray(child)) {
          child.map(subChild => {
            el.appendChild(subChild)
          })
        } else {
          if (Boolean(child['render_type'])) {
            const renderer = getCustomTypeRenderer(customRenderers, child['render_type'])
            el.appendChild(renderer(child, i))
          } else if (typeof child === 'string') {
            el.appendChild(doc.createTextNode(child))
          } else {
            el.appendChild(child)
          }
        }
      })
    }
    return el
  }

  var methods = {}
  new Array('span', 'a', 'p', 'div', 'h1', 'h2', 'h3', 'strong', 'li', 'ul', 'img', 'form', 'input', 'label', 'textarea', 'button').forEach(function(tagName) {
    methods[tagName] = function(attrs, content, children) {
      if (Array.isArray(content)) {
        children = content
        content = null
      } else if (typeof content !== 'string') {
        children = Array.prototype.slice.apply(arguments).slice(1, arguments.length)
        content = null
      } else if (typeof content === 'string') {
        children = Array.prototype.slice.apply(arguments).slice(2, arguments.length)
      }

      return createEl(tagName, attrs, content, children)
    }
  })


  return Object.create(Object.assign(doc, methods), { doc: {value: doc} })
}
