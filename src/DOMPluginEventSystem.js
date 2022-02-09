import { allNativeEvents } from './EventRegistry';
import * as SimpleEventPlugin from './SimpleEventPlugin'
import { getEventListenerSet } from './ReactDOMComponentTree';
import { IS_CAPTURE_PHASE } from './EventSystemFlags';
import { addEventCaptureListener, addEventBubbleListener } from './EventListener';
import { dispatchEvent } from './ReactDOMEventListener';
import { HostComponent } from './ReactWorkTags';
import getListener from './getListener';

/**
 * 注册事件名称（合成事件第一步：事件注册，即给allNativeEvents赋值）
 */
SimpleEventPlugin.registerEvents();

/**
 * 监听所有绑定的插件
 */
export const nonDelegatedEvents = new Set(['scroll']); // 不需要监听冒泡阶段的事件
export function listenToAllSupportedEvents(container) {
  // 事件插件注册完成后，会在这里循环绑定事件处理函数到容器container上 
  allNativeEvents.forEach(domEventName => {
    // 绑定事件（合成事件第二步：事件绑定）
    if (!nonDelegatedEvents.has(domEventName)) {
      // 监听容器的冒泡阶段的事件（比如click事件）
      listenToNativeEvent(domEventName, false, container);
    }
    // 监听容器的捕获阶段的事件（比如click事件）
    listenToNativeEvent(domEventName, true, container);
  })
}

function listenToNativeEvent(domEventName, isCapturePhaseListener, rootContainerElement, eventSystemFlags = 0) {
  // 同一个容器上的同一个阶段的同一个事件只绑定一次
  let listenerSet = getEventListenerSet(rootContainerElement);
  let listenerSetKey = getListenerSetKey(domEventName, isCapturePhaseListener);
  // 如果set中没有这个事件，就把事件添加到set中，并把事件绑定到容器元素上
  if (!listenerSet.has(listenerSetKey)) {
    if (isCapturePhaseListener) { // 如果是捕获阶段
      eventSystemFlags |= IS_CAPTURE_PHASE;
    }
    addTrappedEventListener(
      rootContainerElement,
      domEventName,
      eventSystemFlags,
      isCapturePhaseListener,
    )
    listenerSet.add(listenerSetKey);
  }
}

/**
 * 给rootContainerElement元素绑定domEventName事件
 * @param {*} rootContainerElement 
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @param {*} isCapturePhaseListener 
 */
function addTrappedEventListener(
  rootContainerElement,
  domEventName,
  eventSystemFlags,
  isCapturePhaseListener
) {
  let listener = dispatchEvent.bind(null, domEventName, eventSystemFlags, rootContainerElement); // 事件处理函数
  if (isCapturePhaseListener) {
    addEventCaptureListener(rootContainerElement, domEventName, listener);
  } else {
    addEventBubbleListener(rootContainerElement, domEventName, listener);
  }
}

/**
 * 
 * @param {*} domEventName 
 * @param {*} isCapturePhaseListener 
 */
function getListenerSetKey(domEventName, isCapturePhaseListener) {
  return `${domEventName}__${isCapturePhaseListener ? 'capture' : 'bubble'}`; // click__capture/click__bubble
}

/**
 * 给事件插件派发事件（合成事件第三步：事件触发）
 * 1. 遍历fiber树，收集相同事件的事件处理函数
 * 2. 按照浏览器 “捕获-事件源-冒泡” 顺序来执行事件处理函数
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @param {*} nativeEvent 
 * @param {*} targetInst 
 * @param {*} targetContainer 
 */
export function dispatchEventForPluginEventSystem(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  targetInst,
  targetContainer
) {
  let nativeEventTarget = nativeEvent.target;
  // 事件执行队列。由 事件插件 收集事件处理函数，来填充这个队列
  const dispatchQueue = [];
  // 收集事件，填充事件执行队列
  SimpleEventPlugin.extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, eventSystemFlags, targetContainer, nativeEventTarget); // 由事件插件来提取事件处理函数 
  // 清空事件队列，即按顺序处理事件
  processDispatchQueue(dispatchQueue, eventSystemFlags);
}

/**
 * 清空事件执行队列，处理每个事件函数
 * @param {*} dispatchQueue 
 * @param {*} eventSystemFlags 
 */
function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  let isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  for (let i = 0; i < dispatchQueue.length; i++) {
    const { event, listeners } = dispatchQueue[i];
    processDispatchQueueItemsInOrder(event, listeners, isCapturePhase);
  }
}

function processDispatchQueueItemsInOrder(event, listeners, isCapturePhase) {
  if (isCapturePhase) { // 如果是捕获，就倒叙遍历listeners
    for (let i = listeners.length - 1; i >= 0; i--) {
      const { currentTarget, listener } = listeners[i];
      // 如果阻止冒泡，就不需要继续执行后面的事件了
      if (event.isPropagationStopped()) {
        return;
      }
      execDispatch(event, listener, currentTarget);
    }
  } else { // 如果是冒泡，就正序遍历listeners
    for (let i = 0; i < listeners.length; i++) {
      const { currentTarget, listener } = listeners[i];
      // 如果阻止冒泡，就不需要继续执行后面的事件了
      if (event.isPropagationStopped()) {
        return;
      }
      execDispatch(event, listener, currentTarget);
    }
  }
}

function execDispatch(event, listener, currentTarget) {
  event.currentTarget = currentTarget;
  listener(event);
  event.currentTarget = null;
}

/**
 * 累加单一阶段的事件处理函数（收集fiber上props上挂载的事件函数）
 * @param {*} targetFiber 目标fiber
 * @param {*} reactName react事件名
 * @param {*} nativeType 原生类型
 * @param {*} inCapturePhase 是否捕获阶段
 */
export function accumulateSinglePhaseListeners(
  targetFiber,
  reactName,
  nativeType,
  inCapturePhase
) {
  let captureName = reactName + 'Capture';
  let reactEventName = inCapturePhase ? captureName : reactName;
  const listeners = [];
  let instance = targetFiber;
  let lastHostComponent = null;
  /**
   * 从事件源对应的fiber开始 向上遍历fiber树
   * 每遍历到一个fiber节点，都会找这个fiber节点上是否有相同的事件，如果有就添加到事件执行队列
   */
  while (instance) {
    const { stateNode, tag } = instance;
    if (tag === HostComponent && stateNode !== null) {
      lastHostComponent = stateNode;
      // 获取fiber上对应的事件处理函数
      const listener = getListener(instance, reactEventName);
      if (listener) {
        listeners.push(createDispatchListener(instance, listener, lastHostComponent));
      }
      // 处理完当前fiber节点后，找到父fiber节点，继续迭代处理
      instance = instance.return;
    }
  }
  return listeners;
}

function createDispatchListener(instance, listener, currentTarget) {
  return {
    instance,
    listener,
    currentTarget
  }
}