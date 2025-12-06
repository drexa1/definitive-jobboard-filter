const blocked = ["kraken"]; // lowercase

// Remove this entry
function clear() {
  const bodies = document.querySelectorAll("#offer-body");
  bodies.forEach(body => {
    const children = body.children;
    if (!children || children.length < 2) return;
    const secondChild = children[1];
    const p = secondChild.querySelector("p.font-medium");
    if (!p) return;
    const company = p.textContent.trim().toLowerCase();
    if (blocked.includes(company)) {
      const card = body.closest("div.box-shadow");
      if (card) card.remove();
    }
  });
}

const obs = new MutationObserver(clean);
obs.observe(document.body, { childList: true, subtree: true });
clear();
