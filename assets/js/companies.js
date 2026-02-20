/* global chrome */

document.addEventListener("DOMContentLoaded", async () => {

    const companiesAccordion = document.getElementById("collapseCompanies");
    const companiesHeader = document.getElementById("headingCompanies");
    const addBtn = document.getElementById("addCompany");
    const inputField = document.getElementById("companyInput");
    const clearAllBtn = document.getElementById("clearCompaniesBtn");
    const loadBtn = document.getElementById("loadCompaniesBtn");
    const saveBtn = document.getElementById("saveCompaniesBtn");
    const fileInput = document.getElementById("companiesFileInput");
    const companiesList = document.getElementById("companiesList");

    // Load previously saved companies
    chrome.storage.local.get("companies", data => {
        if (data.companies && Array.isArray(data.companies)) {
            renderCompanies(data.companies);
        }
    });

    // Render the placeholder
    function renderCompanies(companies) {
        companiesList.innerHTML = ""; // clear old items
        companies.forEach(company => addCompany(company, false));
    }

    companiesAccordion.addEventListener("show.bs.collapse", function () {
        companiesHeader.style.backgroundColor = "var(--bs-accordion-active-bg)";
    });
    companiesAccordion.addEventListener("hide.bs.collapse", function () {
        companiesHeader.style.backgroundColor = "white";
    });

    clearAllBtn.addEventListener("click", function(e) {
        e.stopPropagation(); // prevent the accordion from toggling
    });

    clearAllBtn.addEventListener("click", () => {
        companiesList.innerHTML = "";
        // Remove from Chrome storage
        chrome.storage.local.remove("companies", () => {
            console.log("🗑️ All companies cleared");
        });
    });

    // File upload dialog
    loadBtn.addEventListener("click", () => {
        fileInput.click();
    });

    // Handle file upload
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const lines = e.target.result.split("\n").map(l => l.trim()).filter(l => l.length > 0);
            renderCompanies(lines);
        };
        reader.readAsText(file);
        fileInput.value = ""
    });

    saveBtn.addEventListener("click", () => {
        // Get all company names from the list
        const companies = Array.from(companiesList.querySelectorAll("li span")).map(li => li.innerText);
        if (companies.length === 0) return;
        const blob = new Blob([companies.join("\n")], { type: "text/plain" });
        // Trigger download
        saveFile(blob);
    });

    async function saveFile(blob) {
        const handle = await window.showSaveFilePicker({
            suggestedName: "companies.txt",
            types: [{ description: "Text file", accept: { "text/plain": [".txt"] }}]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
    }

    function addCompany(value, insertAtFirst) {
        if (!value) return;

        // Create new item
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center pe-0";
        const span = document.createElement("span");
        span.textContent = value;
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm card-button me-2";
        deleteBtn.type = "button";
        deleteBtn.innerHTML = "×";

        // Delete logic
        deleteBtn.addEventListener("click", () => {
            li.remove();
            // Update stored
            const companies = Array.from(companiesList.querySelectorAll("li span")).map(s => s.innerText);
            chrome.storage.local.set({ companies }, () => {
                console.log(`🗑️ Deleted company: ${value}`);
            });
        });

        // Append elements
        li.appendChild(span);
        li.appendChild(deleteBtn);
        if (insertAtFirst) {
            companiesList.insertBefore(li, companiesList.firstChild);
        } else {
            companiesList.appendChild(li);
        }

        // Save updated list
        const companies = Array.from(companiesList.querySelectorAll("li span")).map(s => s.innerText);
        chrome.storage.local.set({ companies }, () => {
            console.log(`💾 Added company: ${value}`);
        });
    }

    // Add company button
    addBtn.addEventListener("click", (e) => addValueToList(e, inputField, addCompany));

    // Enter key press
    inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addValueToList(e, inputField, addCompany);
    });

    function addValueToList(e, inputField, addCompany) {
        e.preventDefault();
        const value = inputField.value.trim();
        addCompany(value, true);
        inputField.value = "";
    }

});