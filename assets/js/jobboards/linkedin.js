/* global chrome */
console.log("👋 LinkedIn bastards")

class LinkedinFilter extends JobFilter {
    getJobCards() {
        return Error("unimplemented");
    }
}

const linkedinFilter = new LinkedinFilter();

// Listen for storage changes (same as before, just update the instance)
chrome.storage.onChanged.addListener((changes) => {

    if (changes["linkedinCompaniesToggle"])
        linkedinFilter.companiesToggleEnabled = !!changes["linkedinCompaniesToggle"].newValue;
    if (changes.companies)
        linkedinFilter.companiesFilter = changes.companies.newValue || [];

    if (changes["linkedinKeywordsToggle"])
        linkedinFilter.keywordsToggleEnabled = !!changes["linkedinKeywordsToggle"].newValue;
    if (changes.keywords)
        linkedinFilter.keywordsFilter = changes.keywords.newValue || [];

    if (changes["linkedinDaysAgoToggle"])
        linkedinFilter.daysAgoFilterEnabled = !!changes["linkedinDaysAgoToggle"].newValue;
    if (changes.daysago)
        linkedinFilter.daysAgoFilter = changes.daysago.newValue?.["linkedinDaysAgoDropdown"] || null;

    linkedinFilter.hideJobs();
});

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: "linkedin" });
    linkedinFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });