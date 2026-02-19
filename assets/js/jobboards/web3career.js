/* global chrome */

class Web3careerFilter extends JobFilter {

    constructor(jobBoardName, hideButtonsInsert) {
        super(jobBoardName, hideButtonsInsert);
        this.locationUSAEnabled = false;
    }

    async initialize() {
        await super.initialize();
        await this.fetchLocation();
    }

    async fetchLocation() {
        try {
            chrome.storage.local.get(`${this.jobBoardName}USAToggle`, async (result) => {
                this.locationUSAEnabled = !!result[`${this.jobBoardName}USAToggle`];
            });
        } catch (error) {
            console.warn("Storage access failed:", error);
        }
    }

    getJobCards() {
        const jobListing = document.querySelector("tbody.tbody");
        const jobCards = Array.from(jobListing.querySelectorAll(":scope > tr"));
        return jobCards.map(card => {
            if (card.id.startsWith("sponsor")) return
            const heading = card.querySelector("[data-logo-letter]")?.nextElementSibling;
            // Company
            const companyLink = card.querySelector(":scope > td:nth-of-type(2) > a > h3");
            const companyName = companyLink?.innerText.trim();
            // Position
            const titleLink = heading?.querySelectorAll(":scope > div > a > h2");
            const positionTitle = titleLink?.[0]?.innerText.trim();
            // Skills
            const skillsLink = card.querySelector(":scope > td:last-of-type > div");
            const skills = Array.from(skillsLink.children).map(skill => skill.textContent.trim());
            // Days ago
            const daysago = card.querySelector(":scope > td:nth-of-type(3) > time")?.textContent;
            const match = daysago?.match(/(\d+)([dh])/);
            const numDaysAgo = match && match[2] === "d" ? Number(match[1]) : 0;
            // Location
            const locationLinks = card.querySelector(":scope > td:nth-of-type(4)").children;
            const location = locationLinks.length === 1
                ? locationLinks[0].innerText?.trim()
                : Array.from(locationLinks).map(link => link.innerText?.trim()).join(", ");
            return {
                card,
                jobData: { companyName, positionTitle, skills, daysAgo: numDaysAgo, location },
                companyLink
            };
        });
    }

    handleStorageChanges(changes) {
        super.handleStorageChanges(changes);
        const keysOfInterest = [`${this.jobBoardName}USAToggle`];
        const relevantChanges = Object.keys(changes).some(key => keysOfInterest.includes(key));
        if (!relevantChanges) return;
        const locationToggleKey = `${this.jobBoardName}USAToggle`;
        if (changes[locationToggleKey]) this.locationUSAEnabled = !!changes[locationToggleKey].newValue;
        this.hideJobs();
    }

    shouldHide({ companyName, positionTitle, skills, daysAgo, location }) {
        const parentHide = super.shouldHide({ companyName, positionTitle, skills, daysAgo });
        // Extra stuff
        const isUSA = this.locationUSAEnabled && location.toLowerCase().includes("United States".toLowerCase());
        return parentHide || isUSA;
    }
}

const web3careerFilter = new Web3careerFilter("web3career", "afterend");

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: web3careerFilter.jobBoardName });
    web3careerFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });