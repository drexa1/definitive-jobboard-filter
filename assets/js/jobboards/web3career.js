/* global chrome */

class Web3careerFilter extends JobFilter {

    constructor(jobBoardName, hideButtonsInsert) {
        super(jobBoardName, hideButtonsInsert);
        this.usaFilterEnabled = false;
        this.remoteFilterEnabled = false;
    }

    async initialize() {
        await super.initialize();
        await this.fetchLocation();
        await this.fetchRemote();
    }

    handleStorageChanges(changes) {
        super.handleStorageChanges(changes);

        const keysOfInterest = [`${this.jobBoardName}USAToggle`, `${this.jobBoardName}RemoteToggle`];
        const relevantChanges = Object.keys(changes).some(key => keysOfInterest.includes(key));
        if (!relevantChanges) return;

        const locationToggleKey = `${this.jobBoardName}USAToggle`;
        if (changes[locationToggleKey]) this.usaFilterEnabled = !!changes[locationToggleKey].newValue;

        const remoteToggleKey = `${this.jobBoardName}RemoteToggle`;
        if (changes[remoteToggleKey]) this.remoteFilterEnabled = !!changes[remoteToggleKey].newValue;
        this.hideJobs();
    }

    async fetchLocation() {
        try {
            chrome.storage.local.get(`${this.jobBoardName}USAToggle`, async (result) => {
                this.usaFilterEnabled = !!result[`${this.jobBoardName}USAToggle`];
            });
        } catch (error) {
            console.warn("Storage access failed:", error);
        }
    }

    async fetchRemote() {
        try {
            chrome.storage.local.get(`${this.jobBoardName}RemoteToggle`, async (result) => {
                this.remoteFilterEnabled = !!result[`${this.jobBoardName}RemoteToggle`];
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
            const skillsLink = card.querySelector(":scope > td:last-of-type > div")?.children;
            const skills = Array.from(skillsLink).map(skill => skill.innerText.trim());
            // Days ago
            const daysago = card.querySelector(":scope > td:nth-of-type(3) > time")?.innerText;
            const match = daysago?.match(/(\d+)([dh])/);
            const numDaysAgo = match && match[2] === "d" ? Number(match[1]) : 0;
            // Location
            const locationLinks = card.querySelector(":scope > td:nth-of-type(4)").children;
            const location = locationLinks.length === 1
                ? locationLinks[0].innerText?.trim()
                : Array.from(locationLinks).map(link => link.innerText?.trim()).join(", ");
            // Job description
            const descriptionColumn = jobListing.parentElement.parentElement.parentElement;
            const descriptionHeader = descriptionColumn.querySelector(":scope > div:nth-of-type(2) header");
            const descriptionTitle = descriptionHeader.querySelector("h2")?.innerText.trim();
            const descriptionBlocks = descriptionHeader?.nextElementSibling.children;
            const jobDescription = Array.from(descriptionBlocks).map(p => p.innerText?.trim()).join("\n");

            return {
                card,
                jobData: { companyName, positionTitle, skills, daysAgo: numDaysAgo, location, descriptionTitle, jobDescription },
                companyLink
            };
        });
    }

    shouldHide({ companyName, positionTitle, skills, daysAgo, location, descriptionTitle, jobDescription }) {
        const parentHide = super.shouldHide({ companyName, positionTitle, skills, daysAgo });
        // Extra stuff
        const isUSA = this.usaFilterEnabled && location.toLowerCase().includes("United States".toLowerCase());
        const isFakeRemote = this.remoteFilterEnabled && (
            jobDescription.toLowerCase().includes("on-site") ||
            jobDescription.toLowerCase().includes("onsite") ||
            jobDescription.toLowerCase().includes("hybrid")
        ) && positionTitle === descriptionTitle; // only the list item matching the current description open
        if (isFakeRemote)
            alert(`🤥 '${positionTitle}' at ${companyName} is not really remote`)
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