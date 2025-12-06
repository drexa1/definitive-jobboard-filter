let blacklist = [];
let numHiddenJobs = 0;

// Fetch the blacklist from storage
async function fetchBlacklist() {
    const data = await chrome.storage.sync.get(null);
    blacklist = Object.values(data)
        .filter(item => item.company)
        .map(item => item.company.toLowerCase())
        .reverse();
}

// Function to hide cards
function hideJobs() {
    numHiddenJobs = 0;
    const cards = document.querySelectorAll("div.box-shadow.new-opportunity");
    cards.forEach(card => {
        const companyP = card.querySelector("p.font-medium");
        if (!companyP) return;
        const company = companyP.textContent.trim().toLowerCase();
        if (blacklist.some(b => company.includes(b))) {
            card.style.display = "none";
            card.style.visibility = "hidden";
            numHiddenJobs++;
        } else {
            card.style.display = "";
            card.style.visibility = "";
        }
    });
    // Store the number of hidden jobs for popup
    chrome.storage.sync.set({ numHiddenJobs });
}

// Initial fetch and hide
(async () => {
    await fetchBlacklist();
    hideJobs();
})();

// Observe DOM changes for dynamically loaded jobs
const observer = new MutationObserver(() => {
    hideJobs();
});
observer.observe(document.body, { childList: true, subtree: true });

// Periodically update blacklist
setInterval(async () => {
    await fetchBlacklist();
    hideJobs();
}, 500);
