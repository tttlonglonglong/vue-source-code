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
    console.log('attrs--->', attrs);
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

    var code = "_c('".concat(el.tag, "', ").concat(el.attrs.length ? "".concat(genProps(el.attrs)) : 'undefine').concat(children ? ",".concat(children) : '', ")");
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
    template = "<div id=\"app\" style=\"color: red\"> hello {{name}} {{msg}} <span>hello</span></div>";
    var ast = parseHTML(template);
    console.log('compileToFunctions', 'template', template, 'ast', ast); // 2.优化静态节点
    // 3.通过这颗树 重新生成代码
    // <div id="app" style="color: red"> hello {{name}} <span>hello</span></div>
    // render(){ return _c('div', {id: 'app', style:{color: 'red'}}), _v('hello'+_s(name)), _c('span', null, _v('hello'))}

    var code = generate(ast);
    console.log('generate-->code', code); // 4.将字符串变成函数 限制取值范围 通过with来进行取值 稍后调用render函数就可以通过改变this 让这个函数内部取到结果

    var render = new Function("with(this){return ".concat(code, "}")); // let obj = { a: 1, b: 2 }
    // with (obj) { console.log(a, b) }

    console.log('render-->', render);
    return render;
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 1.数据观测初始化(vue源码会先初始化事件和生命周期)
      // 初始化状态 (将数据做一个初始化的劫持，当改变数据时，应该更新视图)
      // vue组件中有很多状态 data props watch computed

      initState(vm); // vue核心：响应式数据原理
      // MVVM：数据变化视图更新、视图变化影响数据(不能跳过数据更新视图)，$ref能实际直接操作dom
      // 2. ast树解析
      // 如果当前有el属性说明要渲染模板(el属性，等价于vm.$mount方法)

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      // 挂载操作
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); // debugger

      if (!options.render) {
        // 没render 将template转化成render方法
        var template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        } // 有el、有template才做编译的操作，将模板转换成为render函数
        // 编译原理 将模板编译成render函数


        var render = compileToFunctions(template);
        options.render = render;
      }

      console.log('最终渲染时都是options.render方法', options.render); // render方法优先级比template更高

      console.log('el', el);
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
