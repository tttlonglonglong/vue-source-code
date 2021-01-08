// src/core/util/lang.js
const unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/

// src/compiler/parser/html-parser.js
// Regular Expressions for parsing tags and attributes
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性，aaa="aaa" | aaa='aaa' | aaa=aaa
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z${unicodeRegExp.source}]*` // 标签名: aaa-123aa
// ?:匹配不捕获
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // 捕获标签 <my:xxx></my:xxx>
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 标签开头的正则 捕获内容是标签名，开始标签部分，不包含开始标签的结尾。如 <div class="className" ></div>，匹配的是 '<div class="className"'
const startTagClose = /^\s*(\/?)>/ // 匹配 > 标签 或者/> <div> <br/> 开始标签的结尾部分。如 <div class="className" ></div>，匹配的是 ' >'
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // '</div><p></p>' 匹配结果为 </div>
const doctype = /^<!DOCTYPE [^>]+>/i // 匹配 DOCTYPE
const comment = /^<!\--/ // 匹配注释
const conditionalComment = /^<!\[/ // 匹配条件注释
const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g // 匹配双大括号 {{  }}
const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/


export function parseHTML(html) {

  // 数据结构树 树、栈
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName, // 标签名
      type: 1, // 元素类型
      children: [], // 孩子列表
      attrs, // 属性列表
      parent: null // 父元素
    }
  }
  let root; // 根节点
  let currentParent; // 当前节点
  let stack = [] // 存储标签的栈，用来判断栈是否符合预期
  // 解析开始标签,并校验标签是否符合预期 <div><span></span></div> [div, span]
  function start(tagName, attrs) {
    // console.log('开始标签', 'tagName', tagName, 'attrs', attrs)
    let element = createASTElement(tagName, attrs)
    if (!root) {
      root = element;
    }
    currentParent = element; // 当前解析的标签 保存起来
    stack.push(element) // 将生成的ast元素放到栈中
  }
  // 解析结束标签(标签闭合的时候，才确定父子关系)
  function end(tagName,) {
    // console.log('结束标签-tagName', tagName)
    // 在结尾标签处创建父子关系
    let element = stack.pop(); // 取出栈中的最后一个
    // <div><p></p> hello </div> [div, p] currentParent=p, 取出p后，currentParent就是div
    currentParent = stack[stack.length - 1]
    if (currentParent) {
      // 在闭合时，取出标签，可以知道取出这个标签的父亲是谁
      element.parent = currentParent
      currentParent.children.push(element)
    }


  }

  // 解析文本
  function chars(text) {
    // console.log('解析文本-text', text, "currentParent", currentParent)
    text = text.replace(/\s/g, '') // 去空格
    if (text) {
      currentParent.children.push({
        type: 3, // 文本类型用3
        text: text
      })
    }
  }

  while (html) { // 只要html不为空字符串，就一直解析
    let textEnd = html.indexOf('<')
    // 匹配到了标签的 "<"
    if (textEnd == 0) { // v-bind v-on <!DOCTYPE <!---->  <br/> 
      //  肯定是标签
      const startTagMatch = parseStartTag(); // 开始标签匹配的结果
      if (startTagMatch) {
        // 处理开始标签
        start(startTagMatch.tagName, startTagMatch.attrs)
      }
      // console.log("匹配掉一个开始标签之后---html", html)

      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        // 处理结束标签
        advance(endTagMatch[0].length)
        end(endTagMatch[1]) // 将结束标签传入
        continue;
      }
      // break;
    }

    let text = 0
    if (textEnd >= 0) {
      // 处理文本
      text = html.substring(0, textEnd)
    }
    if (text) {
      // 处理文本
      advance(text.length)
      chars(text);
      // console.log('html--->text', html)
    }
    // break;


  }

  // 将匹配过的字符串进行截取操作，再进行更新html
  function advance(n) {
    html = html.substring(n)
  }
  // 解析标签
  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      // console.log(html, '匹配到的开始标签', start)
      const match = {
        tagName: start[1],
        attrs: []
      }
      // console.log("match", match)
      advance(start[0].length);// 已经进行过匹配到的开始标签，删除掉
      // console.log('删除后的html', html)
      // 如果是闭合标签，说明没有属性
      let end;
      let attr;
      // 不是单标签，且能匹配到属性
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        // console.log('attr--->', attr)
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })
        advance(attr[0].length) // 去掉当前已经匹配掉的属性
        // console.log('match.attrs', match.attrs)
        // break;
      }
      // console.log('匹配的结束标签结尾---end', end)
      if (end) { // >
        // console.log('匹配的结束标签结尾---end', end)
        advance(end[0].length)
        return match
      }
    }
  }

  return root
}