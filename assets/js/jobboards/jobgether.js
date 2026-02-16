/* global chrome */
console.log("👋 Jobgether bastards")

let companiesBlacklist = [];
let keywordsBlacklist = [];
let numHiddenJobs = 0;

// Fetch the blacklists from storage
async function fetchCompaniesBlacklist() {
    try {
        const { companies = [] } = await chrome.storage.local.get("companies");
        companiesBlacklist = companies;
    } catch (err) {
        console.warn("Storage access failed:", err);
    }
}
async function fetchKeywordsBlacklist() {
    try {
        const { keywords = [] } = await chrome.storage.local.get("keywords");
        keywordsBlacklist = keywords;
    } catch (err) {
        console.warn("Storage access failed:", err);
    }
}


// Function to hide cards
function hideJobs() {
    const jobListing = document.querySelector('div[data-hk="s10000000000010"]');
    // Exclude the counter
    const jobCards = jobListing.querySelectorAll(":scope > div:not(:first-child)");
    jobCards.forEach(card => {
        // FILTER BY COMPANY
        const heading = card.querySelector(".w-12.h-12")?.nextElementSibling;
        const companyName = heading?.querySelector("p a")?.innerText;
        if (!companyName) return;
        const blacklistedCompany = companiesBlacklist.find(blacklisted => blacklisted === companyName);
        // FILTER BY KEYWORDS

        // DAYS AGO

        if (blacklistedCompany) {
            card.style.display = "none";
            card.style.visibility = "hidden";
            numHiddenJobs++;
        }
    });
}

// Initial fetch and hide
(async () => {
    await fetchCompaniesBlacklist();
    await fetchKeywordsBlacklist();
    hideJobs();
})();

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        if (changes.companies) {
            companiesBlacklist = changes.companies.newValue || [];
        }
        if (changes.keywords) {
            keywordsBlacklist = changes.keywords.newValue || [];
        }
        hideJobs();
    }
});

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    if (document.querySelector('div[data-hk="s10000000000010"]')) {
        chrome.runtime.sendMessage({ jobboard: "jobgether" });
    }
    hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });
