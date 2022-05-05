import { multipleHandler, readonlyHandler, shallowReadonlyHandler } from './baseHandlers';

export enum ReactiveFlags { 
  IS_READONLY = '__v_isReadOnly',
  IS_REACTIVE = '__v_isReactive',
}

function createActiveObject(raw: any, baseHandlers) {
  return new Proxy(raw, baseHandlers);
}

export const reactive = (raw) => {
  return createActiveObject(raw, multipleHandler);
};

export const readonly = (raw) => {
  return createActiveObject(raw, readonlyHandler);
};

export const shallowReadonly = (raw) => {
  return createActiveObject(raw, shallowReadonlyHandler)
}

export const isReadonly = (value) => {
  return Boolean(value[ReactiveFlags.IS_READONLY]);
}

export const isReactive = (value) => {
  return Boolean(value[ReactiveFlags.IS_REACTIVE]);
}