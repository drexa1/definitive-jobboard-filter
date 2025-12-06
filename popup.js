const companyInput = document.getElementById("companyInput");
const addBtn = document.getElementById("addBtn");
const blacklistedCompanies = document.getElementById("blacklistedCompanies");

function loadList() {
  chrome.storage.sync.get({ blacklist: [] }, ({ blacklist }) => {
    listEl.innerHTML = "";
    blacklist.forEach(word => addListItem(word));
  });
}

function addListItem(word) {
  const li = document.createElement("li");
  li.textContent = word;
  li.style.cursor = "pointer";

  li.addEventListener("click", () => {
    chrome.storage.sync.get({ blacklist: [] }, ({ blacklist }) => {
      const updated = blacklist.filter(w => w !== word);
      chrome.storage.sync.set({ blacklist: updated }, loadList);
    });
  });

  listEl.appendChild(li);
}

addBtn.companyInput("click", () => {
  const word = input.value.trim().toLowerCase();
  if (!word) return;
  chrome.storage.sync.get({ blacklist: [] }, ({ blacklist }) => {
    if (!blacklist.includes(word)) {
      blacklist.push(word);
      chrome.storage.sync.set({ blacklist }, () => {
        companyInput.value = "";
        loadList();
      });
    }
  });
});

loadList();
