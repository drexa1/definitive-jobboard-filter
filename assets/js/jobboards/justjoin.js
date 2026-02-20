/* global chrome */

class JustjoinFilter extends JobFilter {

    getJobCards() {
        const jobListing = document.getElementById("up-offers-list");
        const jobCards = Array.from(jobListing.querySelectorAll(":scope > ul > li"));
        return jobCards.map(card => {
            const heading = card.querySelector("#offerCardCompanyLogo")?.nextElementSibling;
            const [firstRow, secondRow] = heading?.querySelectorAll(":scope > div");
            // Company
            const companyLink = secondRow?.querySelector(":scope > div:is(:first-child) > div");
            const companyName = companyLink.querySelector("p")?.innerText.trim();
            // Position
            const titleLink = firstRow.querySelectorAll(":scope > div > div > h3");
            const positionTitle = titleLink?.[0]?.innerText.trim();
            // Skills
            const skillsLink = secondRow?.querySelector(":scope > div:nth-of-type(2)");
            const skills = Array.from(skillsLink.children).slice(2).map(skill => skill.innerText.trim())
            // Days ago
            const daysAgo = secondRow?.querySelector(":scope > div:nth-of-type(2) > div")?.innerText;
            const numDaysAgo = daysAgo?.match(/\d+/) ? Number(daysAgo?.match(/\d+/)[0]) : 0;
            return {
                card,
                jobData: { companyName, positionTitle, skills, daysAgo: numDaysAgo },
                companyLink
            };
        });
    }

    isOld(jobDays) {
        switch (this.daysAgoFilter) {
            case "today": return jobDays > 0;  // show just "new"
            case "week":  return jobDays > 7;  // show the ones expiring 1 week or less
            case "month": return jobDays <= 7; // show the rest
            default: return false;
        }
    }
}

const justjoinFilter = new JustjoinFilter("justjoin", "beforebegin");

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: justjoinFilter.jobBoardName });
    justjoinFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });