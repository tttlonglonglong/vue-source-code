import { mergeOptions } from "../util";
export function initGlobalApi(Vue) {
  Vue.options = {}; // Vue.components Vue.directive定义的这些属性，最终都会放在Vue.options
  Vue.mixin = function (mixin) {
    // 合并对象(先考虑生命周期，不考虑data computed watch)
    this.options = mergeOptions(this.options, mixin)
    // console.log('initGlobalApi--->mixin', this.options); // this.options = {created: [a, b]}
  }
  // new 的时候需要将Vue.options 和 new 传入的options 再合并
  // 用户 new Vue({create(){}})
} 