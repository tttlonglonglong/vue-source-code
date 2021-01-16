new Vue的时候，初始化对象，对象直接观测对象的属性
数组重写数组的方法，增加元素要添加观测，删除元素去除观测
1.
1.1 用Vue的构造函数，创建组件， _init初始化入口
1.1.1 数据观测初始化(vue源码会先初始化事件和生命周期) data、props、methods、data、computed、watch
observe，对对象进行递归观测，数组重写数据的方法，数组中普通类型不做观测，对象类型递归观测；
响应式核心将当前传入的对象做一个劫持，改变对象的时候能让页面自动更新，
  <!-- // 只观测存在的属性 data:{ a:1, b:2} vm.c = 3 vm.$set
  // 数组中更改索引和长度，无法被监控
  // vm.a = {a:1} // 赋值的是个对象，也会进行观测
  // 数组的$set用splice实现，对象就是重新 defineProperty -->
1.1.2 挂载
el存在的时候，先找render或 template，或外部 template；将template变为render方法
通过_render方法创建虚拟节点虚拟dom，
patch将新的虚拟节点，递归创建变成真实节点，替换掉原有节点
1.2 _update
1.2 _render


2.对象收集和数组收集是vue中比较绕的，比dom-diff，组件初始化还绕
2.1 生命周期，生命周期的原理
全局mixins合并 和 局部mixins的合并，生命周期方法在初始化函数和挂载函数前后执行
属性依赖收集与更新: 渲染的时候会创建一个watcher，渲染之前先把watcher放到全局Dep.target，之后再去取值，取值的时候走get记住当前watcher，属性变化的时候会把wather的update方法