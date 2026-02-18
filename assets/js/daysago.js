/* global chrome */

const daysAgoDropdowns = [
    { toggleId: "linkedinDaysAgoToggle", dropdownId: "linkedinDaysAgoDropdown" },
    { toggleId: "jobgetherDaysAgoToggle", dropdownId: "jobgetherDaysAgoDropdown" },
    { toggleId: "justjoinDaysAgoToggle", dropdownId: "justjoinDaysAgoDropdown" },
    { toggleId: "web3careerDaysAgoToggle", dropdownId: "web3careerDaysAgoDropdown" }
];

document.addEventListener("DOMContentLoaded", async () => {

    // Load previously saved days ago values
    function restoreDaysAgoDropdown(dropdownId) {
        chrome.storage.local.get("daysago", data => {
            const value = data.daysago?.[dropdownId];
            if (!value) return;
            const dropdown = document.getElementById(dropdownId);
            dropdown.value = value;
        });
    }

    // Save days ago values
    function saveDaysAgoDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        chrome.storage.local.get("daysago", data => {
            const daysAgoData = data.daysago || {};
            daysAgoData[dropdownId] = dropdown.value;
            chrome.storage.local.set({ daysago: daysAgoData });
        });
    }

    // Attach change listeners and restore saved state for all job boards
    daysAgoDropdowns.forEach(({ toggleId, dropdownId }) => {
        const toggle = document.getElementById(toggleId);
        const dropdown = document.getElementById(dropdownId);
        dropdown.addEventListener("change", () => saveDaysAgoDropdown(dropdownId));
        toggle.addEventListener("change", () => saveDaysAgoDropdown(dropdownId));
        restoreDaysAgoDropdown(dropdownId);
    });

});