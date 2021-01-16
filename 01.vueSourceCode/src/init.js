import Vue from ".";
import { initState } from "./state";
import { compileToFunctions } from "./compiler/index";
import { mountComponent, callHook } from "./lifecycle";
import { mergeOptions } from "./util";

// 扩展初始化功能
export function initMixin(Vue) {

  // 全局组件和局部组件的区别: 全局组件任何地方都能用

  Vue.prototype._init = function (options) {
    const vm = this;
    // vm.$options = mergeOptions(Vue.options, options); 
    vm.$options = mergeOptions(vm.constructor.options, options); // 需要将用户自定义的options 和全局的options做合并
    console.log('vm.$options', vm.$options)
    // 1.数据观测初始化(vue源码会先初始化事件和生命周期)
    // 初始化状态 (将数据做一个初始化的劫持，当改变数据时，应该更新视图)
    // vue组件中有很多状态 data props watch computed
    callHook(vm, 'beforeCreate')
    initState(vm)
    callHook(vm, 'created')
    // vue核心：响应式数据原理
    // MVVM：数据变化视图更新、视图变化影响数据(不能跳过数据更新视图)，$ref能实际直接操作dom

    // 2. ast树解析
    // 如果当前有el属性说明要渲染模板(el属性，等价于vm.$mount方法)
    if (vm.$options.el) {
      // 挂载的逻辑
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    // 挂载操作
    const vm = this;
    const options = vm.$options
    el = document.querySelector(el)
    vm.$el = el

    // debugger
    if (!options.render) {
      // 没render 将template转化成render方法, render方法优先级比template更高
      let template = options.template
      if (!template && el) {
        template = el.outerHTML
      }
      // 有el、有template才做编译的操作，将模板转换成为render函数
      // 编译原理 将模板编译成render函数，template => render方法
      // 1.处理模板变为ast树，2.标记静态节点，3.codegen=>return 字符串(把代码生成回js语法)，4.new Fucntion + with(render函数)
      const render = compileToFunctions(template)
      options.render = render
    }
    // 最终渲染时都是options.render方法
    console.log('最终渲染时都是options.render方法', options.render)
    // 需要挂载这个组件
    mountComponent(vm, el)
    // console.log('el', el)
  }
}