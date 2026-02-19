/* global chrome */
console.log("👋 Web3career bastards")

class Web3careerFilter extends JobFilter {
    getJobCards() {
        return Error("unimplemented");
    }
}

const web3careerFilter = new Web3careerFilter("web3career", "afterend");

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: web3careerFilter.jobBoardName });
    web3careerFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });