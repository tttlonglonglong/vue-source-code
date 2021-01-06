import Vue from ".";
import { initState } from "./state";

// 扩展初始化功能
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;

    // 初始化状态 (将数据做一个初始化的劫持，当改变数据时，应该更新视图)
    // vue组件中有很多状态 data props watch computed
    initState(vm)


    // vue核心：响应式数据原理
    // MVVM：数据变化视图更新、视图变化影响数据(不能跳过数据更新视图)，$ref能实际直接操作dom
  }
}