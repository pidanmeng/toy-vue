import { effect, reactive, stop } from '..';

describe('effect', () => {

  // happy path
  it('happy path', () => {
    const user = reactive({
      age: 10,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    // update
    user.age++;
    expect(nextAge).toBe(12);
  });

  // should return runner when call effect
  it('should return runner when call effect', () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return 'bar';
    });
    expect(foo).toBe(11);
    const res = runner();
    expect(foo).toBe(12);
    expect(res).toBe('bar');
  });

  // effect scheduler
  it('scheduler', () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    //should be called on first trigger
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    ///should not run yet
    expect(dummy).toBe(1);
    ///manually run
    run();
    ///should have run
    expect(dummy).toBe(2);
  });

  // effect stop
  it('stop', () => {
    let dummy;
    const object = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = object.prop;
    });
    object.prop = 2;
    expect(dummy).toBe(2);

    stop(runner);
    object.prop++;
    expect(dummy).toBe(2);

    runner();
    expect(dummy).toBe(3);
  });

  // effect onStop
  it('onStop', () => {
    const object = reactive({ prop: 1 });
    let dummy;
    const onStop = jest.fn();
    const runner = effect(() => {
      dummy = object.prop;
    }, {
      onStop,
    })
    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  })
})