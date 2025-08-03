import "@types/jest";

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainObject(object: any): R;
    }
  }
}
