console.log("👋 LinkedIn bastards")

fetch(chrome.runtime.getURL("panel.html"))
    .then(response => response.text())
    .then(html => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL("assets/styles/filters.css");
        document.head.appendChild(link);

        const container = document.createElement("div");
        container.innerHTML = html;
        document.body.appendChild(container.firstElementChild);
    });

// Signal we loaded the filter panel at this provider
chrome.runtime.sendMessage({ tab: "linkedin", loaded: true });