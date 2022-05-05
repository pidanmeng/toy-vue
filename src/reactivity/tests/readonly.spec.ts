import { isReadonly, readonly } from "../reactive";

describe('readonly', () => {
  it('happy path', () => {
    console.warn = jest.fn();
    const original = { foo: 1 };
    const readonlyObj = readonly(original);
    readonlyObj.foo = 2;
    expect(console.warn).toBeCalled();
    expect(isReadonly(readonlyObj)).toBe(true);
    expect(isReadonly(original)).toBe(false);
  })
})