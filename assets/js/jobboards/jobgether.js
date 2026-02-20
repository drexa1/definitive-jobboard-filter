/* global chrome */

class JobgetherFilter extends JobFilter {

    getJobCards() {
        const jobListing = document.querySelector('div[data-hk="s10000000000010"]');
        const jobCards = Array.from(jobListing.querySelectorAll(":scope > div:not(:first-child)"));
        return jobCards.map(card => {
            const heading = card.querySelector(".w-12.h-12")?.nextElementSibling;
            // Company
            const companyLink = heading?.querySelector("p");
            const companyName = heading?.querySelector("p a")?.innerText.trim();
            // Position
            const titleLink = heading?.querySelector('a[title]');
            const positionTitle = titleLink?.innerText.trim();
            // Skills
            const remoteRow = heading?.parentElement?.nextElementSibling;
            const skillLinks = remoteRow?.nextElementSibling?.querySelectorAll("a");
            const skills = Array.from(skillLinks || []).map(skill => skill.innerText.trim());
            // Days ago
            const daysAgo = titleLink?.nextElementSibling?.innerText;
            const numDaysAgo = daysAgo?.match(/\d+/) ? Number(daysAgo?.match(/\d+/)[0]) : 0;
            return {
                card,
                jobData: { companyName, positionTitle, skills, daysAgo: numDaysAgo },
                companyLink
            };
        });
    }
}

const jobgetherFilter = new JobgetherFilter("jobgether", "afterend");

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    chrome.runtime.sendMessage({ jobboard: jobgetherFilter.jobBoardName });
    jobgetherFilter.hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });