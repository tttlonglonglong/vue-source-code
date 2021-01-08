export function renderMixin(Vue) { // 创建虚拟dom，用对象来描述dom的解构
  Vue.prototype._c = function () { // 创建虚拟dom元素
    return createElement(...arguments);
  }
  Vue.prototype._s = function (val) { // stringify
    return val == null ? '' : (typeof val == 'object') ? JSON.stringify(val) : val;
  }
  Vue.prototype._v = function (text) { // 创建虚拟dom文本元素
    return createTextVnode(text)
  }
  Vue.prototype._render = function () { // _render = render
    const vm = this
    const render = vm.$options.render
    let vnode = render.call(vm)
    console.log('vdom/index/_render--vnode', vnode)
    return vnode;
  }
}

// _c('div', {}, 1,2,3)
function createElement(tag, data = {}, ...children) {
  console.log('createElement-arguments', arguments)
  return vnode(tag, data, data.key, children)

}
function createTextVnode(text) {
  console.log('createTextVnode-arguments', arguments)
  return vnode(undefined, undefined, undefined, undefined, text)
}

// 用来产生虚拟dom的,ast是根据原代码转换出来的，不会有一些不存在的属性，虚拟dom可以加一些自定义属性
function vnode(tag, data, key, children, text) {
  return {
    tag,
    data,
    key,
    children,
    text,
    componentsInstance: '',
    slot: ''
  }
}