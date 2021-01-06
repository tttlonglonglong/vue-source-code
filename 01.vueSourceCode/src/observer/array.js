import { observe } from ".";

// 重写数组的方法, 拿到数组原型上的方法(原来的方法)
let oldArrayProtoMethods = Array.prototype;

// 继承一下  arrayMethods.__proto__ = oldArrayProtoMethods
export let arrayMethods = Object.create(oldArrayProtoMethods);

// 7个改变数组本身状态的方法
let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'reverse',
  'sort',
  'splice'
]

methods.forEach(method => {
  arrayMethods[method] = function (...args) {
    // 调用原来的方法
    const result = oldArrayProtoMethods[method].apply(this, args) // this就是observe里的value
    let inserted;
    let ob = this.__ob__;
    switch (method) {
      // method中有新增元素的方法，要观测新增的元素，新增的是对象类型，应该再次被劫持
      case 'push':
      case 'unshift':  // 这俩个方法都是追加
        inserted = args;
        break;
      case 'splice': // vue.$set的原理
        // 删除、添加、修改的功能都有，第3个参数才是新增的值
        inserted = args.slice(2); // arr.splice(0, 1, {a:1}) // 从第0个索引开始删除一个，新增一个对象
      default:
        break;
    }
    if (inserted) {
      // 通过ob 把新增的对象也进行代理
      ob.observeArray(inserted); // 给数组新增的值也要进行观测
    }
    return result
  }
})