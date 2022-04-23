import { multipleHandler, readonlyHandler } from './baseHandlers';

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export const reactive = (raw) => {
  return createActiveObject(raw, multipleHandler);
};

export const readonly = (raw) => {
  return createActiveObject(raw, readonlyHandler);
};
