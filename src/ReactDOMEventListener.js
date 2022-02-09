import { getClosedInstanceFromNode, getFiberCurrentPropsFromNode } from "./ReactDOMComponentTree";
import {dispatchEventForPluginEventSystem} from './DOMPluginEventSystem';
import {batchedEventUpdates} from './ReactDOMUpdateBatching'

/**
 * 派发事件（事件触发时调用的函数）
 * @param {*} domEvent 事件名 click
 * @param {*} eventSystemFlags 事件系统标识 0/4
 * @param {*} targetContainer 目标容器container
 * @param {*} nativeEvent 事件触发时，传递过来的原生事件对象
 */
export function dispatchEvent(
  domEventName,
  eventSystemFlags,
  targetContainer,
  nativeEvent,
){
  let target = nativeEvent.target || nativeEvent.srcElement || window; // 获取触发事件的真实DOM
  let targetInst = getClosedInstanceFromNode(target); // 获取真实DOM对应的fiber节点
  batchedEventUpdates(()=>{
    dispatchEventForPluginEventSystem(
      domEventName,
      eventSystemFlags,
      nativeEvent,
      targetInst,
      targetContainer,
    );
  })
}