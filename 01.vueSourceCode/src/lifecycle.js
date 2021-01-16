import { patch } from "./vdom/patch";
import Watcher from "./observer/watcher";
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    console.log('lifecycle---_update', vnode)
    const vm = this

    // 用新创建的元素 替换掉老的vm.$el
    vm.$el = patch(vm.$el, vnode)
  }
}


// 挂载节点
export function mountComponent(vm, el) {

  // 调用render方法去渲染 el属性
  // 先调用render方法创建虚拟节点，再将虚拟节点渲染到页面上
  callHook(vm, 'beforeMount')
  let updateComponent = () => {
    vm._update(vm._render());
  }
  // 这个watcher是用于渲染的 目前没有任何功能 updateComponent()
  // 初始化就会创建watcher
  let watcher = new Watcher(vm, updateComponent, () => {
    callHook(vm, 'beforeUpdate')
  }, true) // 渲染watcher 只是个名字
  // vm._update(vm._render());

  // 要把属性 和 watcher绑定在一起


  callHook(vm, 'mounted')
}


// callHook(vm, 'beforeCreate')
export function callHook(vm, hook) {
  const handlers = vm.$options[hook]; // vm.$options.created = [a1, a1, a3]
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm) // 更改生命周期中的this

    }
  }
}
