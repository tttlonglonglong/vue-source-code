let id = 0
import { pushTarget, popTarget } from "./dep";
class Watcher { // vm.$watch
  // vm实例
  // exprOrFn vm._update(vm._render())
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.cb = cb
    this.options = options
    this.id = id++; // watcher的唯一标识

    if (typeof exprOrFn === 'function') {
      this.getter = exprOrFn
    }

    this.get() // 默认会调用get方法
  }

  get() {
    // Dep.target = watcher
    pushTarget(this) // 当前watcher实例
    this.getter() // 调用exprOrFn  渲染页面 取值(执行了get方法)  render方法 with(vm){msg}
    popTarget()
  }
  update() {
    this.get() // 重新渲染
  }
}


export default Watcher

// 在数据劫持的时候 定义defineProperty 的时候， 已经给每个属性都增加了一个dep

// 找到属性--->对应的watcher，渲染watcher在lifeCycle的update的时候创建
// 1.先把这个渲染watcher 放到了Dep.target属性上，
// 2.开始渲染 取值会调用get方法，需要让这个属性的dep 存储当前的watcher
// 3.页面上所需要的属性都会将这个watcher存在自己的dep中
// 4.等会属性更新了，就重新调用渲染逻辑 通知自己存储的watcher来更新