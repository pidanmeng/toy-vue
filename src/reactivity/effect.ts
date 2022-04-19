class ReactiveEffect {
  private _fn: any;
  private _scheduler: any;
  constructor(fn, public scheduler?) {
    this._fn = fn;
    this._scheduler = scheduler;
  }

  run() {
    return this._fn();
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
export const effect = (fn, options: any = {}) => {
  const effect = new ReactiveEffect(fn, options.scheduler);
  activeEffect = effect;
  effect.run();
  return effect.run.bind(effect);
};

export const trigger = (target, key) => {
  const deps = targetMap.get(target).get(key);
  for (const effect of deps) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }

}