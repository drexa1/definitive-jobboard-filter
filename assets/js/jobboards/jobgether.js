/* global chrome */
console.log("👋 Jobgether bastards")

class JobgetherFilter extends JobFilter {
    getJobCards() {
        const jobListing = document.querySelector('div[data-hk="s10000000000010"]');
        const jobCards = Array.from(jobListing.querySelectorAll(":scope > div:not(:first-child)"));
        return jobCards.map(card => {
            const heading = card.querySelector(".w-12.h-12")?.nextElementSibling;
            const companyName = heading?.querySelector("p a")?.innerText;
            const titleLink  = heading?.querySelector('a[title]');
            const positionTitle = titleLink?.textContent.trim();
            const remoteRow = heading?.parentElement?.nextElementSibling;
            const skillLinks = remoteRow?.nextElementSibling?.querySelectorAll("a");
            const skills = Array.from(skillLinks || []).map(el => el.textContent.trim());
            const daysAgo = titleLink?.nextElementSibling?.textContent;
            const numDaysAgo = daysAgo?.match(/\d+/) ? Number(daysAgo?.match(/\d+/)[0]) : 0;
            const companyLink = heading?.querySelector("p");
            return {
                card,
                jobData: { companyName, positionTitle, skills, daysAgo: numDaysAgo },
                companyLink
            };
        });
    }
}

const jobgetherFilter = new JobgetherFilter();

// Listen for storage changes (same as before, just update the instance)
chrome.storage.onChanged.addListener((changes) => {

    if (changes["jobgetherCompaniesToggle"])
        jobgetherFilter.companiesToggleEnabled = !!changes["jobgetherCompaniesToggle"].newValue;
    if (changes.companies)
        jobgetherFilter.companiesFilter = changes.companies.newValue || [];

    if (changes["jobgetherKeywordsToggle"])
        jobgetherFilter.keywordsToggleEnabled = !!changes["jobgetherKeywordsToggle"].newValue;
    if (changes.keywords)
        jobgetherFilter.keywordsFilter = changes.keywords.newValue || [];

    if (changes["jobgetherDaysAgoToggle"])
        jobgetherFilter.daysAgoFilterEnabled = !!changes["jobgetherDaysAgoToggle"].newValue;
    if (changes.daysago)
        jobgetherFilter.daysAgoFilter = changes.daysago.newValue?.["jobgetherDaysAgoDropdown"] || null;

    jobgetherFilter.hideJobs();
});

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: "jobgether" });
    jobgetherFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });