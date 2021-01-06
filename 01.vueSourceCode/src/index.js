import { initMixin } from './init'

// 老写法，原型方法方便分割在不同的文件中
function Vue(options) {
  // console.log('index.js--->options', options)
  this._init(options); // 入口方法，做初始化操作
}

// 扩展原型
initMixin(Vue)



export default Vue;

