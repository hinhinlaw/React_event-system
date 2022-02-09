import {listenToAllSupportedEvents} from './DOMPluginEventSystem';
import {HostComponent} from './ReactWorkTags';
import {internalInstanceKey, internalPropsKey} from './ReactDOMComponentTree';

function render(vdom, container){
  listenToAllSupportedEvents(container);
  mount(vdom, container);
}

function mount(vdom, parentDOM){
  let newDOM = createDOM(vdom, parentDOM);
  parentDOM.appendChild(newDOM);
}

function createDOM(vdom, parentDOM){
  let {type, props} = vdom;
  let dom;
  if(typeof vdom === 'string' || typeof vdom === 'number'){ // 如果是一个文本节点
    dom = document.createTextNode(vdom);
  }else{ // 如果是一个标签节点
    dom = document.createElement(type);
  }
  let returnFiber = parentDOM[internalInstanceKey] || null; // 获取父fiber
  let fiber = {
    tag: HostComponent,
    type,
    stateNode: dom,
    return: returnFiber,
  }
  dom[internalInstanceKey] = fiber; // 用来建立真实DOM节点与fiber节点的关系。在事件触发时，会先根据原生的event.target找到触发事件的真实DOM节点，然后根据这个属性找到对应的fiber对象
  dom[internalPropsKey] = props; // 存放属性，方便查找处理函数，比如props.onClick props.onChange
  if(props){
    updateProps(dom,{},props);
    if(Array.isArray(props.children)){
      reconcileChildren(props.children, dom);
    }else{
      mount(props.children, dom);
    }
  }
  return dom;
}

function reconcileChildren(children, parentDOM){
  children.forEach(child => mount(child, parentDOM));
}

function updateProps(dom, oldProps, newProps){

}

const ReactDOM = {
  render
}

export default ReactDOM;