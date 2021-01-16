export default class Dep {
  constructor() {
    this.subs = []
  }
  // get： 获取值，收集依赖，所有已经使用了的属性
  depend() {
    this.subs.push(Dep.target)
  }
  // set：设置值的时候
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}

Dep.target = null // 静态属性，就一份
export function pushTarget(watcher) {
  Dep.target = watcher // 保留watcher
}

export function popTarget() {
  Dep.target = null // 将变量删除
}
// 多对多的关系，一个属性有一个dep,每个属性都有一个dep，dep是用来收集watcher的
// dep 可以存多个watcher vm.$watch也会产生一个watch，vm.$watch('name')
// 一个watcher可以对应多个dep，渲染页面的watcher可以有多个属性既有name、又有age 
// 默认渲染的时候时候，都是渲染watcher 还可能用户定义vm.$watch('name')方法，都会存在dep里面