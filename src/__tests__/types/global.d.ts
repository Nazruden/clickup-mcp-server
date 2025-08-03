import "jest";
import { SuperTest, Test } from "supertest";

declare global {
  namespace jest {
    interface Matchers<R> {
      toContainObject(object: any): R;
    }
  }

  // Define TestApp as the return type of supertest
  type TestApp = SuperTest<Test>;
}

// Augment the supertest module
declare module "supertest" {
  interface SuperTest<T extends Test> {
    (app: any): SuperTest<T>;
  }
}

export {};
