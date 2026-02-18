/* global chrome */
console.log("👋 Jobgether bastards")

let companiesToggleEnabled = false
let companiesFilter = [];

let keywordsToggleEnabled = false
let keywordsFilter = [];

let daysAgoFilterEnabled = false
let daysAgoFilter = null;

let numHiddenJobs = 0;

let hideButtons = new Set(); // Hide buttons

// Fetch the blacklists from storage
async function fetchCompaniesFilter() {
    try {
        const { companies = [] } = await chrome.storage.local.get("companies");
        // No need to show hide button for already hidden companies
        hideButtons = new Set(companies);
        companiesFilter = companies;
    } catch (err) {
        console.warn("Storage access failed:", err);
    }
}

async function fetchKeywordsFilter() {
    try {
        const { keywords = [] } = await chrome.storage.local.get("keywords");
        keywordsFilter = keywords;
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

function addCompany(companyName) {
    return (event) => {
        event.stopPropagation();
        chrome.storage.local.get(["companies", "jobgetherCompaniesToggle"], ({ companies = [], jobgetherCompaniesToggle }) => {
            if (!companies.includes(companyName)) {
                companies.push(companyName);
                // Save companies
                chrome.storage.local.set({companies}, () => {
                    console.log(`💾 Added company: ${companyName}`);
                    if (!jobgetherCompaniesToggle) chrome.storage.local.set({ jobgetherCompaniesToggle: true });
                });
            }
        });
    };
}

function addHideBtn(card, companyLink, companyName) {
    // No need to redraw the button if the position already has the hide button rendered
    if (hideButtons.has(card)) {
        return
    }
    companyLink.style.display = "inline-flex";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.verticalAlign = "middle";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.marginLeft = "0.5rem";
    btn.innerHTML = `
      <svg viewBox="64 64 896 896" focusable="false" data-icon="eye-invisible" width="18" height="18" fill="#284e7a" aria-hidden="true" style="transition: fill .3s ease;">
        <path d="M508 624a112 112 0 00112-112c0-3.28-.15-6.53-.43-9.74L498.26 623.57c3.21.28 6.45.43 9.74.43zm370.72-458.44L836 122.88a8 8 0 00-11.31 0L715.37 232.23Q624.91 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.7 119.43 136.55 191.45L112.56 835a8 8 0 000 11.31L155.25 889a8 8 0 0011.31 0l712.16-712.12a8 8 0 000-11.32zM332 512a176 176 0 01258.88-155.28l-48.62 48.62a112.08 112.08 0 00-140.92 140.92l-48.62 48.62A175.09 175.09 0 01332 512z"></path>
        <path d="M942.2 486.2Q889.4 375 816.51 304.85L672.37 449A176.08 176.08 0 01445 676.37L322.74 798.63Q407.82 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5z"></path>
      </svg>
    `;
    // Persist company to storage blacklist
    btn.addEventListener("click", addCompany(companyName));
    companyLink.insertAdjacentElement("afterend", btn);
    hideButtons.add(card)
}

function isOld(numDaysAgo) {
    return (() => {
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
    })();
}

// Function to hide cards
function hideJobs() {
    const jobListing = document.querySelector('div[data-hk="s10000000000010"]');
    // Exclude the counter
    const jobCards = jobListing.querySelectorAll(":scope > div:not(:first-child)");
    jobCards.forEach(card => {
        // FILTER COMPANY ----------------------------------------------------------------------------------------------
        const heading = card.querySelector(".w-12.h-12")?.nextElementSibling;
        const companyName = heading?.querySelector("p a")?.innerText;
        if (!companyName) return;
        const blacklistedCompany = companiesToggleEnabled
            ? companiesFilter.find(blacklisted => blacklisted === companyName)
            : false;
        // FILTER POSITION TITTLE --------------------------------------------------------------------------------------
        const titleLink  = heading?.querySelector('a[title]');
        const positionTitle = titleLink?.textContent.trim();
        const blacklistedKeywordsInTitle = keywordsToggleEnabled && keywordsFilter.some(kw => positionTitle.toLowerCase().includes(kw.toLowerCase()));
        // FILTER SKILLS -----------------------------------------------------------------------------------------------
        const remoteRow = heading?.parentElement?.nextElementSibling;
        const skillLinks = remoteRow?.nextElementSibling?.querySelectorAll("a");
        const blacklistedKeywordsInSkills = Array.from(skillLinks).some(skillLink => {
            const skill = skillLink.textContent.trim().toLowerCase();
            return keywordsToggleEnabled && keywordsFilter.some(blacklisted => skill.includes(blacklisted.toLowerCase()));
        });
        // FILTER DAYS AGO ---------------------------------------------------------------------------------------------
        const daysAgo = titleLink?.nextElementSibling?.textContent;
        const numDaysAgo = daysAgo?.match(/\d+/) ? Number(daysAgo?.match(/\d+/)[0]) : 0;
        const tooOld = daysAgoFilterEnabled ? isOld(numDaysAgo) : false;
        if (blacklistedCompany || blacklistedKeywordsInTitle || blacklistedKeywordsInSkills || tooOld) {
            card.style.display = "none";
            card.style.visibility = "hidden";
            numHiddenJobs++;
        } else {
            card.style.display = "";
            card.style.visibility = "";
            numHiddenJobs--;
            // ADD HIDE ICON TO COMPANY --------------------------------------------------------------------------------
            const companyLink = heading?.querySelector("p");
            addHideBtn(card, companyLink, companyName);
        }
    });
}

// Initial fetch and hide
(async () => {
    await fetchCompaniesFilter();
    await fetchKeywordsFilter();
    await fetchDaysAgo();
    hideJobs();
})();

chrome.storage.onChanged.addListener((changes) => {

    if (changes["jobgetherCompaniesToggle"])
        companiesToggleEnabled = !!changes["jobgetherCompaniesToggle"].newValue;
    if (changes.companies)
        companiesFilter = changes.companies.newValue || [];

    if (changes["jobgetherKeywordsToggle"])
        keywordsToggleEnabled = !!changes["jobgetherKeywordsToggle"].newValue;
    if (changes.keywords)
        keywordsFilter = changes.keywords.newValue || [];

    if (changes["jobgetherDaysAgoToggle"])
        daysAgoFilterEnabled = !!changes["jobgetherDaysAgoToggle"].newValue;
    if (changes.daysago)
        daysAgoFilter = changes.daysago.newValue?.["jobgetherDaysAgoDropdown"] || null;

    hideJobs();
});

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    if (document.querySelector('div[data-hk="s10000000000010"]')) {
        chrome.runtime.sendMessage({ jobboard: "jobgether" });
    }
    hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });
