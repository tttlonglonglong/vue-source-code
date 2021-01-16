// 编写: <div id="app" style="color: red"> hello {{name}} <span>hello</span></div>
// 结果: render(){ return _c('div', {id: 'app', style:{color: 'red'}}), _v('hello'+_s(name)), _c('span', null, _v('hello'))}

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g // 匹配双大括号 {{  }}


// 语法层面的转义
// 将属性转换成key：value的形式
function genProps(attrs) { // id="app" / style="color:'red';fontSize:12px"
  // console.log('attrs--->', attrs)
  let str = ''
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i]
    if (attr.name === "style") {
      let obj = {} // 对style上的样式进行特殊处理
      attr.value.split(';').forEach(item => {
        let [key, value] = item.split(':')
        obj[key] = value
      })
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;

  }

  // 上面拼key-value的时候，会多出一个逗号
  return `{${str.slice(0, -1)}}`;
}

function gen(node) {
  // 节点可能是文本，可能是标签
  if (node.type == 1) {
    return generate(node) // 生成元素节点的字符串
  } else {
    // 如果是文本， 将当前节点的文本拿出来
    let text = node.text // 获取文本
    // 如果是普通文本，不带{{}}
    if (!defaultTagRE.test(text)) {
      // 1._v('hello') => _v('hello')
      return `_v(${JSON.stringify(text)})`// 每次循环匹配代码之前，都要将正则的lastIndex置为0
    }
    // 2._v('hello {{name}} world {{msg}} aa') => _v('hello' + _s(name) + 'world' + _s(msg))
    let tokens = []; // 存放每一段的代码
    let lastIndex = defaultTagRE.lastIndex = 0; // 如果正则是全局模式 需要每次前置为0
    let match, index; // 每次匹配到的结果

    // 捕获 “{{name}}”
    while (match = defaultTagRE.exec(text)) {
      index = match.index // 保存匹配到的索引
      if (index > lastIndex) {
        // 当前是普通文班
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      }
      // 当前是'{{name}}',放入捕获到的变量名
      tokens.push(`_s(${match[1].trim()})`)
      lastIndex = index + match[0].length
    }
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex))) // 示例最后的"aa"
    }
    return `_v(${tokens.join('+')})` // 2._v('hello {{name}} world {{msg}} aa') => _v('hello' + _s(name) + 'world' + _s(msg))
  }
}
// 根据当前元素的儿子生成孩子
function getChildren(el) {
  const children = el.children // 儿子的生成
  if (children) {
    // 将所有转化后的儿子，用逗号拼接起来
    return children.map(child => gen(child)).join(',')
  }
}

export function generate(el) {
  let children = getChildren(el);
  // 创建标签和标签的属性，将儿子拼到后面
  let code = `_c('${el.tag}', ${
    el.attrs.length ? `${genProps(el.attrs)}` : 'undefined'
    }${
    children ? `,${children}` : ''
    })`;



  return code
}