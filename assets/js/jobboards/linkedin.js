/* global chrome */
console.log("👋 LinkedIn bastards")

// Fetch the blacklists from storage
async function fetchCompaniesBlacklist() {
    companiesBlacklist = await chrome.storage.local.get("companies");
}
async function fetchKeywordsBlacklist() {
    keywordsBlacklist = await chrome.storage.local.get("keywords");
}


// Function to hide cards
function hideJobs() {
    // const jobListing = document.querySelector('div[data-hk="s10000000000010"]');
    // Exclude the counter
    // const jobCards = jobListing.querySelectorAll(":scope > div:not(:first-child)");
    // jobCards.forEach(card => {
    //     // FILTER BY COMPANY
    //     const heading = card.querySelector(".w-12.h-12")?.nextElementSibling;
    //     const companyName = heading?.querySelector("p a")?.innerText;
    //     if (!companyName) return;
    //     const blacklistedCompany = companiesBlacklist.companies.find(blacklisted => blacklisted === companyName);
    //     // FILTER BY KEYWORDS
    //
    //     // DAYS AGO
    //
    //     if (blacklistedCompany) {
    //         card.style.display = "none";
    //         card.style.visibility = "hidden";
    //         numHiddenJobs++;
    //     }
    // });
}

// Initial fetch and hide
(async () => {
    await fetchCompaniesBlacklist();
    hideJobs();
})();

// Periodically update blacklist
setInterval(async () => {
    await fetchCompaniesBlacklist();
    hideJobs();
}, 500);

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    if (document.querySelector(".jobs-search-results")) {
        chrome.runtime.sendMessage({ jobboard: "linkedin" });
    }
    hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });