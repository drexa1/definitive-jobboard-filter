let blacklist = [];

async function loadBlacklist() {
    const items = await chrome.storage.sync.get(null);
    blacklist = Object.values(items).map(x => x.company);
}

function applyFilter() {
    const offers = document.querySelectorAll("#offer-body");
    offers.forEach(body => {
        const kids = body.children;
        if (!kids || kids.length < 2) return;
        const second = kids[1];
        const p = second.querySelector("p.font-medium");
        if (!p) return;
        const company = p.textContent.trim().toLowerCase();
        const card = body.closest("div.box-shadow");
        if (!card) return;
        if (blacklist.some(b => company.includes(b))) {
            card.remove();
        }
    });
}

void loadBlacklist();

// Refresh blacklist every 2 seconds in case popup changes it
setInterval(() => loadBlacklist(), 2000);

// Run filter every 300ms
setInterval(() => applyFilter(), 300);