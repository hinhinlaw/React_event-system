export const allNativeEvents = new Set();
export const registrationNameDependencies = {};

/**
 * 注册两个阶段的事件（捕获/冒泡）
 * 一个React事件可能对应多个原生事件，所以称为事件合成，比如：onChange => ['input','keydown','keyup','blur', ...]
 * @param {String} registrationName 需要注册的事件名（React事件名）
 * @param {Array} dependencies  依赖的事件（原生事件名）
 */
export function registerTwoPhaseEvent(registrationName, dependencies){
  registerDirectEvent(registrationName,dependencies); // onClick 冒泡
  registerDirectEvent(registrationName+'Capture',dependencies); // onClickCapture 捕获
}

export function registerDirectEvent(registrationName,dependencies){
  registrationNameDependencies[registrationName] = dependencies;
  for(let i=0;i<dependencies.length;i++){
    allNativeEvents.add(dependencies[i]);
  }
}