/* global chrome */

const applicantsDropdowns = [
    { toggleId: "linkedinApplicantsToggle", dropdownId: "linkedinApplicantsDropdown" },
];

document.addEventListener("DOMContentLoaded", async () => {

    // Save days ago values
    function saveApplicantsDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        chrome.storage.local.get("applicants", data => {
            const applicantsData = data.applicants || {};
            applicantsData[dropdownId] = dropdown.value;
            chrome.storage.local.set({ applicants: applicantsData });
        });
    }

    // Load previously saved days ago values
    function restoreApplicantsDropdown(dropdownId) {
        chrome.storage.local.get("applicants", data => {
            const value = data.applicants?.[dropdownId];
            if (!value) return;
            const dropdown = document.getElementById(dropdownId);
            dropdown.value = value;
        });
    }

    // Attach change listeners and restore saved state for all job boards
    applicantsDropdowns.forEach(({ toggleId, dropdownId }) => {
        const toggle = document.getElementById(toggleId);
        const dropdown = document.getElementById(dropdownId);
        dropdown.addEventListener("change", () => saveApplicantsDropdown(dropdownId));
        toggle.addEventListener("change", () => saveApplicantsDropdown(dropdownId));
        restoreApplicantsDropdown(dropdownId);
    });

});