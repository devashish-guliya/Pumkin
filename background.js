//background.js
let prompt_main = "";
let context = "";
let promptClicked = false;
let contextClicked = false;
let openaiTabId;
let contentPort;
var complete_prompt = "";
var generatedText = "";

console.log("Background script loaded");

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "content") {
    contentPort = port;
    console.log("Content script connected");
  }
});


chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({ id: "newChat", title: "New Subject", contexts: ["selection", "editable"] });
    chrome.contextMenus.create({ id: "addPrompt", title: "Add Prompt", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "addContext", title: "Add Context", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "generateHere", title: "Generate Here", contexts: ["editable"] });
  });


function createPrompt() {
    prompt_main = "";
    context = "";
    console.log("Prompt created: ", prompt_main);
}
  
function addSelectedTextToPrompt(info, tab) {
    prompt_main += info.selectionText;
    console.log("Selected text added to prompt_main: ", prompt_main);
}
  
function addSelectedTextToContext(info, tab) {
    context += "Here is the context: " + info.selectionText;
    console.log("Selected text added to context: ", context);
}
  
function generateHere(info, tab) {
    complete_prompt = prompt_main + " " + context;
    console.log("Generated string added to textbox: ", complete_prompt);
    contentPort.postMessage({ action: "generate" , prompt : complete_prompt});
}



chrome.contextMenus.onClicked.addListener((info, tab) => {
    
  if (info.menuItemId === "newChat") {
      createPrompt();
      contentPort.postMessage({ action: "click_New_chat" });  
    } 
    
  else if (info.menuItemId === "addPrompt") {
      addSelectedTextToPrompt(info, tab);
      promptClicked = true;
    } 
  
  else if (info.menuItemId === "addContext" && promptClicked) {
      addSelectedTextToContext(info, tab);
      contextClicked = true;
    } 
    
  else if (info.menuItemId === "generateHere" && promptClicked && info.editable) {
      generateHere(info, tab);
    }
});


chrome.runtime.onInstalled.addListener(async () => {
    const tabs = await chrome.tabs.query({ pinned: true, url: "https://chat.openai.com/*" });
    if (tabs.length === 0) {
      chrome.tabs.create({ url: "https://chat.openai.com/", pinned: true });
    } 
    
    else {
      openaiTabId = tabs[0].id;
      const results = await chrome.scripting.executeScript({
        target: { tabId: openaiTabId },
        func: () => document.querySelector(".user-not-logged-in") === null,
      });
      if (!results[0].result) {
        chrome.tabs.update(openaiTabId, { active: true });
      }
      chrome.tabs.reload(openaiTabId);
    }
  });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "generated" && message.prompt === complete_prompt) {
      generatedText = message.output;
      console.log("Generated text aaya");
      console.log("Generated text received: ", generatedText);
      prompt_main = "";
      context = "";

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTabId = tabs[0].id;
        chrome.scripting.executeScript({
          target: { tabId: currentTabId },
          function: function (generatedText) {
            document.activeElement.value += generatedText;
          },
          args: [generatedText],
        });
      });
      
    }
  });

