export function areSameShallow(lastProps, props) {

  if (lastProps === props) {
    return true
  }

  if (Object.keys(lastProps).length === 0 && Object.keys(props) === 0) {
    return true
  }

  return Object.keys(props).every(key => {
    return lastProps[key] === props[key]
  })
}


// NOTE: every call to shouldComponentUpdate function mas have an unique ID
var counter = 0

export default function shouldComponentUpdate(component) {
  var lastInstancesProps = {},
      renderedComponentInstances = {}

  counter++
  return (...args) => {

    return {
      render_type: 'SHOULD_COMPONENT_UPDATE',
      id: String(counter),
      component(componentIdentifier) {
        let lastProps = lastInstancesProps[componentIdentifier]
        let renderedComponentInstance = renderedComponentInstances[componentIdentifier]
        let props = args[0]

        if (!lastProps || !renderedComponentInstance || !areSameShallow(lastProps, props)) {
          lastInstancesProps[componentIdentifier] = props
          renderedComponentInstances[componentIdentifier] = component(...args)
          return renderedComponentInstances[componentIdentifier]
        } else {
          return renderedComponentInstance
        }
      }
    }
  }
}
