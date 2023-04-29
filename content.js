//content.js
const connection = chrome.runtime.connect({ name: "content" });

let received_prompt = "";

console.log("Content script loaded")

connection.onMessage.addListener((message, sender) => {
  console.log("Message received: ", message.name);

    console.log("Background script connected");
    
      if (message.action === "click_New_chat") {
        console.log("New chat clicked")
        click_New_chat();
      }
    
      else if (message.action === "generate") {
        received_prompt = message.prompt;
        const generatedText = generateHere(received_prompt);
        chrome.runtime.sendMessage({ action: "generated", prompt: received_prompt , output: generatedText });
      }
});



function click_New_chat() {

  const xpath = '//*[@id="__next"]/div[2]/div[1]/div/div/nav/a';
  const new_chat_button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  if (new_chat_button) { 
    if (new_chat_button.offsetParent !== null && !new_chat_button.disabled) {
      new_chat_button.click();
    } else {
      console.error("Button is not visible or enabled");
    }
  } else {
    console.error("Button not found using XPath expression");
  }
}


function generateHere(received_prompt) {

  var textBox = document.evaluate("//*[@id='__next']/div[2]/div[2]/main/div[2]/form/div/div[2]/textarea", 
  document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  
  if (textBox) {
    textBox.dispatchEvent(new Event('focus'));
    var originalText = textBox.value;
    textBox.value = received_prompt; // sets the textbox value to the desired text
    const send_button = document.evaluate("//*[@id='__next']/div[2]/div[2]/main/div[2]/form/div/div[2]/button", 
    document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (send_button) {
      send_button.disabled = false; 
      send_button.click();
      send_button.disabled = true; } 
  }

  return "Yeh hai response";
}



