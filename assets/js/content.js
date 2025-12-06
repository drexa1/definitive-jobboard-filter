// content.js

let numHiddenJobs = 0;
let blacklist = [];

// Fetch blacklist from storage
async function fetchBlacklist() {
    const data = await chrome.storage.sync.get(null);
    blacklist = Object.values(data)
        .filter(item => item.company)
        .map(item => item.company.toLowerCase());
}

// Function to hide job cards based on company blacklist
function hideJobs() {
    numHiddenJobs = 0;
    // Select all offer-body divs
    const offers = document.querySelectorAll("#offer-body");
    offers.forEach(body => {
        // Find the company <p>
        const companyP = body.querySelector("p.font-medium");
        if (!companyP) return;
        const company = companyP.textContent.trim().toLowerCase();
        // Find the outer card
        const card = body.closest("div.box-shadow");
        if (!card) return;
        if (blacklist.some(b => company.includes(b))) {
            card.style.display = "none";
            card.style.visibility = "hidden";
            numHiddenJobs++;
        } else {
            card.style.display = "";
            card.style.visibility = "";
        }
    });

    // Update hidden jobs count for popup
    chrome.storage.sync.set({ numHiddenJobs });
}

// Initial run
(async () => {
    await fetchBlacklist();
    hideJobs();
})();

// Observe DOM changes for dynamically loaded cards
const observer = new MutationObserver(() => {
    hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });

// Periodically update blacklist in case it changes
setInterval(async () => {
    await fetchBlacklist();
    hideJobs();
}, 2000);
