/* global chrome */

class LinkedinFilter extends JobFilter {
    getJobCards() {
        const jobListing = document.querySelector("main header")?.nextElementSibling;
        const jobCards = Array.from(jobListing?.querySelectorAll("ul > li.ember-view") || []);
        return jobCards.map(card => {
            // Company
            const companyName = "";
            // Position
            const positionTitle = "";
            // Skills
            const skills = [];
            // Days ago
            const numDaysAgo = 0;
            // Job description
            const descriptionTitle = "";
            const jobDescription = "";

            return {
                card,
                jobData: { companyName, positionTitle, skills, daysAgo: numDaysAgo, location, descriptionTitle, jobDescription },
                companyLink
            };
        });
    }
}

const linkedinFilter = new LinkedinFilter("linkedin", "afterend");

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: linkedinFilter.jobBoardName });
    linkedinFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });