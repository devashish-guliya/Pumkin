//insertText.js
const insertText_connection = chrome.runtime.connect({ name: "insertText"});
console.log("Connected to background script:", insertText_connection);

let active_textbox = null;
let lastClickedTextbox = null;

document.addEventListener("mousedown", function (element) {
  if (element.button === 2) { // Right-click
    console.log("here")
    if (isEditable(element.target)) {
      lastClickedTextbox = element.target;
      console.log("Last clicked textbox: ", lastClickedTextbox);
    }
  }
});



insertText_connection.onMessage.addListener(function (request){

  if (request.action === "setActiveTextbox") {
    active_textbox = lastClickedTextbox;

  } else if (request.action === "insertText") {

    console.log(active_textbox)
    console.log(active_textbox.tagName.toLowerCase())
        if (active_textbox.tagName.toLowerCase() === 'input' || active_textbox.tagName.toLowerCase() === 'textarea') {
          active_textbox.value = request.text;
        } else if (active_textbox.getAttribute('contentEditable') === 'true') {
          active_textbox.innerHTML = request.text;
        }
      }

  else{
    console.log("Nhi hua");
    }
});


function isEditable(element) {
  const tagName = element.tagName.toLowerCase();
  const contentEditable = element.getAttribute('contentEditable');

  if (tagName === 'textarea' || tagName === 'input' || contentEditable === 'true') {
    return true;
  }

  return false;
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
