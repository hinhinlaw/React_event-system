/**
 * 创建React元素（虚拟DOM）的工厂函数
 * @param {*} type 元素类型
 * @param {*} config 属性
 * @param {*} children  子节点
 */
function createElement(type, config, children, child2, child3){
  delete config.__source;
  delete config.__self;
  delete config.ref;
  delete config.key;
  let props = {...config};
  if(arguments.length > 3){
    props.children = Array.prototype.slice.call(arguments, 2)
  }else{
    props.children = children;
  }
  return {type, props};
}

const React = {
  createElement,
}

export default React;