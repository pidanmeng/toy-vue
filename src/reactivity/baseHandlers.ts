import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

const
  get = createGetter(),
  getReadonly = createGetter(true),
  set = createSetter();

function createGetter(isReadOnly: boolean = false) { 
  return function get(target, key) {

    if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly;
    } else if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly;
    }

    const res = Reflect.get(target, key);

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