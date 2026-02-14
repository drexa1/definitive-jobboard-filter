/* global chrome */

document.addEventListener("DOMContentLoaded", async () => {

    // Initialize carousel
    const jobCardsCarousel = new bootstrap.Carousel("#popupCarousel", { interval: false, ride: false });
    document.querySelectorAll(".go-to-card").forEach(btn => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.targetCard;
            jobCardsCarousel.to(target);
        });
    });

    const toggleButtons = [
        { toggleId: "linkedinCompaniesToggle", buttonId: "linkedinCompaniesBtn" },
        { toggleId: "linkedinKeywordsToggle", buttonId: "linkedinKeywordsBtn" },
        { toggleId: "jobgetherCompaniesToggle", buttonId: "jobgetherCompaniesBtn" },
        { toggleId: "jobgetherKeywordsToggle", buttonId: "jobgetherKeywordsBtn" },
        { toggleId: "justjoinCompaniesToggle", buttonId: "justjoinCompaniesBtn" },
        { toggleId: "justjoinKeywordsToggle", buttonId: "justjoinKeywordsBtn" },
        { toggleId: "web3careerCompaniesToggle", buttonId: "web3careerCompaniesBtn" },
        { toggleId: "web3careerKeywordsToggle", buttonId: "web3careerKeywordsBtn" }
    ]
    const updateButtonState = (toggle, button) => {
        button.classList.toggle("btn-outline-primary", toggle.checked);
        button.classList.toggle("btn-outline-secondary", !toggle.checked);
        button.disabled = !toggle.checked;
    };

    const toggles = Array.from(document.querySelectorAll("input[type='checkbox']"));
    const toggleIds = toggles.map(cb => cb.id);
    // Restore state
    chrome.storage.local.get(toggleIds, (result) => {
        toggleIds.forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle && result[toggleId] !== undefined) {
                toggle.checked = result[toggleId];
                // If it is the companies or keywords toggle, restore the button too
                if (toggleButtons.map(m => m.toggleId).includes(toggleId)) {
                    const buttonId = toggleButtons.find(m => m.toggleId === toggleId)?.buttonId;
                    const button = document.getElementById(buttonId);
                    updateButtonState(toggle, button);
                }
            }
        });
    });
    // Save state on change
    toggles.forEach(cb => {
        cb.addEventListener("change", () => {
            chrome.storage.local.set({
                [cb.id]: cb.checked
            });
        });
    });

    // Companies and keywords highlighting
    toggleButtons.forEach(function ({ toggleId, buttonId }) {
        const toggle = document.getElementById(toggleId);
        const button = document.getElementById(buttonId);
        // Update on user change
        toggle.addEventListener("change", () => updateButtonState(toggle, button));
    });

});