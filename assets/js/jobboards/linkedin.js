/* global chrome */

class LinkedinFilter extends JobFilter {

    constructor(jobBoardName, hideButtonsInsert) {
        super(jobBoardName, hideButtonsInsert);
        this.applicantsFilterEnabled = false;
        this.applicantsFilter = null;
        this.promotedFilterEnabled = false;
    }

    async initialize() {
        await super.initialize();
        await this.fetchApplicants();
        await this.fetchPromoted();
    }

    handleStorageChanges(changes) {
        super.handleStorageChanges(changes);

        const keysOfInterest = [
            `${this.jobBoardName}ApplicantsToggle`, `applicants`,
            `${this.jobBoardName}PromotedToggle`
        ];
        const relevantChanges = Object.keys(changes).some(key => keysOfInterest.includes(key));
        if (!relevantChanges) return;

        const applicantsToggleKey = `${this.jobBoardName}ApplicantsToggle`;
        if (changes[applicantsToggleKey]) this.applicantsFilterEnabled = !!changes[applicantsToggleKey].newValue;
        if (changes.applicants) this.applicantsFilter = changes.applicants.newValue?.[`${this.jobBoardName}ApplicantsDropdown`] || null;

        const promotedToggleKey = `${this.jobBoardName}PromotedToggle`;
        if (changes[promotedToggleKey]) this.promotedFilterEnabled = !!changes[promotedToggleKey].newValue;
        this.hideJobs();
    }

    async fetchApplicants() {
        try {
            chrome.storage.local.get(`${this.jobBoardName}ApplicantsToggle`, async (result) => {
                if (result) {
                    const { applicants = [] } = await chrome.storage.local.get("applicants"); // this is an array of jobboards
                    this.applicantsFilter = applicants[`${this.jobBoardName}ApplicantsDropdown`];
                }
            });

        } catch (error) {
            console.warn("Storage access failed:", error);
        }
    }

    async fetchPromoted() {
        try {
            chrome.storage.local.get(`${this.jobBoardName}PromotedToggle`, async (result) => {
                this.promotedFilterEnabled = !!result[`${this.jobBoardName}PromotedToggle`];
            });
        } catch (error) {
            console.warn("Storage access failed:", error);
        }
    }

    getJobCards() {
        const jobListing = document.querySelector("main header")?.nextElementSibling;
        const jobCards = Array.from(jobListing?.querySelectorAll("ul > li.ember-view") || []);
        return jobCards.map(card => {
            const logoDiv = card.querySelector(".ivm-image-view-model.job-card-list__logo-ivm");
            const heading = logoDiv?.parentElement?.nextElementSibling;
            // Company
            const companyLink = heading?.querySelector(":scope > div:nth-of-type(2) > span");
            const companyName = companyLink?.innerText.trim();
            // Position
            const positionLink = heading?.querySelectorAll(":scope > div:is(:first-child) > a");
            const positionTitle = positionLink?.[0]?.ariaLabel.trim();
            // Job description
            const jobDetails = document.querySelector(".job-details-jobs-unified-top-card__job-title");
            const descriptionTitle = jobDetails?.querySelector("h1 > a")?.innerText.trim();
            const descriptionBlocks = document.querySelector("#job-details div > p").children;
            const jobDescription = Array.from(descriptionBlocks).map(s => s.innerText?.trim()).join("\n");
            // Applicants
            const numApplicantsLabel = jobDetails?.parentElement?.nextElementSibling?.querySelector("div > span > span:last-of-type")?.innerText.trim();
            const numApplicants = numApplicantsLabel?.match(/\d+/) ? Number(numApplicantsLabel?.match(/\d+/)[0]) : -1;
            // Promoted/Viewed
            const viewedOrPromoted = heading?.parentElement?.parentElement?.querySelectorAll("ul > li");
            const isPromotedPosition = Array.from(viewedOrPromoted || []).some(li => li.innerText.trim().toLowerCase() === "promoted");
            return {
                card,
                jobData: { companyName, positionTitle, skills: [], daysAgo: -1, numApplicants, isPromotedPosition, descriptionTitle, jobDescription },
                companyLink
            };
        });
    }

    shouldHide({ companyName, positionTitle, skills, daysAgo, numApplicants, isPromotedPosition, descriptionTitle, jobDescription }) {
        const parentHide = super.shouldHide({ companyName, positionTitle, skills, daysAgo });
        // Extra stuff
        const isPromoted = this.promotedFilterEnabled && isPromotedPosition;
        const tooManyApplicants = this.applicantsFilterEnabled &&
            numApplicants > Number(this.applicantsFilter) &&
            positionTitle === descriptionTitle; // only the list item matching the current description open
        if (tooManyApplicants)
            alert(`🤥 '${positionTitle}' at ${companyName} has more than ${numApplicants} applicants`)
        return parentHide || isPromoted;
    }
}

const linkedinFilter = new LinkedinFilter("linkedin", "afterend");

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: linkedinFilter.jobBoardName });
    linkedinFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });