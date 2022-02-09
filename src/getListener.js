import { getFiberCurrentPropsFromNode } from "./ReactDOMComponentTree";

/**
 * 获取fiber上的对应的事件
 */
export default function getListener(fiberInst, registrationName){
  const stateNode = fiberInst.stateNode;
  const props = getFiberCurrentPropsFromNode(stateNode);
  const listener = props[registrationName];
  return listener;
}