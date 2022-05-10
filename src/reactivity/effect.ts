import { extend } from "../shared";

let activeEffect: any = null;
let shouldTrack: boolean = false;
export class ReactiveEffect {
  deps: any[] = [];
  active: boolean = true;
  onStop?: () => void;
  constructor(public fn, public scheduler?) {
  }

  run() {
    activeEffect = this;
    if (!this.active) {
      return this.fn();
    }

    shouldTrack = true;
    const result = this.fn();
    shouldTrack = false;
    activeEffect = null;

    return result;
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
  effect.deps.length = 0;
};

const targetMap = new Map();
export const track = (target, key) => {
  if (!isTracking()) return;

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

  if (dep.has(activeEffect)) return;

  trackEffect(dep);
}

export const trackEffect = (dep) => {
  if(!activeEffect) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function isTracking() {
  return shouldTrack && activeEffect;
}

export const effect = (fn, options: any = {}) => {
  const effect = new ReactiveEffect(fn, options.scheduler);
  extend(effect, options);
  effect.run();
  const runner: any = effect.run.bind(effect);
  runner.effect = effect;
  return runner;
};

export const trigger = (target, key) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  triggerEffect(dep);
}

export const triggerEffect = (dep) => {
  for (const effect of dep) {
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