/* global chrome */
console.log("👋 JustJoin bastards")

class JustjoinFilter extends JobFilter {
    getJobCards() {
        return Error("unimplemented");
    }
}

const justjoinFilter = new JustjoinFilter();

// Listen for storage changes (same as before, just update the instance)
chrome.storage.onChanged.addListener((changes) => {

    if (changes["justjoinCompaniesToggle"])
        justjoinFilter.companiesToggleEnabled = !!changes["justjoinCompaniesToggle"].newValue;
    if (changes.companies)
        justjoinFilter.companiesFilter = changes.companies.newValue || [];

    if (changes["justjoinKeywordsToggle"])
        justjoinFilter.keywordsToggleEnabled = !!changes["justjoinKeywordsToggle"].newValue;
    if (changes.keywords)
        justjoinFilter.keywordsFilter = changes.keywords.newValue || [];

    if (changes["justjoinDaysAgoToggle"])
        justjoinFilter.daysAgoFilterEnabled = !!changes["justjoinDaysAgoToggle"].newValue;
    if (changes.daysago)
        justjoinFilter.daysAgoFilter = changes.daysago.newValue?.["justjoinDaysAgoDropdown"] || null;

    justjoinFilter.hideJobs();
});

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: "justjoin" });
    justjoinFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });