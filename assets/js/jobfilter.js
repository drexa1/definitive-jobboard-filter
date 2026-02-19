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

    constructor(jobBoardName, hideButtonsInsert) {
        console.log(`👋 ${jobBoardName} bastards`)
        this.jobBoardName = jobBoardName;
        this.hideButtonsInsert = hideButtonsInsert;

        this.companiesToggleEnabled = false;
        this.companiesFilter = [];

        this.keywordsToggleEnabled = false;
        this.keywordsFilter = [];

        this.daysAgoFilterEnabled = false;
        this.daysAgoFilter = null;

        this.numHiddenJobs = 0;
        this.hideButtons = new Set();

        // Attach storage listener to storage changes
        chrome.storage.onChanged.addListener(changes => this.handleStorageChanges(changes));
        void this.initialize();
    }

    // Initial fetch and hide
    async initialize() {
        await this.fetchDaysAgo();
        await this.fetchCompaniesFilter();
        await this.fetchKeywordsFilter();
        this.hideJobs();
    }

    handleStorageChanges(changes) {
        const keysOfInterest = [
            `${this.jobBoardName}DaysAgoToggle`, 'daysago',
            `${this.jobBoardName}CompaniesToggle`, 'companies',
            `${this.jobBoardName}KeywordsToggle`, 'keywords'
        ];
        const relevantChanges = Object.keys(changes).some(key => keysOfInterest.includes(key));
        if (!relevantChanges) return;

        const daysAgoToggleKey = `${this.jobBoardName}DaysAgoToggle`;
        if (changes[daysAgoToggleKey]) this.daysAgoFilterEnabled = !!changes[daysAgoToggleKey].newValue;
        if (changes.daysago) this.daysAgoFilter = changes.daysago.newValue?.[`${this.jobBoardName}DaysAgoDropdown`] || null;

        const companiesToggleKey = `${this.jobBoardName}CompaniesToggle`;
        if (changes[companiesToggleKey]) this.companiesToggleEnabled = !!changes[companiesToggleKey].newValue;
        if (changes.companies) this.companiesFilter = changes.companies.newValue || [];

        const keywordsToggleKey = `${this.jobBoardName}KeywordsToggle`;
        if (changes[keywordsToggleKey]) this.keywordsToggleEnabled = !!changes[keywordsToggleKey].newValue;
        if (changes.keywords) this.keywordsFilter = changes.keywords.newValue || [];

        this.hideJobs();
    }

    // Fetch days-ago filter from storage
    async fetchDaysAgo() {
        try {
            chrome.storage.local.get(`${this.jobBoardName}DaysAgoToggle`, async (result) => {
                if (result) {
                    const { daysago = [] } = await chrome.storage.local.get("daysago"); // this is an array of jobboards
                    this.daysAgoFilter = daysago[`${this.jobBoardName}DaysAgoDropdown`];
                }
            });
        } catch (error) {
            console.warn("Storage access failed:", error);
        }
    }

    // Fetch companies blacklist from storage
    async fetchCompaniesFilter() {
        try {
            chrome.storage.local.get(`${this.jobBoardName}CompaniesToggle`, async (result) => {
                this.companiesToggleEnabled = !!result[`${this.jobBoardName}CompaniesToggle`];
            });
            const { companies = [] } = await chrome.storage.local.get("companies");
            this.hideButtons = new Set(companies);
            this.companiesFilter = companies;
        } catch (error) {
            console.warn("Storage access failed:", error);
        }
    }

    // Fetch keywords blacklist from storage
    async fetchKeywordsFilter() {
        try {
            chrome.storage.local.get(`${this.jobBoardName}KeywordsToggle`, async (result) => {
                this.companiesToggleEnabled = !!result[`${this.jobBoardName}KeywordsToggle`];
            });
            const { keywords = [] } = await chrome.storage.local.get("keywords");
            this.keywordsFilter = keywords;
        } catch (error) {
            console.warn("Storage access failed:", error);
        }
    }

    hideJobs() {
        this.getJobCards().forEach((jobCard) => {
            if (!jobCard) return;

            const { card, jobData, companyLink } = jobCard;
            if (!card) return; // could be an ad

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

    /**
     * @abstract
     * @returns {JobCard[]}
     */
    getJobCards() {
        throw new Error("Must be implemented by subclass");
    }

    shouldHide({ companyName, positionTitle, skills, daysAgo }) {
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

    isOld(jobDays) {
        switch (this.daysAgoFilter) {
            case "today": return jobDays > 0;  // grab only the ones posted "today"
            case "week":  return jobDays > 7;  // grab posted no more than 7 days
            case "month": return jobDays > 30; // grab all
            default: return false;
        }
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

        // Button style (content scripts can't see the root css')
        btn.style.display = "inline-flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.verticalAlign = "middle";
        btn.style.width = "32px";
        btn.style.height = "32px";
        btn.style.borderRadius = "50%";
        btn.style.border = "none";
        btn.style.cursor = "pointer";
        btn.style.backgroundColor = "transparent";
        btn.style.transition = "background-color 0.2s ease";
        // Hover effect (gray background)
        btn.addEventListener("mouseenter", () => btn.style.backgroundColor = "lightblue");
        btn.addEventListener("mouseleave", () => btn.style.backgroundColor = "transparent");

        if (this.hideButtonsInsert === "afterend") btn.style.marginLeft = "0.5rem";
        // if (this.hideButtonsInsert === "beforebegin") btn.style.marginRight = "0.5rem";

        // Eye icon
        btn.innerHTML = `
          <svg viewBox="64 64 896 896" focusable="false" data-icon="eye-invisible" width="18" height="18" fill="indianred" aria-hidden="true" style="transition: fill .3s ease;">
            <path d="M508 624a112 112 0 00112-112c0-3.28-.15-6.53-.43-9.74L498.26 623.57c3.21.28 6.45.43 9.74.43zm370.72-458.44L836 122.88a8 8 0 00-11.31 0L715.37 232.23Q624.91 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.7 119.43 136.55 191.45L112.56 835a8 8 0 000 11.31L155.25 889a8 8 0 0011.31 0l712.16-712.12a8 8 0 000-11.32zM332 512a176 176 0 01258.88-155.28l-48.62 48.62a112.08 112.08 0 00-140.92 140.92l-48.62 48.62A175.09 175.09 0 01332 512z"></path>
            <path d="M942.2 486.2Q889.4 375 816.51 304.85L672.37 449A176.08 176.08 0 01445 676.37L322.74 798.63Q407.82 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5z"></path>
          </svg>
        `;

        // Persist company to storage blacklist
        btn.addEventListener("click", this.addCompany(companyName));
        companyLink.insertAdjacentElement(this.hideButtonsInsert, btn);
        this.hideButtons.add(card)
    }

    addCompany(companyName) {
        return (event) => {
            event.stopPropagation();
            event.preventDefault();
            chrome.storage.local.get(["companies", `${this.jobBoardName}CompaniesToggle`], ({ companies = [], companiesToggle }) => {
                if (!companies.includes(companyName)) {
                    companies.push(companyName);
                    // Save companies
                    chrome.storage.local.set({companies}, () => {
                        console.log(`💾 Added company: ${companyName}`);
                        const newToggleValue = {};
                        newToggleValue[`${this.jobBoardName}CompaniesToggle`] = true;
                        if (!companiesToggle)
                            chrome.storage.local.set(newToggleValue);
                    });
                }
            });
        };
    }
}
