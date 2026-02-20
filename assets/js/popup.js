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
        { toggleId: "linkedinApplicantsToggle", componentId: "linkedinApplicantsDropdown" },
        { toggleId: "linkedinCompaniesToggle", componentId: "linkedinCompaniesBtn" },
        { toggleId: "linkedinKeywordsToggle", componentId: "linkedinKeywordsBtn" },

        { toggleId: "jobgetherDaysAgoToggle", componentId: "jobgetherDaysAgoDropdown" },
        { toggleId: "jobgetherCompaniesToggle", componentId: "jobgetherCompaniesBtn" },
        { toggleId: "jobgetherKeywordsToggle", componentId: "jobgetherKeywordsBtn" },

        { toggleId: "justjoinDaysAgoToggle", componentId: "justjoinDaysAgoDropdown" },
        { toggleId: "justjoinCompaniesToggle", componentId: "justjoinCompaniesBtn" },
        { toggleId: "justjoinKeywordsToggle", componentId: "justjoinKeywordsBtn" },

        { toggleId: "web3careerDaysAgoToggle", componentId: "web3careerDaysAgoDropdown" },
        { toggleId: "web3careerCompaniesToggle", componentId: "web3careerCompaniesBtn" },
        { toggleId: "web3careerKeywordsToggle", componentId: "web3careerKeywordsBtn" }
    ]
    const updateButtonState = (toggle, component) => {
        if (component.type === "button") {
            component.classList.toggle("btn-outline-primary", toggle.checked);
            component.classList.toggle("btn-outline-secondary", !toggle.checked);
        }
        component.disabled = !toggle.checked;
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
                    const componentId = toggleButtons.find(m => m.toggleId === toggleId)?.componentId;
                    const component = document.getElementById(componentId);
                    updateButtonState(toggle, component);
                }
            }
        });
    });
    // Save state on change
    toggles.forEach(toggle => {
        toggle.addEventListener("change", () => {
            chrome.storage.local.set({
                [toggle.id]: toggle.checked
            });
        });
    });

    // Companies and keywords highlighting
    toggleButtons.forEach(function ({ toggleId, componentId }) {
        const toggle = document.getElementById(toggleId);
        const component = document.getElementById(componentId);
        // Update on user change
        toggle.addEventListener("change", () => updateButtonState(toggle, component));
    });

});