const ul = document.getElementById("blacklistedCompanies");
const form = document.getElementById("newCompanyForm");
const input = document.getElementById("companyInput");

async function load() {
    const items = await chrome.storage.sync.get(null);
    ul.innerHTML = "";
    for (const key of Object.keys(items)) {
        addListItem(items[key].company);
    }
}

function addListItem(company) {
    const li = document.createElement("li");
    li.textContent = company;
    li.addEventListener("click", async () => {
        await chrome.storage.sync.remove(company);
        void load();
    });
    ul.appendChild(li);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const c = input.value.trim().toLowerCase();
    if (!c) return;
    await chrome.storage.sync.set({ [c]: { company: c } });
    input.value = "";
    void load();
});

void load();