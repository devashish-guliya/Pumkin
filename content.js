const connection = chrome.runtime.connect({ name: "content" });

connection.onMessage.addListener((message, sender) => {
    console.log("Message received:", message);
  if (message.action === "clickButton") {
    const button = document.querySelector(".my-button");
    if (button) {
      button.click();
    }
  }
});
