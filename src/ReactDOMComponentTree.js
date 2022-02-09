const randomKey = Math.random().toString(36).slice(2);
const internalEventHandlersKey = '__reactEvents$' + randomKey;
export const internalInstanceKey = '__reactFiber$' + randomKey; // 关联真实DOM和fiber
export const internalPropsKey = '__reactProps$' + randomKey;

/**
 * 获取真实DOM节点对应的fiber节点
 * @param {*} targetNode 真实DOM节点
 * @returns 
 */
export function getClosedInstanceFromNode(targetNode){
  return targetNode[internalInstanceKey];
}

/**
 * 根据真实DOM节点找到属性对象
 * @param {*} targetNode 
 */
export function getFiberCurrentPropsFromNode(targetNode){
  return targetNode[internalPropsKey];
}

/**
 * 
 * @param {*} node 容器节点 原生DOM元素
 */
export function getEventListenerSet(node){
  let elementListenerSet = node[internalEventHandlersKey];
  if(!elementListenerSet){
    elementListenerSet = node[internalEventHandlersKey] = new Set();
  }
  return elementListenerSet;
}