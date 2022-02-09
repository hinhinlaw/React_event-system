function functionThatReturnsTrue(){
  return true;
}

function functionThatReturnsFalse(){
  return false;
}

/**
 * 根据事件 创建合成事件对象的构造函数
 * @param {*} Interface 
 * @returns 
 */
function createSyntheticEvent(Interface){
  /**
   * 合成事件的基础事件对象
   * @param {*} reactName 
   * @param {*} reactEventType 
   * @param {*} targetInst 
   * @param {*} nativeEvent 
   * @param {*} nativeEventTarget 
   */
  function SyntheticBaseEvent(
    reactName,
    reactEventType,
    targetInst,
    nativeEvent,
    nativeEventTarget
  ){
    this._reactName = reactName;
    this._targetInst = targetInst;
    this.type = reactEventType;
    this.nativeEvent = nativeEvent;
    this.target = nativeEventTarget;
    this.currentTarget = null; // 当前的事件源（当前触发事件的DOM元素）

    // 选择性地把原生事件对象上的某些属性 拷贝到合成事件对象上
    for(const propName in Interface){
      this[propName] = nativeEvent[propName];
    }
    this.isDefaultPrevented = functionThatReturnsFalse; // 是否阻止了浏览器默认行为
    this.isPropagationStopped = functionThatReturnsFalse; // 是否阻止了事件冒泡
    return this;
  }
  Object.assign(SyntheticBaseEvent, {
    // preventDefault 和 preventPropagation 作用是 做一个polyfill，兼容处理多个浏览器
    preventDefault(){ 
      this.defaultPrevented = true;
      const event = this.nativeEvent;
      if(event.preventDefault){ // 兼容普通主流浏览器
        event.preventDefault();
      }else{ // 兼容IE
        event.returnValue = false;
      }
      this.isDefaultPrevented = functionThatReturnsTrue;
    },
    stopPropagation(){
      const event = this.nativeEvent;
      if(event.stopPropagation){ // 兼容普通主流浏览器
        event.stopPropagation();
      }else{ // 兼容IE
        event.cancelBubble = true;
      }
      this.isPropagationStopped = functionThatReturnsTrue;
    },
  })
  return SyntheticBaseEvent;
}

const MouseEventInterface = {
  clientX: 0,
  clientY: 0,
}

/** 下面这些导出的是构造函数 */
export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
export const SyntheticEvent = createSyntheticEvent({}); // 默认合成事件