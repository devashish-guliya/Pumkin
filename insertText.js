//insertText.js
const insertText_connection = chrome.runtime.connect({ name: "insertText"});
console.log("Connected to background script:", insertText_connection);

let active_textbox = null;
let lastClickedTextbox = null;

document.addEventListener('focusin', () => {
  focusedElement = document.activeElement;
});



insertText_connection.onMessage.addListener(function (request){

  if (request.action === "setActiveTextbox") {
    active_textbox = focusedElement;

  } 
  
  else if (request.action === "insertText") {

      console.log(active_textbox)
      console.log(active_textbox.tagName.toLowerCase())

      if (focusedElement && focusedElement.tagName === 'INPUT') {
        focusedElement.value += request.text;
      } 
      else if (focusedElement && focusedElement.isContentEditable) {
        document.execCommand('insertText', false, request.text);
      } 
      else {
        console.error("No active textbox found");
      }
  }

  else{
    console.log("Nhi hua");
    }
});


/* document.addEventListener('focusin', () => {
  focusedElement = document.activeElement;
});



insertText_connection.onMessage.addListener(function (request){

  if (request.action === "setActiveTextbox") {
    active_textbox = focusedElement;

  } 
  
  else if (request.action === "insertText") {

      console.log(active_textbox)
      console.log(active_textbox.tagName.toLowerCase())

      if (focusedElement && focusedElement.tagName === 'INPUT') {
        focusedElement.value += request.text;
      } 
      else if (focusedElement && focusedElement.isContentEditable) {
        document.execCommand('insertText', false, request.text);
      } 
      else {
        console.error("No active textbox found");
      }
  }

  else{
    console.log("Nhi hua");
    }
});
 */

/* function replaceSelectedText(elem, text) {
    var start = elem.selectionStart;
    var end = elem.selectionEnd;
    
    if (start !== end) {
        elem.value = elem.value.slice(0, start) + text + elem.value.substr(end);
        elem.selectionStart = start + text.length;
        elem.selectionEnd = elem.selectionStart;
    } else {
        elem.value = elem.value.slice(0, start) + text + elem.value.substr(start);
        elem.selectionStart = start + text.length;
        elem.selectionEnd = elem.selectionStart;
    }
} */

