/* global chrome */

jobboards = ["linkedin", "jobgether", "justjoin", "web3career"]

chrome.runtime.onMessage.addListener((msg, sender) => {
    if (jobboards.includes(msg.jobboard) && sender.tab?.id) {
        chrome.action.setBadgeText({ tabId: sender.tab.id, text: "ON" });
        // chrome.action.disable(sender.tab.id);
    }
});
