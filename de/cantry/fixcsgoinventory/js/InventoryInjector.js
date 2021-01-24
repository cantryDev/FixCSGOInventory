var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (!mutation.addedNodes) return
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            let node = mutation.addedNodes[i];
            if (node.tagName === "SCRIPT") {
                if (node.getAttribute("src") != null && node.getAttribute("src").includes("economy_v2.js")) {
                    let element = document.createElement("script");
                    element.setAttribute("src", chrome.extension.getURL("js/OverwrittenFunctions.js"));
                    document.head.appendChild(element);
                }
            }
        }
    })
})

observer.observe(document, {
    childList: true
    , subtree: true
    , attributes: false
    , characterData: false
})