//content.js
const content_connection = chrome.runtime.connect({ name: "content" });

let received_prompt = "";
let intervalId;
let response_num = 0;

console.log("Content script loaded")

content_connection.onMessage.addListener(async (message, sender) => {
  console.log("Message received: ", message.name);

    console.log("Background script connected");
    
      if (message.action === "click_New_chat") {
        console.log("New chat clicked")
        click_New_chat();
        response_num = 0;
      }
    
      else if (message.action === "generate") {
        received_prompt = message.prompt;
        const generatedText = await generateHere(received_prompt);
        console.log("Generated text going to background: ", generatedText);
        chrome.runtime.sendMessage({ action: "generated", prompt: received_prompt , output: generatedText });
      }
});



function click_New_chat() {

  const new_chat_xpath = '//*[@id="__next"]/div[2]/div[1]/div/div/div/nav/a';                  
                  
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
  
  write_text(received_prompt)

  await new Promise((resolveInterval) => {
    intervalId = setInterval(() => {
      if (check_regenerate_button()) {
        clearInterval(intervalId);
        resolveInterval();
      }
    }, 3000);
  });

  const output_Text = extract_text().trim()
  
  resolve(output_Text);
  });
};


function write_text(received_prompt){

  const write_xpath = '//*[@id="__next"]/div[2]/div[2]/div/main/div[3]/form/div/div[2]/textarea';
                       
  var write_textbox = document.evaluate(write_xpath , document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  
  if (write_textbox) {
    //write_textbox.dispatchEvent(new Event('focus'));
    var originalText = write_textbox.value;
    write_textbox.value = received_prompt; // sets the textbox value to the desired text
    const send_button = document.evaluate('//*[@id="__next"]/div[2]/div[2]/div/main/div[3]/form/div/div[2]/button', 
                                           

    document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (send_button) {
      send_button.disabled = false; 
      send_button.click();
      send_button.disabled = true; } 
  }
}


function check_regenerate_button() {
  console.log("Regenerate button reached");
  const regenerate_button_xpath = '//*[@id="__next"]/div[2]/div[2]/div/main/div[3]/form/div/div[1]/div/button/div[contains(text(), "Regenerate response")]';
                                   
  const result = document.evaluate(regenerate_button_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const button = result.singleNodeValue;
  if (button) {
    console.log("Regenerate button found");
    return true; // return true when the button is found
  } else {
    return false; // return false when the button is not found
  }
}


function extract_text(){
  
  response_num +=2;
  const generated_text_xpath = `//*[@id="__next"]/div[2]/div[2]/div/main/div[2]/div/div/div/div[${response_num}]/div/div[2]/div[1]/div`;
                                //*[@id="__next"]/div[2]/div[2]/div/main/div[2]/div/div/div/div[2]              /div/div[2]/div[1]/div/div
  console.log(generated_text_xpath);
  const div_element = document.evaluate(generated_text_xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  const html_text = `${div_element.singleNodeValue.innerHTML}`

  const parser = new DOMParser();
  const doc = parser.parseFromString(html_text, 'text/html');
  const output_Text = extract_text_from_html(doc.querySelector('.markdown'));

  return output_Text
}


function extract_text_from_html(element) {

    let text = '';
  
    for (const childNode of element.childNodes) {
      if (childNode.nodeType === Node.TEXT_NODE) {
        text += childNode.textContent;
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        const tagName = childNode.tagName;
  
        switch (tagName) {
          case 'P':
          case 'DIV':
          case 'H1':
          case 'H2':
          case 'H3':
          case 'H4':
          case 'H5':
          case 'H6':
            text += extract_text_from_html(childNode) + '\n\n';
            break;
          case 'UL':
          case 'OL':
            text += extract_text_from_html(childNode) + '\n';
            break;
          case 'LI':
            text += '- ' + extract_text_from_html(childNode) + '\n';
            break;
          case 'TABLE':
            text += extract_text_from_html(childNode) + '\n';
            break;
          case 'TR':
            text += extract_text_from_html(childNode) + '\n';
            break;
          case 'TD':
          case 'TH':
            text += extract_text_from_html(childNode) + ' | ';
            break;
          case 'BR':
            text += '\n';
            break;
          case 'A':
            text += childNode.textContent + ' (' + childNode.href + ') ';
            break;
          case 'IMG':
            text += '[Image: ' + childNode.src + '] ';
            break;
          case 'PRE':
          case 'CODE':
            text += '\n```\n' + extract_text_from_html(childNode) + '\n```\n';
            break;
          case 'BLOCKQUOTE':
            text += '> ' + extract_text_from_html(childNode) + '\n';
            break;
          default:
            text += extract_text_from_html(childNode);
        }
      }
    }
  
    return text;
}
  


