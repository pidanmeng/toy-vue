import { isReadOnly, readonly } from "../reactive";

describe('readonly', () => {
  it('happy path', () => {
    console.warn = jest.fn();
    const original = { foo: 1 };
    const readonlyObj = readonly(original);
    readonlyObj.foo = 2;
    expect(console.warn).toBeCalled();
    expect(isReadOnly(readonlyObj)).toBe(true);
    expect(isReadOnly(original)).toBe(false);
  })
})