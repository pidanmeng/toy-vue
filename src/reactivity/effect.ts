import { extend } from "../shared";

class ReactiveEffect {
  private _fn: any;
  private _scheduler: any;
  deps: any[] = [];
  active: boolean = true;
  onStop?: () => void;
  constructor(fn, public scheduler?) {
    this._fn = fn;
    this._scheduler = scheduler;
  }

  run() {
    return this._fn();
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      if (this.onStop) {
        this.onStop?.();
      }
      this.active = false;
    }
  }

}

function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach(dep => { 
    dep.delete(effect);
  })
};

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

  if (!activeEffect) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

let activeEffect: any = null;
export const effect = (fn, options: any = {}) => {
  const effect = new ReactiveEffect(fn, options.scheduler);
  extend(effect, options);
  activeEffect = effect;
  effect.run();
  const runner: any = effect.run.bind(effect);
  runner.effect = effect;
  return runner;
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

export const stop = (runner) => {
  runner.effect.stop();
}