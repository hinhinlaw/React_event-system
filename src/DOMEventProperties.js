import {registerTwoPhaseEvent} from './EventRegistry';

const discreteEventPairsForSimpleEventPlugin = [
  'click','click',
  'dblclick','doubleClick'
];

/**
 * 原生事件名 与 React事件名的映射
 */
export const topLevelEventsToReactNames = new Map();

/**
 * 注册事件
 */
export function registerSimpleEvents(){
  // debugger;
  for(let i=0;i<discreteEventPairsForSimpleEventPlugin.length-1;i+=2){
    let topEvent = discreteEventPairsForSimpleEventPlugin[i]; // 原生事件
    const event = discreteEventPairsForSimpleEventPlugin[i+1]; // 对应的React事件
    const capitalizedEvent = event[0].toUpperCase() + event.slice(1) // click => Click
    const ReactName = 'on' + capitalizedEvent; // Click => onClick  DoubleClick => onDoubleClick
    topLevelEventsToReactNames.set(topEvent, ReactName);

    registerTwoPhaseEvent(ReactName, [topEvent]);
  }
}