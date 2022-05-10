import { trackEffect, ReactiveEffect, effect } from '.';

class Computed {
  private _dep = new Set();
  private _dirty: any = true;
  private _value: any;
  private _effect: ReactiveEffect;
  
  constructor(getter: () => void) {
    this._effect = new ReactiveEffect(getter, () => {
      this._dirty = true;
    });
    trackEffect(this._dep);
  }
  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export const computed = (cb) => {
  return new Computed(cb);
};