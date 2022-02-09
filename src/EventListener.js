/**
 * 绑定冒泡阶段的事件
 * @param {*} target 
 * @param {*} eventType 
 * @param {*} listener 
 */
export function addEventBubbleListener(target, eventType, listener){
  target.addEventListener(eventType, listener, false);
}

/**
 * 绑定捕获阶段的事件
 * @param {*} target 
 * @param {*} eventType 
 * @param {*} listener 
 */
export function addEventCaptureListener(target, eventType, listener){
  target.addEventListener(eventType, listener, true);
}