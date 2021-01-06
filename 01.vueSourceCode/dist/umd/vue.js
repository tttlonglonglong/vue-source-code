(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('.')) :
  typeof define === 'function' && define.amd ? define(['.'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var oldArrayProtoMethods = Array.prototype; // 继承一下  arrayMethods.__proto__ = oldArrayProtoMethods

  var arrayMethods = Object.create(oldArrayProtoMethods); // 7个改变数组本身状态的方法

  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 调用原来的方法
      var result = oldArrayProtoMethods[method].apply(this, args); // this就是observe里的value

      var inserted;
      var ob = this.__ob__;

      switch (method) {
        // method中有新增元素的方法，要观测新增的元素，新增的是对象类型，应该再次被劫持
        case 'push':
        case 'unshift':
          // 这俩个方法都是追加
          inserted = args;
          break;

        case 'splice':
          // vue.$set的原理
          // 删除、添加、修改的功能都有，第3个参数才是新增的值
          inserted = args.slice(2);
      }

      if (inserted) {
        // 通过ob 把新增的对象也进行代理
        ob.observeArray(inserted); // 给数组新增的值也要进行观测
      }

      return result;
    };
  });

  function proxy(vm, data, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[data][key]; // vm._data.a
      },
      set: function set(newValue) {
        // vm.a = 100
        vm[data][key] = newValue; // vm._data.a = 100
      }
    });
  }
  function defineProperty(target, key, value) {
    Object.defineProperty(target, key, {
      enumerable: false,
      // 将此属性定义成不可枚举的,this.walk的时候，不会取到此属性
      configurable: false,
      // 此属性不可编辑
      value: value // 会不停的调用defineReactive，将__ob__变成响应式的，this上有__ob__，会无限递归
      // value.__ob__ = this //this是Observer实例， 自定义属性递归过程中，回去再去递归它的属性，会无限递归，不呢个这样写

    });
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      // 使用defineProperty 重新定义属性,
      // 判断一个对象是否被观测过，看他有没有 __ob__这个属性(Observer的实例)，__ob__自定义属性，用来描述对象被观测过了
      // 让其他地方能拿到实例的方法
      defineProperty(value, '__ob__', this);

      if (Array.isArray(value)) {
        // 判断值是不是数组，希望调用 push shift unshift splice sort reverse pop
        // 函数劫持、切片编程
        value.__proto__ = arrayMethods; // 观测数组中的对象类型,对象变化也要做一些事

        this.observeArray(value);
      } else {
        this.walk(value);
      }
    } // 观测数组中的每一项


    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(value) {
        value.forEach(function (item) {
          observe(item); // 观测数组中的对象类型
        });
      } // 观测对象上的每一项

    }, {
      key: "walk",
      value: function walk(data) {
        // 循环对象使用defineProperty进行定义
        var keys = Object.keys(data); // 获取对象的key

        keys.forEach(function (key) {
          // console.log('walk--data', data, 'key', key)
          defineReactive(data, key, data[key]); // Vue.util.defineReactive: 将数据定义成响应式的数据
        });
      }
    }]);

    return Observer;
  }(); // 封装 继承
  // observe(newValue) => value=newValue ==> value=observve(newValue)


  function defineReactive(data, key, value) {
    observe(value); // 如果观测的对象的值也是对象，再进行观测

    Object.defineProperty(data, key, {
      get: function get() {
        console.log("用户获取值", key, value);
        return value;
      },
      set: function set(newValue) {
        console.log("用户设置值", key, value);
        if (newValue == value) return; // data[key] = newValue; // 这样写会死循环，利用闭包就好了

        observe(newValue); // 如果用户将值改为对象，继续监控

        value = newValue;
      }
    }); // console.log("defineReactive", 'data', data, 'key', key)
  }

  function observe(data) {
    // console.log('observe-data', data)
    // 观测的数据不能不是对象，并且不是null
    if (_typeof(data) !== 'object' || data === null) {
      return data;
    }

    if (data.__ob__) {
      // 对象上有__ob__属性，已经被观测过了
      return data;
    }

    return new Observer(data);
  }

  function initState(vm) {
    // vm.$options
    // console.log('state.js-->vm', vm)
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    // 数据的初始化操作
    var data = vm.$options.data; // vm能达到观测后的data

    vm._data = data = typeof data == 'function' ? data.call(vm) : data; // console.log('initData--->', data)
    // 当去vm上取属性时，将属性的取值代理到vm._data上，取值时不用通过vm._data.arr去取

    for (var key in data) {
      proxy(vm, '_data', key);
    } // 数据的劫持劫持方案 对象object.defineProperty
    // 数组 单独处理的


    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 初始化状态 (将数据做一个初始化的劫持，当改变数据时，应该更新视图)
      // vue组件中有很多状态 data props watch computed

      initState(vm); // vue核心：响应式数据原理
      // MVVM：数据变化视图更新、视图变化影响数据(不能跳过数据更新视图)，$ref能实际直接操作dom
    };
  }

  function Vue(options) {
    // console.log('index.js--->options', options)
    this._init(options); // 入口方法，做初始化操作

  } // 扩展原型


  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
