document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("newCompanyForm");
    form.addEventListener("submit", addCompany);
    // Initial render
    await renderList();
    // Listen for storage changes and update dynamically
    chrome.storage.onChanged.addListener(async (changes, areaName) => {
        if (areaName === "sync") {
            await renderList();
        }
    });
});

// Add a company to the blacklist
async function addCompany(event) {
    event.preventDefault();
    const inputEl = document.getElementById("companyInput");
    const companyName = inputEl.value.trim();
    inputEl.value = "";
    if (!companyName) return;
    const companyObj = {
        id: Date.now().toString(),
        company: companyName
    };
    await chrome.storage.sync.set({ [companyObj.id]: companyObj });
    await renderList();
}

// Remove a company from the blacklist
async function removeCompany(id) {
    if (!id) return; // Safety check
    await chrome.storage.sync.remove(id.toString());
    await renderList();
}

// Render the blacklist and hidden job count
async function renderList() {
    const items = await chrome.storage.sync.get(null);
    const listEl = document.getElementById("blacklistedCompanies");
    listEl.innerHTML = "";
    const explanationText = document.querySelector(".explanation-text");
    if (!items || Object.keys(items).length === 0) {
        explanationText.style.display = "none";
    } else {
        explanationText.style.display = "block";
    }
    // Render companies only (skip non-company keys like numHiddenJobs)
    Object.values(items).sort((a, b) => b.id - a.id).forEach((companyObj) => {
        if (!companyObj.company || !companyObj.id) return;
        const li = document.createElement("li");
        const p = document.createElement("p");
        p.textContent = companyObj.company;
        const btn = document.createElement("button");
        btn.textContent = "Delete";
        btn.addEventListener("click", () => removeCompany(companyObj.id));
        li.appendChild(p);
        li.appendChild(btn);
        listEl.appendChild(li);
    });
    // Update hidden jobs count
    document.querySelector(".jobs-hidden").textContent = items.numHiddenJobs ?? 0;
}