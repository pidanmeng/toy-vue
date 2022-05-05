import { extend, isObject } from "../shared";
import { track, trigger } from "./effect";
import { readonly, reactive, ReactiveFlags } from "./reactive";

const
  get = createGetter(),
  getReadonly = createGetter(true),
  getShallowReadonly = createGetter(true, true),
  set = createSetter();

function createGetter(isReadOnly: boolean = false, isShallow: boolean = false) { 
  return function get(target, key) {

    if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    }

    const res = Reflect.get(target, key);

    if (isShallow) {
      return res;
    }

    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res);
    }

    if (!isReadOnly) {
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  }
}

export const multipleHandler = {
  get,
  set,
}

export const readonlyHandler = {
  get: getReadonly,
  set: function (target, key) {
    console.warn(`key: ${String(key)} 无法修改, 因为target是readonly`, target);
    return true;
  }
}

export const shallowReadonlyHandler = extend({}, readonlyHandler, {
  get: getShallowReadonly,
})