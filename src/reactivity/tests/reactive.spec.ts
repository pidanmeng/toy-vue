import { reactive, readonly } from '../reactive';

describe('reactive', () => {

  // happy path
  it('happy path', () => {
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
  });

  // readonly
  it('readonly', () => {
    console.warn = jest.fn();
    const original = { foo: 1 };
    const readonlyObj = readonly(original);
    readonlyObj.foo = 2;
    expect(console.warn).toBeCalled();
  })
})