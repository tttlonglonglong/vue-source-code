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

export const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed'
]
const strats = {}
strats.data = function (parentVal, childVal) {
  return childVal // 这里应该有合并data的策略
}
strats.computed = function (parentVal, childVal) {
  return childVal
}
strats.watch = function (parentVal, childVal) {
  return childVal
}

// 生命周期方法的合并
function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      return parentVal.concat(childVal) // 爸爸和儿子进行拼接
    } else {
      // 只有儿子有
      return [childVal] // 儿子转换成数组
    }
  } else {
    return parentVal; // 儿子无，不合并了，采用父亲的
  }
}
LIFECYCLE_HOOKS.forEach(hook => {
  // 生命周期方法的合并
  strats[hook] = mergeHook
})
// 全局mixin是父，new Vue传的options是子
export function mergeOptions(parent = {}, child) {
  // console.log('mergeOptions---parent', parent)
  // 遍历父亲，可能是父亲有 儿子没有
  const options = {}
  for (let key in parent) { // 父亲和儿子都有在这就处理了
    console.log('mergeOptions---1', key)
    mergeField(key)
  }

  // 儿子有父亲没有 在这处理
  for (let key in child) { // 将儿子多的赋予到父亲上
    if (!parent.hasOwnProperty(key)) {
      console.log('mergeOptions---2', key)
      mergeField(key)
    }
  }

  function mergeField(key) { // 合并字段
    // console.log('mergeField', mergeField)
    // 根据key 不同的策略来进行合并
    // {...parent[key] }
    if (strats[key]) {
      // 直接调策略中的合并方法，mergeHook
      options[key] = strats[key](parent[key], child[key])
    } else {
      // 默认合并, 局部的覆盖全局的
      options[key] = child[key]
    }

  }

  return options
}