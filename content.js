function applyFilter(blacklist) {
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
    }
  });
}

function run() {
  chrome.storage.sync.get({ blacklist: [] }, ({ blacklist }) => {
    applyFilter(blacklist);
  });
}

const obs = new MutationObserver(run);
obs.observe(document.body, { childList: true, subtree: true });

run();
