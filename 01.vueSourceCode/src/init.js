import Vue from ".";
import { initState } from "./state";
import { compileToFunctions } from "./compiler/index";

// 扩展初始化功能
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;
    // 1.数据观测初始化(vue源码会先初始化事件和生命周期)
    // 初始化状态 (将数据做一个初始化的劫持，当改变数据时，应该更新视图)
    // vue组件中有很多状态 data props watch computed
    initState(vm)
    // vue核心：响应式数据原理
    // MVVM：数据变化视图更新、视图变化影响数据(不能跳过数据更新视图)，$ref能实际直接操作dom

    // 2. ast树解析
    // 如果当前有el属性说明要渲染模板(el属性，等价于vm.$mount方法)
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    // 挂载操作
    const vm = this;
    const options = vm.$options
    el = document.querySelector(el)
    // debugger
    if (!options.render) {
      // 没render 将template转化成render方法
      let template = options.template
      if (!template && el) {
        template = el.outerHTML
      }
      // 有el、有template才做编译的操作，将模板转换成为render函数
      // 编译原理 将模板编译成render函数
      const render = compileToFunctions(template)
      options.render = render
    }
    console.log('最终渲染时都是options.render方法', options.render)
    // render方法优先级比template更高
    console.log('el', el)
  }
}