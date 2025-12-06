let numHiddenJobs = 0;

function hideJobs(blacklist) {
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
            card.remove();
            numHiddenJobs++;
        }
    });
    chrome.runtime.sendMessage({ type: 'NUM_UPDATE', data: numHiddenJobs });
}

// Observe DOM changes (for dynamically loaded cards)
const observer = new MutationObserver(() => {
    chrome.storage.sync.get(null, (items) => {
        const blacklist = Object.values(items).map(i => i.company); // ✅ use i.company
        hideJobs(blacklist);
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
chrome.storage.sync.get(null, (items) => {
    const blacklist = Object.values(items).map(i => i.company); // ✅ use i.company
    hideJobs(blacklist);
});