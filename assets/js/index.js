// Handle form submission
document.getElementById("newCompanyForm").addEventListener("submit", addCompany);

// Listen for messages from content script about hidden jobs
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'NUM_UPDATE') {
        document.querySelector(".jobs-hidden").textContent = message.data;
    }
});

// Add a company to blacklist
async function addCompany(event) {
    event.preventDefault();
    const inputEl = document.getElementById("companyInput");
    const inputValue = inputEl.value.trim();
    inputEl.value = '';
    if (!inputValue) return;

    const companyObj = { id: Date.now(), company: inputValue.toLowerCase() };
    await chrome.storage.sync.set({ [companyObj.id]: companyObj });
    renderList();
}

// Remove a company from blacklist
async function removeCompany(id) {
    await chrome.storage.sync.remove(id.toString());
    renderList();
}

// Render the list of blacklisted companies
function renderList() {
    chrome.storage.sync.get(null, (items) => {
        const listEl = document.getElementById("blacklistedCompanies");
        listEl.innerHTML = "";
        const explanationText = document.querySelector(".explanation-text");
        if (!items || Object.keys(items).length === 0) {
            explanationText.style.display = "none";
            return;
        }
        explanationText.style.display = "block";
        Object.values(items).forEach((companyObj) => {
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
    });
}

// Initial render
renderList();
