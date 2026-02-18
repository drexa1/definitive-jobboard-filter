/* global chrome */
console.log("👋 Jobgether bastards")

let companiesBlacklist = [];
let keywordsBlacklist = [];
let daysAgoFilter = null;

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

async function fetchDaysAgo() {
    try {
        chrome.storage.local.get("jobgetherDaysAgoToggle", async (checked) => {
            if (checked) {
                const { daysago = [] } = await chrome.storage.local.get("daysago");
                daysAgoFilter = daysago["jobgetherDaysAgoDropdown"];
            }
        });
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
        const titleLink  = heading?.querySelector('a[title]');
        const positionTitle = titleLink?.textContent.trim();
        const blacklistedKeywordsInTitle = keywordsBlacklist.some(blacklisted => positionTitle.toLowerCase().includes(blacklisted.toLowerCase()));
        const remoteRow = heading?.parentElement?.nextElementSibling;
        const skillLinks = remoteRow?.nextElementSibling?.querySelectorAll("a");
        const blacklistedKeywordsInSkills = Array.from(skillLinks).some(skillLink => {
            const skill = skillLink.textContent.trim().toLowerCase();
            return keywordsBlacklist.some(blacklisted => skill.includes(blacklisted.toLowerCase()));
        });
        // DAYS AGO
        const daysAgo = titleLink?.nextElementSibling?.textContent;
        const numDaysAgo = daysAgo?.match(/\d+/) ? Number(daysAgo?.match(/\d+/)[0]) : 0;
        const tooOld = daysAgoFilter !== null ? (() => {
            // filter enabled
            switch (daysAgoFilter) {
                case "today":
                    return numDaysAgo > 0;
                case "week":
                    return numDaysAgo > 7;
                case "month":
                    return numDaysAgo > 30;
                default:
                    return false;
            }
        })() : false;
        if (blacklistedCompany || blacklistedKeywordsInTitle || blacklistedKeywordsInSkills || tooOld) {
            card.style.display = "none";
            card.style.visibility = "hidden";
            numHiddenJobs++;
        } else {
            card.style.display = "";
            card.style.visibility = "";
            numHiddenJobs--;
        }
    });
}

// Initial fetch and hide
(async () => {
    await fetchCompaniesBlacklist();
    await fetchKeywordsBlacklist();
    await fetchDaysAgo();
    hideJobs();
})();

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        if (changes.companies)
            companiesBlacklist = changes.companies.newValue || [];
        if (changes.keywords)
            keywordsBlacklist = changes.keywords.newValue || [];
        if (changes.daysago)
            daysAgoFilter = changes.daysago.newValue?.["jobgetherDaysAgoDropdown"] || null;
        if (changes["jobgetherDaysAgoToggle"])
            daysAgoFilter = changes.jobgetherDaysAgoToggle.newValue || null;
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
