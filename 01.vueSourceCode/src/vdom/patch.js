// 将虚拟节点转换成真实节点
export function patch(oldVnode, vnode) {
  console.log('oldVnode', oldVnode, 'vnode', vnode)

  let el = createElm(vnode); // 根据当前虚拟节点创建真实dom
  let parentElm = oldVnode.parentNode // 获取老的app的父亲 =》 body
  parentElm.insertBefore(el, oldVnode.nextSibling) // 当前的真实元素插入到app的后面
  parentElm.removeChild(oldVnode) // 删除老节点
}



function createElm(vnode) {
  let { tag, children, key, data, text } = vnode
  if (typeof tag == 'string') { // 创建元素 放到vnode.el上
    // 如果有标签说明是一个元素
    vnode.el = document.createElement(tag);
    // 遍历儿子，将儿子渲染后的结果扔到父亲中
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    })
  } else { // 创建文本 放到vnode.el 上
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}

// vue的渲染流程 =》 先初始化数据 =》将模板逆行编译 =》 render函数 =》 生成虚拟节点 =》 生成真实dom =》 更新到页面