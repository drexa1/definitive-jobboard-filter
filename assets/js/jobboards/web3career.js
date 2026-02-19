/* global chrome */

class Web3careerFilter extends JobFilter {

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
            const titleLink = heading.querySelectorAll(":scope > div > a > h2");
            const positionTitle = titleLink[0]?.innerText.trim();
            // Skills
            const skillsLink = card.querySelector(":scope > td:last-of-type > div");
            const skills = Array.from(skillsLink.children).map(skill => skill.textContent.trim());
            // Days ago
            const daysago = card.querySelector(":scope > td:nth-of-type(3) > time")?.textContent;
            const match = daysago?.match(/(\d+)([dh])/);
            const numDaysAgo = match && match[2] === "d" ? Number(match[1]) : 0;
            return {
                card,
                jobData: { companyName, positionTitle, skills, daysAgo: numDaysAgo },
                companyLink
            };
        });
    }
}

const web3careerFilter = new Web3careerFilter("web3career", "afterend");

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: web3careerFilter.jobBoardName });
    web3careerFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });