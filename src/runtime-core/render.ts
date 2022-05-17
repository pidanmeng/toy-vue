import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vNode, container) {
  patch(vNode, container);

}

function patch(vNode, container) {
  if (typeof vNode.type === "string") {
    processElement(vNode, container);
  } else if (isObject(vNode.type)) {
    processComponent(vNode, container);
  }
}

function processElement(vNode, container) {
  mountElement(vNode, container);
}

function mountElement(vNode, container) {
  const element = document.createElement(vNode.type);
  container.appendChild(element);
  const { props, children } = vNode;

  if (props) {
    for (const key in props) {
      element.setAttribute(key, props[key]);
    }
  }

  if (children) {
    if (typeof children === "string") {
      element.textContent = children;
    } else if (Array.isArray(children)) {
      mountChildren(vNode, element);
    }
  }
}

function mountChildren(vNode, container) {
  vNode.children.forEach(child => {
    patch(child, container);
  })
}

function processComponent(vNode, container) {
  mountComponent(vNode, container);
}

function mountComponent(vNode, container) {
  const instance = createComponentInstance(vNode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance, container) {
  const subTree = instance.render();

  patch(subTree, container);
}

