/* global chrome */

document.addEventListener("DOMContentLoaded", async () => {

    const addBtn = document.getElementById("addKeyword");
    const inputField = document.getElementById("keywordInput");
    const clearAllBtn = document.getElementById("clearKeywordsBtn");
    const loadBtn = document.getElementById("loadKeywordsBtn");
    const saveBtn = document.getElementById("saveKeywordsBtn");
    const fileInput = document.getElementById("keywordsFileInput");
    const keywordsList = document.getElementById("keywordsList");

    // Load previously saved keywords
    chrome.storage.local.get("keywords", data => {
        if (data.keywords && Array.isArray(data.keywords)) {
            renderKeywords(data.keywords);
        }
    });

    // Render the placeholder
    function renderKeywords(keywords) {
        keywordsList.innerHTML = ""; // clear old items
        keywords.forEach(keyword => addKeyword(keyword));
    }

    clearAllBtn.addEventListener("click", () => {
        keywordsList.innerHTML = "";
        // Remove from Chrome storage
        chrome.storage.local.remove("keywords", () => {
            console.log("🗑️ All keywords cleared");
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
            renderKeywords(lines);
        };
        reader.readAsText(file);
    });

    saveBtn.addEventListener("click", () => {
        // Get all keywords from the list
        const keywords = Array.from(keywordsList.querySelectorAll("li")).map(li => li.textContent);
        if (keywords.length === 0) return;
        const blob = new Blob([keywords.join("\n")], { type: "text/plain" });
        // Trigger download
        saveFile(blob);
    });

    async function saveFile(blob) {
        const handle = await window.showSaveFilePicker({
            suggestedName: "keywords.txt",
            types: [{ description: "Text file", accept: { "text/plain": [".txt"] }}]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
    }

    function addKeyword(value) {
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
            const keywords = Array.from(keywordsList.querySelectorAll("li span")).map(s => s.textContent);
            chrome.storage.local.set({ keywords }, () => {
                console.log(`🗑️ Deleted keyword: ${value}`);
            });
        });

        // Append elements
        li.appendChild(span);
        li.appendChild(deleteBtn);
        keywordsList.insertBefore(li, keywordsList.firstChild);

        // Save updated list
        const keywords = Array.from(keywordsList.querySelectorAll("li")).map(li => li.textContent);
        chrome.storage.local.set({ keywords }, () => {
            console.log(`💾 Added keyword: ${value}`);
        });
    }

    // Add keyword button
    addBtn.addEventListener("click", addKeyword);

    // Enter key press
    inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const value = inputField.value.trim();
            addKeyword(value);
            inputField.value = ""; // clear input
        }
    });

});