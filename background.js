let prompt = "";
let context = "";
let promptClicked = false;
let contextClicked = false;
let openaiTabId;
let contentPort;

console.log("Background script loaded");

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "content") {
    contentPort = port;
    console.log("Content script connected");
    contentPort.postMessage({ action: "init" });
  }
});


chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({ id: "newSubject", title: "New Subject", contexts: ["all"] });
    chrome.contextMenus.create({ id: "addPrompt", title: "Add Prompt", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "addContext", title: "Add Context", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "generateHere", title: "Generate Here", contexts: ["editable"] });
  });

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log("OpenAI tab clicked")
    if (info.menuItemId === "newSubject") {
      console.log("New Sub Clicked");
      contentPort.postMessage({ action: "clickButton" });
    } else if (info.menuItemId === "addPrompt") {
      chrome.tabs.executeScript(tab.id, { code: "window.getSelection().toString();" }, (result) => {
        prompt = result[0];
        promptClicked = true;
      });
    } else if (info.menuItemId === "addContext" && promptClicked) {
      chrome.tabs.executeScript(tab.id, { code: "window.getSelection().toString();" }, (result) => {
        context = result[0];
        contextClicked = true;
      });
    } else if (info.menuItemId === "generateHere" && promptClicked && contextClicked && info.editable) {
      const generatedString = prompt + " " + context;
      chrome.tabs.executeScript(tab.id, { code: `document.activeElement.value += "\${generatedString}";` });
    }
});


chrome.runtime.onInstalled.addListener(async () => {
    const tabs = await chrome.tabs.query({ pinned: true, url: "https://chat.openai.com/*" });
    if (tabs.length === 0) {
      chrome.tabs.create({ url: "https://chat.openai.com/", pinned: true });
    } else {
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