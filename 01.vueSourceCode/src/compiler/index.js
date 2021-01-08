// <div>hello {{name}} <span>world</span></div>
// let html = {
//   tag: 'div',
//   parent: null,
//   type: 1,
//   attrs: [],
//   children: [
//     { tag: null, parent: '父div', attrs: [], text: 'hello {{name}}' },
//     { tag: 'span', parent: '父div', attrs: [], text: 'world' },
//   ]
// }
import { parseHTML } from "./parse";
import { generate } from "./generate";

// 解析html，重新生成代码，生成render函数
export function compileToFunctions(template) {
  // 将html模板 ==》 render函数
  // ast语法树：用一颗树描述html结构，再把这样一个结构转换成js语法，最后生成对应的代码字符串 
  // 虚拟dom和ast：一个对语法转义，一个对结构转义，ast可以描述css、js、dom，虚拟dom只能描述dom结构
  // 虚拟dom 是用对象来描述节点，避免操作真实dom，来比对的； ast是描述代码的，描述语言本身,只描述语法：const a = 1; ==> {indentifier: const, name: a, value: 1}
  // <div id="a"></div> ===> {attrs:[{id:'a'}], tag:'div', children:[]}

  // 1.需要将html代码转化成"ast"语法树 可以用ast树来描述语言本身，

  // 前端必须要掌握的数据结构（树）
  // 测试 render 函数的节点
  template = `<div id="app" style="color: red"> hello {{name}} {{msg}} <span>hello</span></div>`
  let ast = parseHTML(template)
  // console.log('compileToFunctions', 'template', template, 'ast', ast)

  // 2.优化静态节点

  // 3.通过这颗树 重新生成代码
  // <div id="app" style="color: red"> hello {{name}} <span>hello</span></div>
  // render(){ return _c('div', {id: 'app', style:{color: 'red'}}), _v('hello'+_s(name)), _c('span', null, _v('hello'))}
  let code = generate(ast)
  // console.log('generate-->code', code)

  // 4.将字符串变成函数 限制取值范围 通过with来进行取值 稍后调用render函数就可以通过改变this 让这个函数内部取到结果
  let render = new Function(`with(this){return ${code}}`)
  // let obj = { a: 1, b: 2 }
  // with (obj) { console.log(a, b) }
  // console.log('render-->', render)

  return render

}