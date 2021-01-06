export function proxy(vm, data, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[data][key]; // vm._data.a
    },
    set(newValue) { // vm.a = 100
      vm[data][key] = newValue // vm._data.a = 100
    }
  })
}

export function defineProperty(target, key, value) {
  Object.defineProperty(target, key, {
    enumerable: false, // 将此属性定义成不可枚举的,this.walk的时候，不会取到此属性
    configurable: false, // 此属性不可编辑
    value: value
    // 会不停的调用defineReactive，将__ob__变成响应式的，this上有__ob__，会无限递归
    // value.__ob__ = this //this是Observer实例， 自定义属性递归过程中，回去再去递归它的属性，会无限递归，不呢个这样写
  })
}