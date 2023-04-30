//content.js
const connection = chrome.runtime.connect({ name: "content" });

let received_prompt = "";
let intervalId;

console.log("Content script loaded")

connection.onMessage.addListener(async (message, sender) => {
  console.log("Message received: ", message.name);

    console.log("Background script connected");
    
      if (message.action === "click_New_chat") {
        console.log("New chat clicked")
        click_New_chat();
      }
    
      else if (message.action === "generate") {
        received_prompt = message.prompt;
        const generatedText = await generateHere(received_prompt);
        console.log("Generated text going to background: ", generatedText);
        chrome.runtime.sendMessage({ action: "generated", prompt: received_prompt , output: generatedText });
      }
});



function click_New_chat() {

  const new_chat_xpath = '//*[@id="__next"]/div[2]/div[1]/div/div/nav/a';
  const new_chat_button = document.evaluate(new_chat_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
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


async function generateHere(received_prompt) {

  return new Promise(async (resolve) => {
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

  await new Promise((resolveInterval) => {
    intervalId = setInterval(() => {
      if (check_regenerate_button()) {
        clearInterval(intervalId);
        resolveInterval();
      }
    }, 3000);
  });

  const generated_text_xpath = '//*[@id="__next"]/div[2]/div[2]/main/div[1]/div/div/div/div[2]/div/div[2]/div[1]/div/div';
  const element = document.evaluate(generated_text_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  console.log("Generated text: ", element.textContent)
  const paragraphs = element.textContent.trim().split('\n');
  const output_text = paragraphs.join('\n\n');
  resolve(output_text);
});
}


function check_regenerate_button() {
  console.log("Regenerate button reached");
  const regenerate_button_xpath = '//*[@id="__next"]/div[2]/div[2]/main/div[2]/form/div/div[1]/div/button/div[contains(text(), "Regenerate response")]';
  const result = document.evaluate(regenerate_button_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const button = result.singleNodeValue;
  if (button) {
    console.log("Regenerate button found");
    return true; // return true when the button is found
  } else {
    return false; // return false when the button is not found
  }
}


