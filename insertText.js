//insertText.js
const insertText_connection = chrome.runtime.connect({ name: "insertText"});
console.log("Connected to background script:", insertText_connection);

let active_textbox = null;
let lastClickedTextbox = null;


document.addEventListener('click', (event) => {
  if (event.target.textContent === 'Generate Here') {
    active_textbox = event.target;
  }
});


insertText_connection.onMessage.addListener(function (request){

  if (request.action === "setActiveTextbox") {
    active_textbox = lastClickedTextbox;

  } 
  
  else if (request.action === "insertText" && activeInputElement) {
      // Assuming insertText.js exposes a function called 'insertText' to insert text into an input element
      insertText(active_textbox, request.text);
      active_textbox = null;
    }

/*     console.log(active_textbox)
    console.log(active_textbox.tagName.toLowerCase());
        if (active_textbox.tagName.toLowerCase() === 'input' || active_textbox.tagName.toLowerCase() === 'textarea') {
          active_textbox.value = request.text;
          console.log("2222222")
        } else if (active_textbox.getAttribute('contentEditable') === 'true') {
          console.log("3333333")
          active_textbox.innerHTML = request.text;
        }
      } */

  else{
    console.log("Nhi hua");
    }
});


function isEditable(element) {
  const tagName = element.tagName.toLowerCase();
  const contentEditable = element.getAttribute('contentEditable');

  if (tagName === 'textarea' || tagName === 'input' || contentEditable === 'true' || tagName === 'div' || tagName === 'span') {
    console.log("true")
    return true;
  }

  return false;
}


// insertText.js
function insertText(element, text) {
  const startPosition = element.selectionStart;
  const endPosition = element.selectionEnd;

  element.value = element.value.substring(0, startPosition)
    + text
    + element.value.substring(endPosition);

  element.selectionStart = element.selectionEnd = startPosition + text.length;
}

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
