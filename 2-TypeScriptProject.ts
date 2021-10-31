export interface dispatchMethod<T> {
  dispatch(scenario: T): Promise<T>;
}
export interface errFuncInterface {
  (storeBefore: any, step: any, result?: any): object;
}
export interface errFuncInterface2 {
  (sb: any, step: any, res?: any): null;
}
