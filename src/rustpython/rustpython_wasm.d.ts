/* tslint:disable */
/* eslint-disable */
/**
*/
export function setup_console_error(): void;
/**
* Evaluate Python code
*
* ```js
* var result = pyEval(code, options?);
* ```
*
* `code`: `string`: The Python code to run in eval mode
*
* `options`:
*
* -   `vars?`: `{ [key: string]: any }`: Variables passed to the VM that can be
*     accessed in Python with the variable `js_vars`. Functions do work, and
*     receive the Python kwargs as the `this` argument.
* -   `stdout?`: `\"console\" | ((out: string) => void) | null`: A function to replace the
*     native print native print function, and it will be `console.log` when giving
*     `undefined` or \"console\", and it will be a dumb function when giving null.
* @param {string} source 
* @param {object | undefined} options 
* @returns {any} 
*/
export function pyEval(source: string, options?: object): any;
/**
* Evaluate Python code
*
* ```js
* pyExec(code, options?);
* ```
*
* `code`: `string`: The Python code to run in exec mode
*
* `options`: The options are the same as eval mode
* @param {string} source 
* @param {object | undefined} options 
*/
export function pyExec(source: string, options?: object): void;
/**
* Evaluate Python code
*
* ```js
* var result = pyExecSingle(code, options?);
* ```
*
* `code`: `string`: The Python code to run in exec single mode
*
* `options`: The options are the same as eval mode
* @param {string} source 
* @param {object | undefined} options 
* @returns {any} 
*/
export function pyExecSingle(source: string, options?: object): any;
export class VirtualMachine {
  free(): void;
/**
* @returns {boolean} 
*/
  valid(): boolean;
/**
*/
  assert_valid(): void;
/**
*/
  destroy(): void;
/**
* @param {string} name 
* @param {any} value 
*/
  addToScope(name: string, value: any): void;
/**
* @param {any} stdout 
*/
  setStdout(stdout: any): void;
/**
* @param {string} name 
* @param {string} source 
* @param {object | undefined} imports 
*/
  injectModule(name: string, source: string, imports?: object): void;
/**
* @param {string} name 
* @param {object} module 
*/
  injectJSModule(name: string, module: object): void;
/**
* @param {string} source 
* @param {string | undefined} source_path 
* @returns {any} 
*/
  exec(source: string, source_path?: string): any;
/**
* @param {string} source 
* @param {string | undefined} source_path 
* @returns {any} 
*/
  eval(source: string, source_path?: string): any;
/**
* @param {string} source 
* @param {string | undefined} source_path 
* @returns {any} 
*/
  execSingle(source: string, source_path?: string): any;
}
export class vmStore {
  free(): void;
/**
* @param {string} id 
* @param {boolean | undefined} inject_browser_module 
* @returns {VirtualMachine} 
*/
  static init(id: string, inject_browser_module?: boolean): VirtualMachine;
/**
* @param {string} id 
* @returns {any} 
*/
  static get(id: string): any;
/**
* @param {string} id 
*/
  static destroy(id: string): void;
/**
* @returns {any[]} 
*/
  static ids(): any[];
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly vmstore_init: (a: number, b: number, c: number) => number;
  readonly vmstore_get: (a: number, b: number) => number;
  readonly vmstore_destroy: (a: number, b: number) => void;
  readonly vmstore_ids: (a: number) => void;
  readonly __wbg_virtualmachine_free: (a: number) => void;
  readonly virtualmachine_valid: (a: number) => number;
  readonly virtualmachine_assert_valid: (a: number) => void;
  readonly virtualmachine_destroy: (a: number) => void;
  readonly virtualmachine_addToScope: (a: number, b: number, c: number, d: number) => void;
  readonly virtualmachine_setStdout: (a: number, b: number) => void;
  readonly virtualmachine_injectModule: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly virtualmachine_injectJSModule: (a: number, b: number, c: number, d: number) => void;
  readonly virtualmachine_exec: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly virtualmachine_eval: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly virtualmachine_execSingle: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly __wbg_vmstore_free: (a: number) => void;
  readonly setup_console_error: () => void;
  readonly pyEval: (a: number, b: number, c: number) => number;
  readonly pyExec: (a: number, b: number, c: number) => void;
  readonly pyExecSingle: (a: number, b: number, c: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__Fn__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3f09369dc380c325: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut__A_B___Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7777e73abdb83a24: (a: number, b: number, c: number, d: number) => number;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h9c965f94384cd6af: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h82d3134730edb485: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_start: () => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
        