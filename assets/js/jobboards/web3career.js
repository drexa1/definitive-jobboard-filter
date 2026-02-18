/* global chrome */
console.log("👋 Web3career bastards")

class Web3careerFilter extends JobFilter {
    getJobCards() {
        return Error("unimplemented");
    }
}

const web3careerFilter = new Web3careerFilter();

// Listen for storage changes (same as before, just update the instance)
chrome.storage.onChanged.addListener((changes) => {

    if (changes["web3careerCompaniesToggle"])
        web3careerFilter.companiesToggleEnabled = !!changes["web3careerCompaniesToggle"].newValue;
    if (changes.companies)
        web3careerFilter.companiesFilter = changes.companies.newValue || [];

    if (changes["web3careerKeywordsToggle"])
        web3careerFilter.keywordsToggleEnabled = !!changes["web3careerKeywordsToggle"].newValue;
    if (changes.keywords)
        web3careerFilter.keywordsFilter = changes.keywords.newValue || [];

    if (changes["web3careerDaysAgoToggle"])
        web3careerFilter.daysAgoFilterEnabled = !!changes["web3careerDaysAgoToggle"].newValue;
    if (changes.daysago)
        web3careerFilter.daysAgoFilter = changes.daysago.newValue?.["web3careerDaysAgoDropdown"] || null;

    web3careerFilter.hideJobs();
});

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: "web3career" });
    web3careerFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });