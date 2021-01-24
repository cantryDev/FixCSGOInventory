let manifestUrl = "https://raw.githubusercontent.com/cantryDev/FixCSGOInventory/master/de/cantry/fixcsgoinventory/manifest.json";

/* Checks for updates once per browser start */
checkForUpdates();

async function checkForUpdates() {
    let newManifest = await fetch(manifestUrl).then(response => {
        return response.json()
    });
    let currentManifest = chrome.runtime.getManifest();

    let newVersion = newManifest.version.replace("\.", "");
    let currentVersion = currentManifest.version.replace("\.", "");

    if (newVersion > currentVersion) {

        chrome.notifications.create({
            "type": "basic",
            "iconUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAABP0lEQVRoge2aMUvDQBiG39w5FZy6SJ07O+QP5D+YHxGI4JZf4JRN6HBbF93c/AMZHbK0Q5cOTgldMhXqIB86NAiKKJqLbyPfM17gvve5u+/gIAEAJElyaq3NAUQAJjhsagCFiGTOuSpowy8AjNnJfkgjImemXfmhhQeAsbU2N9gfm6ESGRz+mf+KiWEn6IoKsFEBNirARgXYqACbwQsceZ8xukQeTzH69OMGDxdXuPFYzr9Ay/NmhWX19GG0wdpznf4EtivM50Vf078x+B5QATa99cBoGmM2i9+N7dZ3yK799sWf3kK7x8p7Hb2F2KgAGxVgE6Rp+sIO0YXB74AKsFEBNirARgXYqACbfyFQs0N0oDYA+n+49kdhRCQD0LCT/IJGRDJbluU2DMNbY8wJ9j99HLOTfUMN4F5Ezp1z1Ssi01F4/+G4JQAAAABJRU5ErkJggg==",
            "title": "New Update available",
            "message": `There is a new update available for this extension. Click the notification to visit the repository. Current version: ${currentManifest.version}. New version: ${newManifest.version}`
        });
        chrome.notifications.onClicked.addListener(() => {
            chrome.tabs.create({
                url: "https://github.com/cantryDev/FixCSGOInventory"
            });
        })
    }
}




