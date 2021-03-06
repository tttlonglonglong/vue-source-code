import { arrayMethods } from "./array";
import { defineProperty } from "../util.js";
import Dep from "./dep";

class Observer {
  constructor(value) {
    // 使用defineProperty 重新定义属性,
    // 判断一个对象是否被观测过，看他有没有 __ob__这个属性(Observer的实例)，__ob__自定义属性，用来描述对象被观测过了
    // 让其他地方能拿到实例的方法
    defineProperty(value, '__ob__', this)


    if (Array.isArray(value)) {
      // 判断值是不是数组，希望调用 push shift unshift splice sort reverse pop
      // 函数劫持、切片编程
      value.__proto__ = arrayMethods
      // 观测数组中的对象类型,对象变化也要做一些事
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  // 观测数组中的每一项
  observeArray(value) {
    value.forEach(item => {
      observe(item); // 观测数组中的对象类型
    })
  }
  // 观测对象上的每一项
  walk(data) {
    // 循环对象使用defineProperty进行定义
    let keys = Object.keys(data); // 获取对象的key
    keys.forEach(key => {
      // console.log('walk--data', data, 'key', key)
      defineReactive(data, key, data[key]); // Vue.util.defineReactive: 将数据定义成响应式的数据
    })

  }
}
// 封装 继承
// observe(newValue) => value=newValue ==> value=observve(newValue)
function defineReactive(data, key, value) {
  observe(value); // 如果观测的对象的值也是对象，再进行观测

  let dep = new Dep(); // 每个属性都有一个dep

  // 当页面取值的时，说明这个值用来渲染了，将这个watcher和这个属性对应起来
  Object.defineProperty(data, key, {
    get() {
      // console.log("用户获取值", key, value)
      if (Dep.target) { // target有值，说明正在渲染，让这个属性记住这个watcher
        // 取值的时候，收集依赖
        dep.depend()
      }
      return value
    },
    set(newValue) {
      // console.log("用户设置值", key, value)
      if (newValue == value) return;
      // data[key] = newValue; // 这样写会死循环，利用闭包就好了
      observe(newValue); // 如果用户将值改为对象，继续监控
      value = newValue

      // 赋值的时候，依赖更新
      dep.notify() // 异步更新， 防止频繁操作
    }
  })
  // console.log("defineReactive", 'data', data, 'key', key)
}

export function observe(data) {
  // console.log('observe-data', data)
  // 观测的数据不能不是对象，并且不是null
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  if (data.__ob__) {
    // 对象上有__ob__属性，已经被观测过了
    return data;
  }
  return new Observer(data)

  // 只观测存在的属性 data:{ a:1, b:2} vm.c = 3 vm.$set
  // 数组中更改索引和长度，无法被监控
  // vm.a = {a:1} // 赋值的是个对象，也会进行观测
  // 数组的$set用splice实现，对象就是重新 defineProperty
}