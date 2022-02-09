import React from './react';
import ReactDOM from './react-dom';

let rootContainerElement = document.getElementById('root');

const handleDivClick = () => {
  console.log('父元素冒泡');
}
const handleDivClickCapture = function(event){
  console.log('父元素捕获');
}
const handleButtonClick = function(event){
  console.log('子元素的冒泡');
}
const handleButtonClickCapture = function(){
  console.log('子元素的捕获')
}
const handleDoubleClick = function(){
  console.log('handleDoubleClick')
}

let element = (
  <div onClick={handleDivClick} onClickCapture={handleDivClickCapture}>
    <button onClick={handleButtonClick} onClickCapture={handleButtonClickCapture}>点击11</button>
  </div>
)

// let element = React.createElement('div',{
//   onClick: handleDivClick,
//   onDoubleClick: handleDoubleClick,
//   onClickCapture: handleDivClickCapture,
// }, React.createElement('button',{
//   onClick: handleButtonClick,
//   onClickCapture: handleButtonClickCapture
// }, '点击'));

ReactDOM.render(
  element,
  rootContainerElement
)