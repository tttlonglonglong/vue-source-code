import { observe } from "./observer/index";
import { proxy } from "./util.js";
// 响应式状态初始化
export function initState(vm) { // vm.$options
  // console.log('state.js-->vm', vm)
  const opts = vm.$options;
  if (opts.props) {
    initProps(vm)
  }
  if (opts.methods) {
    initMethods(vm)
  }
  if (opts.data) {
    initData(vm)
  }
  if (opts.computed) {
    initComputed(vm)
  }
  if (opts.watch) {
    initWatch(vm)
  }
}

function initProps() { }
function initMethods() { }

function initData(vm) { // 数据的初始化操作
  let data = vm.$options.data
  // vm能达到观测后的data
  vm._data = data = typeof data == 'function' ? data.call(vm) : data;
  // console.log('initData--->', data)
  // 当去vm上取属性时，将属性的取值代理到vm._data上，取值时不用通过vm._data.arr去取
  for (let key in data) {
    proxy(vm, '_data', key)
  }
  // 数据的劫持劫持方案 对象object.defineProperty
  // 数组 单独处理的
  observe(data)
}
function initComputed() { }
function initWatch() { }