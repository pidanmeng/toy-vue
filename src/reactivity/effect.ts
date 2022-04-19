class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }

  run() {
    this._fn();
  }
}

const targetMap = new Map();
export const track = (target, key) => {
  let depMap = targetMap.get(target);
  if (!depMap) {
    depMap = new Map();
    targetMap.set(target, depMap);
  }
  let dep = depMap.get(key);
  if (!dep) {
    dep = new Set();
    depMap.set(key, dep);
  }
  if (activeEffect) {
    dep.add(activeEffect);
  }
}

let activeEffect: any = null;
export const effect = (fn) => {
  const effect = new ReactiveEffect(fn);
  activeEffect = effect;
  effect.run();
};

export const trigger = (target, key) => {
  const deps = targetMap.get(target).get(key);
  for (const effect of deps) {
    effect.run();
  }

}