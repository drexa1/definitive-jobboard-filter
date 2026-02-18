/* global chrome */

/**
 * @typedef {Object} JobCard
 * @property {HTMLElement} card
 * @property {Object} jobData
 * @property {string} jobData.companyName
 * @property {string} jobData.positionTitle
 * @property {string[]} jobData.skills
 * @property {number} jobData.daysAgo
 * @property {HTMLElement|null} companyLink
 */

class JobFilter {

    constructor() {
        this.companiesToggleEnabled = false;
        this.companiesFilter = [];
        this.keywordsToggleEnabled = false;
        this.keywordsFilter = [];
        this.daysAgoFilterEnabled = false;
        this.daysAgoFilter = null;
        this.numHiddenJobs = 0;
        this.hideButtons = new Set();

        void this.initialize();
    }

    // Initial fetch and hide
    async initialize() {
        await this.fetchCompaniesFilter();
        await this.fetchKeywordsFilter();
        await this.fetchDaysAgo();
        this.hideJobs();
    }

    // Fetch company blacklist from storage
    async fetchCompaniesFilter() {
        try {
            const { companies = [] } = await chrome.storage.local.get("companies");
            this.hideButtons = new Set(companies);
            this.companiesFilter = companies;
        } catch (err) {
            console.warn("Storage access failed:", err);
        }
    }

    // Fetch keyword blacklist from storage
    async fetchKeywordsFilter() {
        try {
            const { keywords = [] } = await chrome.storage.local.get("keywords");
            this.keywordsFilter = keywords;
        } catch (err) {
            console.warn("Storage access failed:", err);
        }
    }

    // Fetch days-ago filter from storage
    async fetchDaysAgo() {
        try {
            chrome.storage.local.get("jobgetherDaysAgoToggle", async (checked) => {
                if (checked) {
                    const { daysago = [] } = await chrome.storage.local.get("daysago");
                    this.daysAgoFilter = daysago["jobgetherDaysAgoDropdown"];
                }
            });
        } catch (err) {
            console.warn("Storage access failed:", err);
        }
    }

    shouldHide(jobData) {
        const { companyName, positionTitle, skills, daysAgo } = jobData;
        const blacklistedCompany = this.companiesToggleEnabled
            ? this.companiesFilter.includes(companyName)
            : false;
        const blacklistedKeywordsInTitle = this.keywordsToggleEnabled
            ? this.keywordsFilter.some(kw => positionTitle.toLowerCase().includes(kw.toLowerCase()))
            : false;
        const blacklistedKeywordsInSkills = this.keywordsToggleEnabled
            ? skills.some(skill => this.keywordsFilter.some(kw => skill.toLowerCase().includes(kw.toLowerCase())))
            : false;
        const tooOld = this.daysAgoFilterEnabled ? this.isOld(daysAgo) : false;
        return blacklistedCompany || blacklistedKeywordsInTitle || blacklistedKeywordsInSkills || tooOld;
    }

    isOld(numDaysAgo) {
        switch (this.daysAgoFilter) {
            case "today": return numDaysAgo > 0;
            case "week": return numDaysAgo > 7;
            case "month": return numDaysAgo > 30;
            default: return false;
        }
    }

    /**
     * @abstract
     * @returns {JobCard[]}
     */
    getJobCards() {
        throw new Error("Must be implemented by subclass");
    }

    hideJobs() {
        this.getJobCards().forEach(({ card, jobData, companyLink }) => {
            if (this.shouldHide(jobData)) {
                card.style.display = "none";
                card.style.visibility = "hidden";
                this.numHiddenJobs++;
            } else {
                card.style.display = "";
                card.style.visibility = "";
                this.numHiddenJobs--;
                this.addHideBtn(card, companyLink, jobData.companyName);
            }
        });
    }

    // Add hide button (same as your current addHideBtn)
    addHideBtn(card, companyLink, companyName) {
        // No need to redraw the button if the position already has the hide button rendered
        if (this.hideButtons.has(card)) {
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
        btn.addEventListener("click", this.addCompany(companyName));
        companyLink.insertAdjacentElement("afterend", btn);
        this.hideButtons.add(card)
    }

    addCompany(companyName) {
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
}
