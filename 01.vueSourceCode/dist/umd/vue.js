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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
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
  var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed'];
  var strats = {};

  strats.data = function (parentVal, childVal) {
    return childVal; // 这里应该有合并data的策略
  };

  strats.computed = function (parentVal, childVal) {
    return childVal;
  };

  strats.watch = function (parentVal, childVal) {
    return childVal;
  }; // 生命周期方法的合并


  function mergeHook(parentVal, childVal) {
    if (childVal) {
      if (parentVal) {
        return parentVal.concat(childVal); // 爸爸和儿子进行拼接
      } else {
        // 只有儿子有
        return [childVal]; // 儿子转换成数组
      }
    } else {
      return parentVal; // 儿子无，不合并了，采用父亲的
    }
  }

  LIFECYCLE_HOOKS.forEach(function (hook) {
    // 生命周期方法的合并
    strats[hook] = mergeHook;
  }); // 全局mixin是父，new Vue传的options是子

  function mergeOptions() {
    var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var child = arguments.length > 1 ? arguments[1] : undefined;
    // console.log('mergeOptions---parent', parent)
    // 遍历父亲，可能是父亲有 儿子没有
    var options = {};

    for (var key in parent) {
      // 父亲和儿子都有在这就处理了
      console.log('mergeOptions---1', key);
      mergeField(key);
    } // 儿子有父亲没有 在这处理


    for (var _key in child) {
      // 将儿子多的赋予到父亲上
      if (!parent.hasOwnProperty(_key)) {
        console.log('mergeOptions---2', _key);
        mergeField(_key);
      }
    }

    function mergeField(key) {
      // 合并字段
      // console.log('mergeField', mergeField)
      // 根据key 不同的策略来进行合并
      // {...parent[key] }
      if (strats[key]) {
        // 直接调策略中的合并方法，mergeHook
        options[key] = strats[key](parent[key], child[key]);
      } else {
        // 默认合并, 局部的覆盖全局的
        options[key] = child[key];
      }
    }

    return options;
  }

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.subs = [];
    } // get： 获取值，收集依赖，所有已经使用了的属性


    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        this.subs.push(Dep.target);
      } // set：设置值的时候

    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();
  Dep.target = null; // 静态属性，就一份

  function pushTarget(watcher) {
    Dep.target = watcher; // 保留watcher
  }
  function popTarget() {
    Dep.target = null; // 将变量删除
  } // 多对多的关系，一个属性有一个dep,每个属性都有一个dep，dep是用来收集watcher的
  // dep 可以存多个watcher vm.$watch也会产生一个watch，vm.$watch('name')
  // 一个watcher可以对应多个dep，渲染页面的watcher可以有多个属性既有name、又有age 
  // 默认渲染的时候时候，都是渲染watcher 还可能用户定义vm.$watch('name')方法，都会存在dep里面

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

    var dep = new Dep(); // 每个属性都有一个dep
    // 当页面取值的时，说明这个值用来渲染了，将这个watcher和这个属性对应起来

    Object.defineProperty(data, key, {
      get: function get() {
        // console.log("用户获取值", key, value)
        if (Dep.target) {
          // target有值，说明正在渲染，让这个属性记住这个watcher
          // 取值的时候，收集依赖
          dep.depend();
        }

        return value;
      },
      set: function set(newValue) {
        // console.log("用户设置值", key, value)
        if (newValue == value) return; // data[key] = newValue; // 这样写会死循环，利用闭包就好了

        observe(newValue); // 如果用户将值改为对象，继续监控

        value = newValue; // 赋值的时候，依赖更新

        dep.notify(); // 异步更新， 防止频繁操作
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

    return new Observer(data); // 只观测存在的属性 data:{ a:1, b:2} vm.c = 3 vm.$set
    // 数组中更改索引和长度，无法被监控
    // vm.a = {a:1} // 赋值的是个对象，也会进行观测
    // 数组的$set用splice实现，对象就是重新 defineProperty
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


    observe(data); // 让这个对象重新定义set 和 get，重写耗一些性能、对象里面套对象会去递归
  }

  // src/core/util/lang.js
  var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/; // src/compiler/parser/html-parser.js
  // Regular Expressions for parsing tags and attributes

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性，aaa="aaa" | aaa='aaa' | aaa=aaa
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z".concat(unicodeRegExp.source, "]*"); // 标签名: aaa-123aa
  // ?:匹配不捕获

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // 捕获标签 <my:xxx></my:xxx>

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获内容是标签名，开始标签部分，不包含开始标签的结尾。如 <div class="className" ></div>，匹配的是 '<div class="className"'

  var startTagClose = /^\s*(\/?)>/; // 匹配 > 标签 或者/> <div> <br/> 开始标签的结尾部分。如 <div class="className" ></div>，匹配的是 ' >'

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // '</div><p></p>' 匹配结果为 </div>
  function parseHTML(html) {
    // 数据结构树 树、栈
    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        // 标签名
        type: 1,
        // 元素类型
        children: [],
        // 孩子列表
        attrs: attrs,
        // 属性列表
        parent: null // 父元素

      };
    }

    var root; // 根节点

    var currentParent; // 当前节点

    var stack = []; // 存储标签的栈，用来判断栈是否符合预期
    // 解析开始标签,并校验标签是否符合预期 <div><span></span></div> [div, span]

    function start(tagName, attrs) {
      // console.log('开始标签', 'tagName', tagName, 'attrs', attrs)
      var element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element; // 当前解析的标签 保存起来

      stack.push(element); // 将生成的ast元素放到栈中
    } // 解析结束标签(标签闭合的时候，才确定父子关系)


    function end(tagName) {
      // console.log('结束标签-tagName', tagName)
      // 在结尾标签处创建父子关系
      var element = stack.pop(); // 取出栈中的最后一个
      // <div><p></p> hello </div> [div, p] currentParent=p, 取出p后，currentParent就是div

      currentParent = stack[stack.length - 1];

      if (currentParent) {
        // 在闭合时，取出标签，可以知道取出这个标签的父亲是谁
        element.parent = currentParent;
        currentParent.children.push(element);
      }
    } // 解析文本


    function chars(text) {
      // console.log('解析文本-text', text, "currentParent", currentParent)
      text = text.replace(/\s/g, ''); // 去空格

      if (text) {
        currentParent.children.push({
          type: 3,
          // 文本类型用3
          text: text
        });
      }
    }

    while (html) {
      // 只要html不为空字符串，就一直解析
      var textEnd = html.indexOf('<'); // 匹配到了标签的 "<"

      if (textEnd == 0) {
        // v-bind v-on <!DOCTYPE <!---->  <br/> 
        //  肯定是标签
        var startTagMatch = parseStartTag(); // 开始标签匹配的结果

        if (startTagMatch) {
          // 处理开始标签
          start(startTagMatch.tagName, startTagMatch.attrs);
        } // console.log("匹配掉一个开始标签之后---html", html)


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          // 处理结束标签
          advance(endTagMatch[0].length);
          end(endTagMatch[1]); // 将结束标签传入

          continue;
        } // break;

      }

      var text = 0;

      if (textEnd >= 0) {
        // 处理文本
        text = html.substring(0, textEnd);
      }

      if (text) {
        // 处理文本
        advance(text.length);
        chars(text); // console.log('html--->text', html)
      } // break;

    } // 将匹配过的字符串进行截取操作，再进行更新html


    function advance(n) {
      html = html.substring(n);
    } // 解析标签


    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        // console.log(html, '匹配到的开始标签', start)
        var match = {
          tagName: start[1],
          attrs: []
        }; // console.log("match", match)

        advance(start[0].length); // 已经进行过匹配到的开始标签，删除掉
        // console.log('删除后的html', html)
        // 如果是闭合标签，说明没有属性

        var _end;

        var attr; // 不是单标签，且能匹配到属性

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // console.log('attr--->', attr)
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length); // 去掉当前已经匹配掉的属性
          // console.log('match.attrs', match.attrs)
          // break;
        } // console.log('匹配的结束标签结尾---end', end)


        if (_end) {
          // >
          // console.log('匹配的结束标签结尾---end', end)
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  }

  // 编写: <div id="app" style="color: red"> hello {{name}} <span>hello</span></div>
  // 结果: render(){ return _c('div', {id: 'app', style:{color: 'red'}}), _v('hello'+_s(name)), _c('span', null, _v('hello'))}
  var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g; // 匹配双大括号 {{  }}
  // 语法层面的转义
  // 将属性转换成key：value的形式

  function genProps(attrs) {
    // id="app" / style="color:'red';fontSize:12px"
    // console.log('attrs--->', attrs)
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === "style") {
        (function () {
          var obj = {}; // 对style上的样式进行特殊处理

          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    } // 上面拼key-value的时候，会多出一个逗号


    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    // 节点可能是文本，可能是标签
    if (node.type == 1) {
      return generate(node); // 生成元素节点的字符串
    } else {
      // 如果是文本， 将当前节点的文本拿出来
      var text = node.text; // 获取文本
      // 如果是普通文本，不带{{}}

      if (!defaultTagRE.test(text)) {
        // 1._v('hello') => _v('hello')
        return "_v(".concat(JSON.stringify(text), ")"); // 每次循环匹配代码之前，都要将正则的lastIndex置为0
      } // 2._v('hello {{name}} world {{msg}} aa') => _v('hello' + _s(name) + 'world' + _s(msg))


      var tokens = []; // 存放每一段的代码

      var lastIndex = defaultTagRE.lastIndex = 0; // 如果正则是全局模式 需要每次前置为0

      var match, index; // 每次匹配到的结果
      // 捕获 “{{name}}”

      while (match = defaultTagRE.exec(text)) {
        index = match.index; // 保存匹配到的索引

        if (index > lastIndex) {
          // 当前是普通文班
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        } // 当前是'{{name}}',放入捕获到的变量名


        tokens.push("_s(".concat(match[1].trim(), ")"));
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex))); // 示例最后的"aa"
      }

      return "_v(".concat(tokens.join('+'), ")"); // 2._v('hello {{name}} world {{msg}} aa') => _v('hello' + _s(name) + 'world' + _s(msg))
    }
  } // 根据当前元素的儿子生成孩子


  function getChildren(el) {
    var children = el.children; // 儿子的生成

    if (children) {
      // 将所有转化后的儿子，用逗号拼接起来
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
  }

  function generate(el) {
    var children = getChildren(el); // 创建标签和标签的属性，将儿子拼到后面

    var code = "_c('".concat(el.tag, "', ").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : 'undefined').concat(children ? ",".concat(children) : '', ")");
    return code;
  }

  // <div>hello {{name}} <span>world</span></div>

  function compileToFunctions(template) {
    // 将html模板 ==》 render函数
    // ast语法树：用一颗树描述html结构，再把这样一个结构转换成js语法，最后生成对应的代码字符串 
    // 虚拟dom和ast：一个对语法转义，一个对结构转义，ast可以描述css、js、dom，虚拟dom只能描述dom结构
    // 虚拟dom 是用对象来描述节点，避免操作真实dom，来比对的； ast是描述代码的，描述语言本身,只描述语法：const a = 1; ==> {indentifier: const, name: a, value: 1}
    // <div id="a"></div> ===> {attrs:[{id:'a'}], tag:'div', children:[]}
    // 1.需要将html代码转化成"ast"语法树 可以用ast树来描述语言本身，
    // 前端必须要掌握的数据结构（树）
    // 测试 render 函数的节点
    // template = `<div id="app" style="color: red"> hello {{name}} {{msg}} <span>hello</span></div>`
    var ast = parseHTML(template); // console.log('compileToFunctions', 'template', template, 'ast', ast)
    // 2.优化静态节点
    // 3.通过这颗树 重新生成代码
    // <div id="app" style="color: red"> hello {{name}} <span>hello</span></div>
    // render(){ return _c('div', {id: 'app', style:{color: 'red'}}), _v('hello'+_s(name)), _c('span', null, _v('hello'))}

    var code = generate(ast); // console.log('generate-->code', code)
    // 4.将字符串变成函数 限制取值范围 通过with来进行取值 稍后调用render函数就可以通过改变this 让这个函数内部取到结果

    var render = new Function("with(this){return ".concat(code, "}")); // let obj = { a: 1, b: 2 }
    // with (obj) { console.log(a, b) }
    // console.log('render-->', render)

    return render;
  }

  // 将虚拟节点转换成真实节点
  function patch(oldVnode, vnode) {
    console.log('oldVnode', oldVnode, 'vnode', vnode); // oldVnode => id#app vnode 我们根据模板产生的虚拟dom

    var el = createElm(vnode); // 根据当前虚拟节点创建真实dom

    var parentElm = oldVnode.parentNode; // 获取老的app的父亲 =》 body

    parentElm.insertBefore(el, oldVnode.nextSibling); // 当前的真实元素插入到app老节点的后面，不是body节点的最后面

    parentElm.removeChild(oldVnode); // 删除老节点

    return el;
  }

  function createElm(vnode) {
    var tag = vnode.tag,
        children = vnode.children,
        key = vnode.key,
        data = vnode.data,
        text = vnode.text;

    if (typeof tag == 'string') {
      // 创建元素 放到vnode.el上
      // 如果有标签说明是一个元素
      vnode.el = document.createElement(tag); // 只有元素才有属性

      updateProperties(vnode); // 遍历儿子，将儿子渲染后的结果扔到父亲中

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      // 创建文本 放到vnode.el 上
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  } // vue的渲染流程 =》 先初始化数据 =》将模板逆行编译 =》 render函数 =》 生成虚拟节点 =》 生成真实dom =》 更新到页面


  function updateProperties(vnode) {
    var el = vnode.el;
    var newProps = vnode.data || {};

    for (var key in newProps) {
      if (key == "style") {
        // {color: red}
        for (var styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
      } else if (key == 'class') {
        el.className = el["class"];
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  var id = 0;

  var Watcher = /*#__PURE__*/function () {
    // vm.$watch
    // vm实例
    // exprOrFn vm._update(vm._render())
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.exprOrFn = exprOrFn;
      this.cb = cb;
      this.options = options;
      this.id = id++; // watcher的唯一标识

      if (typeof exprOrFn === 'function') {
        this.getter = exprOrFn;
      }

      this.get(); // 默认会调用get方法
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // Dep.target = watcher
        pushTarget(this); // 当前watcher实例

        this.getter(); // 调用exprOrFn  渲染页面 取值(执行了get方法)  render方法 with(vm){msg}

        popTarget();
      }
    }, {
      key: "update",
      value: function update() {
        this.get(); // 重新渲染
      }
    }]);

    return Watcher;
  }();
  // 找到属性--->对应的watcher，渲染watcher在lifeCycle的update的时候创建
  // 1.先把这个渲染watcher 放到了Dep.target属性上，
  // 2.开始渲染 取值会调用get方法，需要让这个属性的dep 存储当前的watcher
  // 3.页面上所需要的属性都会将这个watcher存在自己的dep中
  // 4.等会属性更新了，就重新调用渲染逻辑 通知自己存储的watcher来更新

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      console.log('lifecycle---_update', vnode);
      var vm = this; // 用新创建的元素 替换掉老的vm.$el

      vm.$el = patch(vm.$el, vnode);
    };
  } // 挂载节点

  function mountComponent(vm, el) {
    // 调用render方法去渲染 el属性
    // 先调用render方法创建虚拟节点，再将虚拟节点渲染到页面上
    callHook(vm, 'beforeMount');

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    }; // 这个watcher是用于渲染的 目前没有任何功能 updateComponent()
    // 初始化就会创建watcher


    var watcher = new Watcher(vm, updateComponent, function () {
      callHook(vm, 'beforeUpdate');
    }, true); // 渲染watcher 只是个名字
    // vm._update(vm._render());
    // 要把属性 和 watcher绑定在一起

    callHook(vm, 'mounted');
  } // callHook(vm, 'beforeCreate')

  function callHook(vm, hook) {
    var handlers = vm.$options[hook]; // vm.$options.created = [a1, a1, a3]

    if (handlers) {
      for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(vm); // 更改生命周期中的this
      }
    }
  }

  function initMixin(Vue) {
    // 全局组件和局部组件的区别: 全局组件任何地方都能用
    Vue.prototype._init = function (options) {
      var vm = this; // vm.$options = mergeOptions(Vue.options, options); 

      vm.$options = mergeOptions(vm.constructor.options, options); // 需要将用户自定义的options 和全局的options做合并

      console.log('vm.$options', vm.$options); // 1.数据观测初始化(vue源码会先初始化事件和生命周期)
      // 初始化状态 (将数据做一个初始化的劫持，当改变数据时，应该更新视图)
      // vue组件中有很多状态 data props watch computed

      callHook(vm, 'beforeCreate');
      initState(vm);
      callHook(vm, 'created'); // vue核心：响应式数据原理
      // MVVM：数据变化视图更新、视图变化影响数据(不能跳过数据更新视图)，$ref能实际直接操作dom
      // 2. ast树解析
      // 如果当前有el属性说明要渲染模板(el属性，等价于vm.$mount方法)

      if (vm.$options.el) {
        // 挂载的逻辑
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      // 挂载操作
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el);
      vm.$el = el; // debugger

      if (!options.render) {
        // 没render 将template转化成render方法, render方法优先级比template更高
        var template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        } // 有el、有template才做编译的操作，将模板转换成为render函数
        // 编译原理 将模板编译成render函数，template => render方法
        // 1.处理模板变为ast树，2.标记静态节点，3.codegen=>return 字符串(把代码生成回js语法)，4.new Fucntion + with(render函数)


        var render = compileToFunctions(template);
        options.render = render;
      } // 最终渲染时都是options.render方法


      console.log('最终渲染时都是options.render方法', options.render); // 需要挂载这个组件

      mountComponent(vm); // console.log('el', el)
    };
  }

  function renderMixin(Vue) {
    // 创建虚拟dom，用对象来描述dom的解构
    Vue.prototype._c = function () {
      // 创建虚拟dom元素
      return createElement.apply(void 0, arguments);
    }; // 1.当结果是对象时，会对这个对象取值


    Vue.prototype._s = function (val) {
      // stringify
      return val == null ? '' : _typeof(val) == 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._v = function (text) {
      // 创建虚拟dom文本元素
      return createTextVnode(text);
    };

    Vue.prototype._render = function () {
      // _render = render
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      console.log('vdom/index/_render--vnode', vnode);
      return vnode;
    };
  } // _c('div', {}, 1,2,3)

  function createElement(tag) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    // console.log('createElement-arguments', arguments)
    return vnode(tag, data, data.key, children);
  }

  function createTextVnode(text) {
    // console.log('createTextVnode-arguments', arguments)
    return vnode(undefined, undefined, undefined, undefined, text);
  } // 用来产生虚拟dom的,ast是根据原代码转换出来的，不会有一些不存在的属性，虚拟dom可以加一些自定义属性


  function vnode(tag, data, key, children, text) {
    return {
      tag: tag,
      data: data,
      key: key,
      children: children,
      text: text,
      componentsInstance: '',
      slot: ''
    };
  }

  function initGlobalApi(Vue) {
    Vue.options = {}; // Vue.components Vue.directive定义的这些属性，最终都会放在Vue.options

    Vue.mixin = function (mixin) {
      // 合并对象(先考虑生命周期，不考虑data computed watch)
      this.options = mergeOptions(this.options, mixin); // console.log('initGlobalApi--->mixin', this.options); // this.options = {created: [a, b]}
    }; // new 的时候需要将Vue.options 和 new 传入的options 再合并
    // 用户 new Vue({create(){}})

  }

  // 用Vue的构造函数，创建组件

  function Vue(options) {
    // console.log('index.js--->options', options)
    this._init(options); // 组件初始化的入口，入口方法，做初始化操作

  } // 原型方法，扩展原型


  initMixin(Vue); // init方法

  lifecycleMixin(Vue); // 混合生命周期 _update更新渲染和组件挂载(不是vue的生命周期create那些)

  renderMixin(Vue); // _render
  // 静态方法 Vue.component Vue.directive Vue.extend Vue.mixin ...

  initGlobalApi(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
