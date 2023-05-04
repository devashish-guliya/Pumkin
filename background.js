//background.js

let prompt_main = "";
let context = "";
let promptClicked = false;
let contextClicked = false;
let openaiTabId;
let contentPort;
var complete_prompt = "";
var generatedText = "";
let insertTabId = 0;
let insertTextPorts = {};

console.log("Background script loaded");

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "content") {
    contentPort = port;
    console.log("Content script connected");
  }

  else if (port.name === "insertText") {
      
      if (port.sender.tab) {
        insertTextPorts[port.sender.tab.id] = port;
        console.log("port.sender.tab.id: ", port.sender.tab.id);
        console.log("insertTextPorts[port.sender.tab.id]: ", insertTextPorts[port.sender.tab.id]);
      }      
  
      port.onDisconnect.addListener((port) => {
        
        port.sender.tab &&
          delete insertTextPorts[port.sender.tab.id];
      });
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
    
}
  
function addSelectedTextToPrompt(info, tab) {
    prompt_main += info.selectionText;
    
}
  
function addSelectedTextToContext(info, tab) {
    context += "Here is the context: " + info.selectionText;
    
}
  
function generateHere(info, tab) {
  complete_prompt = prompt_main + " " + context;
  
  insertTabId = tab.id;
  console.log(insertTabId);

  console.log(insertTextPorts[insertTabId]);

  if (insertTextPorts[insertTabId]) {        
    console.log("Yaha aaya")
    insertTextPorts[insertTabId].postMessage({action: "setActiveTextbox"});
  }

  contentPort.postMessage({ action: "generate", prompt: complete_prompt });
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
  
  else if (info.menuItemId === "addContext") {
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


chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "generated" && message.prompt === complete_prompt) {
      generatedText = message.output;
      console.log("Generated text received: ", generatedText);
      
      console.log("insertTabId: ", insertTabId);
      console.log("insertTextPorts[insertTabId]: ", insertTextPorts[insertTabId]);

      if (insertTextPorts[insertTabId]) {
        insertTextPorts[insertTabId].postMessage({ action: "insertText", text: generatedText });
      }
        
      prompt_main = "";
      context = "";
    }
  });

