browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url) {
        return;
    }
    createPageAction();
});

browser.tabs.onActivated.addListener((activeInfo) => {
    createPageAction();
});

browser.pageAction.onClicked.addListener(function () {
    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        let tab = tabs[0];
        saveTab(tab.id, tab.url, tab.title, tab.pinned);
    });
});

browser.browserAction.onClicked.addListener(function () {
    browser.browserAction.setPopup({
        popup: "/tabs_list.html"
    });
});

updateBrowserAction(); // update badge text and title
