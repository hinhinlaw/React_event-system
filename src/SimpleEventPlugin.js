import { registerSimpleEvents, } from './DOMEventProperties';
import { topLevelEventsToReactNames } from './DOMEventProperties';
import { IS_CAPTURE_PHASE } from './EventSystemFlags';
import { SyntheticMouseEvent, SyntheticEvent } from './SyntheticEvent';
import { accumulateSinglePhaseListeners } from './DOMPluginEventSystem';

/**
 * 提取事件处理函数
 * @param {*} dispatchQueue 
 * @param {*} domEventName 
 * @param {*} targetInst 
 * @param {*} nativeEvent 
 * @param {*} eventSystemFlags 
 * @param {*} targetContainer 
 */
export function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  eventSystemFlags,
  targetContainer,
  nativeEventTarget
) {
  let reactName = topLevelEventsToReactNames.get(domEventName); // 根据原生事件名获取React事件名 click -> onClick
  let SyntheticEventCtor; // 事件构造函数
  let reactEventType = domEventName;
  // 不同的事件，对应的合成事件对象是不一样的，也对应不同的合成事件构造函数
  switch (domEventName) {
    case 'click':
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
    default:
      break;
  }
  // 是否为捕获阶段
  let inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  // 累加单一阶段的事件处理函数
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    inCapturePhase
  );
  // 如果有监听，就创建一个新的合成事件对象
  if (listeners.length > 0) {
    const event = new SyntheticEventCtor(
      reactName,
      reactEventType,
      targetInst,
      nativeEvent,
      nativeEventTarget
    );
    dispatchQueue.push({
      event,
      listeners
    });
  }
}

export { registerSimpleEvents as registerEvents };