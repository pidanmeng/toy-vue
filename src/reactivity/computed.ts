import { trackEffect, ReactiveEffect, effect } from '.';

class Computed {
  private _dirty: any = true;
  private _value: any;
  private _effect: ReactiveEffect;
  
  constructor(getter: () => void) {
    this._effect = new ReactiveEffect(getter, () => {
      this._dirty = true;
    });
  }
  get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
  set value(_v: any) {
    console.warn(`target: ${this} 无法修改, 因为target是computed`, this)
  }
}

export const computed = (cb) => {
  return new Computed(cb);
};