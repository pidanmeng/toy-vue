export function createComponentInstance(vNode) {
  const component = {
    vNode: vNode,
    type: vNode.type,
    render: () => null,
  };
  return component;
}

export function setupComponent(instance) {
  // TODO:
  // initProps()
  // initSlots()

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance) {
  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    // function / Object
    const setupResult = setup();

    handleSetupResult(instance, setupResult)
  }
  return instance;
}

function handleSetupResult(instance, setupResult) {
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult;
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (Component.render) {
   instance.render = Component.render 
  }
}
