import { reactive, ReactiveFlags } from './index';
import { isObject } from '../shared';
import { trackEffect, triggerEffect } from './effect';

const convert = (value) => isObject(value) ? reactive(value) : value;

export class Ref {

  _value;
  _dep = new Set();
  constructor(raw) {
    this._value = convert(raw);
  }
  get __v_isRef() {
    return true
  }
  get value() {
    trackEffect(this._dep);
    return this._value;
  }
  set value(value: any) {
    if(Object.is(this._value, value)) return;
    this._value = value;
    triggerEffect(this._dep);
  }
}

export const ref = (raw) => {
  return new Ref(raw)
}

export const isRef = (ref) => {
  return Boolean(ref[ReactiveFlags.IS_REF]);
}

export const unRef = (ref) => {
  return isRef(ref) ? ref.value : ref;
}

export const proxyRefs = (objectWithRefs) => {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return Reflect.set(target[key], 'value', value);
      } else {
        return Reflect.set(target, key, value);
      }
    }
  })
}