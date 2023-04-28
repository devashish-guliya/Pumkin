const connection = chrome.runtime.connect({ name: "content" });

connection.onMessage.addListener((message, sender) => {
  console.log("Message received:", message);
  if (message.action === "clickButton") {
    const xpath = '//*[@id="__next"]/div[2]/div[1]/div/div/nav/a';
    const button = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (button) { 
      if (button.offsetParent !== null && !button.disabled) {
        button.click();
      } else {
        console.error("Button is not visible or enabled");
      }
    } else {
      console.error("Button not found using XPath expression");
    }
  }
});
