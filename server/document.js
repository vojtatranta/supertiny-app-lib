var singlElements = ['img']

var allowedKeys = ['onClick', 'onKeyDown', 'onKeyPress', 'onBlur', 'onFocus', 'onKeyUp']

const element = (tag) => {
  var children = []
  var attrs = {}
  return {
    innerHTML: '',

    toString: function() {
      return `<${tag}${this.getAttrs()}>${children.map((child) => child.toString()).join('')}</${tag}>`
    },

    getAttrs: function() {
      var ret = []
      Object.keys(attrs).forEach(key => {
        var value = attrs[key]
        if (key.toLowerCase() == 'classname') {
          value = String(attrs[key])
          key = 'class'
        }

        ret.push(`${key}="${value}"`)
      })
      if (ret.length > 0) {
        return ` ${ret.join(' ')}`
      }
      return ''
    },

    appendChild: function(child) {
      children.push(child)
    },

    setAttribute(key, value) {
      attrs[key] = value
    }
  }
}


module.exports = {
  createElement(tag) {
    return element(tag)
  },

  createTextNode(text) {
    return text
  },
}
