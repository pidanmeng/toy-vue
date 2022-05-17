import { render } from './render';
import { createVNode } from './vNode';

export function createApp(rootComponent) {
  

  return {
    mount(rootContainer: string) {
      const vNode = createVNode(rootComponent);
      render(vNode, rootContainer);
    }
  }
}