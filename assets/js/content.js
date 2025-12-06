let numHiddenJobs = 0;
let blacklist = [];

// Function to fetch current blacklist from storage
async function fetchBlacklist() {
    const data = await chrome.storage.sync.get(null);
    blacklist = Object.values(data)
        .filter(item => item.company)
        .map(item => item.company.toLowerCase());
}

// Function to hide/show job cards based on blacklist
function applyFilter() {
    numHiddenJobs = 0;
    const offers = document.querySelectorAll("#offer-body");
    offers.forEach(body => {
        const children = body.children;
        if (!children || children.length < 2) return;
        const secondChild = children[1];
        const p = secondChild.querySelector("p.font-medium");
        if (!p) return;
        const company = p.textContent.trim().toLowerCase();
        const card = body.closest("div.box-shadow");
        if (!card) return;
        if (blacklist.some(b => company.includes(b))) {
            card.style.display = 'none';
            card.style.visibility = 'hidden';
            numHiddenJobs++;
        } else {
            card.style.display = '';
            card.style.visibility = '';
        }
    });
    // Update hidden jobs count in storage for popup
    chrome.storage.sync.set({ numHiddenJobs });
}

// Initial run
(async () => {
    await fetchBlacklist();
    applyFilter();
})();

// Observe DOM changes for dynamically loaded job cards
const observer = new MutationObserver(() => {
    applyFilter();
});
observer.observe(document.body, { childList: true, subtree: true });

// Poll blacklist from storage every 2 seconds in case it changes
setInterval(async () => {
    await fetchBlacklist();
    applyFilter();
}, 2000);
