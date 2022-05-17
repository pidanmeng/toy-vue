'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Computed {
    constructor(getter) {
        this._dirty = true;
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
    set value(_v) {
        console.warn(`target: ${this} 无法修改, 因为target是computed`, this);
    }
}
const computed = (cb) => {
    return new Computed(cb);
};

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

let activeEffect = null;
let shouldTrack = false;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
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
        var _a;
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                (_a = this.onStop) === null || _a === void 0 ? void 0 : _a.call(this);
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
const track = (target, key) => {
    if (!isTracking())
        return;
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
    if (dep.has(activeEffect))
        return;
    trackEffect(dep);
};
const trackEffect = (dep) => {
    if (!activeEffect)
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
};
function isTracking() {
    return shouldTrack && activeEffect;
}
const effect = (fn, options = {}) => {
    const effect = new ReactiveEffect(fn, options.scheduler);
    extend(effect, options);
    effect.run();
    const runner = effect.run.bind(effect);
    runner.effect = effect;
    return runner;
};
const trigger = (target, key) => {
    const depsMap = targetMap.get(target);
    if (!depsMap)
        return;
    const dep = depsMap.get(key);
    triggerEffect(dep);
};
const triggerEffect = (dep) => {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
};
const stop = (runner) => {
    runner.effect.stop();
};

const get = createGetter(), getReadonly = createGetter(true), getShallowReadonly = createGetter(true, true), set = createSetter();
function createGetter(isReadOnly = false, isShallow = false) {
    return function get(target, key) {
        if (key === exports.ReactiveFlags.IS_READONLY) {
            return isReadOnly;
        }
        else if (key === exports.ReactiveFlags.IS_REACTIVE) {
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
    };
}
const multipleHandler = {
    get,
    set,
};
const readonlyHandler = {
    get: getReadonly,
    set: function (target, key) {
        console.warn(`key: ${String(key)} 无法修改, 因为target是readonly`, target);
        return true;
    }
};
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: getShallowReadonly,
});

exports.ReactiveFlags = void 0;
(function (ReactiveFlags) {
    ReactiveFlags["IS_READONLY"] = "__v_isReadOnly";
    ReactiveFlags["IS_REACTIVE"] = "__v_isReactive";
    ReactiveFlags["IS_REF"] = "__v_isRef";
})(exports.ReactiveFlags || (exports.ReactiveFlags = {}));
function createActiveObject(raw, baseHandlers) {
    return new Proxy(raw, baseHandlers);
}
const reactive = (raw) => {
    return createActiveObject(raw, multipleHandler);
};
const readonly = (raw) => {
    return createActiveObject(raw, readonlyHandler);
};
const shallowReadonly = (raw) => {
    return createActiveObject(raw, shallowReadonlyHandler);
};
const isReadonly = (value) => {
    return Boolean(value[exports.ReactiveFlags.IS_READONLY]);
};
const isReactive = (value) => {
    return Boolean(value[exports.ReactiveFlags.IS_REACTIVE]);
};
const isProxy = (value) => {
    return isReadonly(value) || isReactive(value);
};

const convert = (value) => isObject(value) ? reactive(value) : value;
class Ref {
    constructor(raw) {
        this._dep = new Set();
        this._value = convert(raw);
    }
    get __v_isRef() {
        return true;
    }
    get value() {
        trackEffect(this._dep);
        return this._value;
    }
    set value(value) {
        if (Object.is(this._value, value))
            return;
        this._value = value;
        triggerEffect(this._dep);
    }
}
const ref = (raw) => {
    return new Ref(raw);
};
const isRef = (ref) => {
    return Boolean(ref[exports.ReactiveFlags.IS_REF]);
};
const unRef = (ref) => {
    return isRef(ref) ? ref.value : ref;
};
const proxyRefs = (objectWithRefs) => {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return Reflect.set(target[key], 'value', value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
};

function createComponentInstance(vNode) {
    const component = {
        vNode: vNode,
        type: vNode === null || vNode === void 0 ? void 0 : vNode.type,
        render: () => null,
    };
    return component;
}
function setupComponent(instance) {
    // TODO:
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // function / Object
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
    return instance;
}
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vNode, container) {
    patch(vNode, container);
}
function patch(vNode, container) {
    if (typeof vNode.type === "string") {
        processElement(vNode, container);
    }
    else if (isObject(vNode.type)) {
        processComponent(vNode, container);
    }
}
function processElement(vNode, container) {
    mountElement(vNode, container);
}
function mountElement(vNode, container) {
    const element = document.createElement(vNode.type);
    container.appendChild(element);
    const { props, children } = vNode;
    if (props) {
        for (const key in props) {
            element.setAttribute(key, props[key]);
        }
    }
    if (children) {
        if (typeof children === "string") {
            element.textContent = children;
        }
        else if (Array.isArray(children)) {
            mountChildren(vNode, element);
        }
    }
}
function mountChildren(vNode, container) {
    vNode.children.forEach(child => {
        patch(child, container);
    });
}
function processComponent(vNode, container) {
    mountComponent(vNode, container);
}
function mountComponent(vNode, container) {
    const instance = createComponentInstance(vNode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
}

function createVNode(type, props, children) {
    const vNode = {
        type,
        props,
        children,
    };
    return vNode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const vNode = createVNode(rootComponent);
            render(vNode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.ReactiveEffect = ReactiveEffect;
exports.Ref = Ref;
exports.computed = computed;
exports.createApp = createApp;
exports.effect = effect;
exports.h = h;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.shallowReadonly = shallowReadonly;
exports.stop = stop;
exports.track = track;
exports.trackEffect = trackEffect;
exports.trigger = trigger;
exports.triggerEffect = triggerEffect;
exports.unRef = unRef;
