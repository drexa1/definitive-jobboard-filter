/* global chrome */
console.log("👋 LinkedIn bastards")

class LinkedinFilter extends JobFilter {
    getJobCards() {
        return Error("unimplemented");
    }
}

const linkedinFilter = new LinkedinFilter("linkedin", "afterend");

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: linkedinFilter.jobBoardName });
    linkedinFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });