jobboards = ["linkedin", "jobgether", "justjoin", "web3career"]

chrome.runtime.onMessage.addListener((msg, sender) => {
    if (jobboards.includes(msg.jobboard) && sender.tab?.id) {
        if (msg.loaded) {
            chrome.action.disable(sender.tab.id);
            chrome.action.setBadgeText({ tabId: sender.tab.id, text: "ON" });
            // chrome.action.setBadgeBackgroundColor({ tabId: sender.tab.id, color: "green" });
        } else {
            // chrome.action.enable(sender.tab.id);
            // chrome.action.setPopup({ tabId: sender.tab.id, popup: "popup.html" });
        }
    }
});
