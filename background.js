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
        saveTab(tab.id, tab.url, tab.title, tab.pinned, tab.favIconUrl);
    });
});

browser.browserAction.onClicked.addListener(function () {
    browser.browserAction.setPopup({
        popup: "/tabs_list.html"
    });
});

browser.menus.create({
    id: browse_later_tab_menu_id,
    title: browser.i18n.getMessage("browseLaterTabMenu"),
    contexts: ["tab"]
});

browser.menus.create({
    id: browse_later_all_tab_menu_id,
    title: browser.i18n.getMessage("browseLaterAllTabMenu"),
    contexts: ["tab"]
});

browser.menus.onClicked.addListener((info, tab) => {
    if(info.menuItemId == browse_later_tab_menu_id) {
        saveTab(tab.id, tab.url, tab.title, tab.pinned, tab.favIconUrl);
    } else if (info.menuItemId == browse_later_all_tab_menu_id) {
        browser.tabs.query({currentWindow: true, pinned: false}).then((tabs) => {
            saveTabs(tabs);
        });
    }
});

updateBrowserAction(); // update badge text and title
