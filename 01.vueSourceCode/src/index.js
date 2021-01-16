import { initMixin } from './init'
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vdom/index";
import { initGlobalApi } from "./global-api/index";
// 老写法，原型方法方便分割在不同的文件中

// 用Vue的构造函数，创建组件
function Vue(options) {
  // console.log('index.js--->options', options)
  this._init(options); // 组件初始化的入口，入口方法，做初始化操作
}

// 原型方法，扩展原型
initMixin(Vue) // init方法
lifecycleMixin(Vue) // 混合生命周期 _update更新渲染和组件挂载(不是vue的生命周期create那些)
renderMixin(Vue) // _render

// 静态方法 Vue.component Vue.directive Vue.extend Vue.mixin ...
initGlobalApi(Vue)

export default Vue;

