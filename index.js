chrome.webNavigation.onCompleted.addListener(details => {
    if (details.frameId === 0) {
        chrome.scripting.executeScript({
            target: { tabId: details.tabId },
            func: async () => {
                let companies = [];
                let hideIntervalId = null;
                let fetchWordsIntervalId = null;

                async function applyFilter() {
                    let numHiddenJobs = 0;
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
                    window.dispatchEvent(new CustomEvent('NUM_UPDATE', { detail: { data: numHiddenJobs } }));
                }

                async function getCompanies() {
                    companies.length = 0;
                    await chrome.storage.sync.get(null, (items) => {
                        Object.values(items).forEach((companyObj) => {
                            companies.push(companyObj.company);
                        })
                    })
                }

                await getCompanies();

                if (hideIntervalId)
                    clearInterval(hideIntervalId);
                hideIntervalId = setInterval(applyFilter.bind(null, words), 300);

                if (fetchWordsIntervalId)
                    clearInterval(fetchWordsIntervalId);
                fetchWordsIntervalId = setInterval(getCompanies, 2000);
            }
        });
    }
})