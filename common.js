let storage_key = "BrowseLaterTabs";

let createPageAction = function () {
    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
      browser.pageAction.show(tabs[0].id);
    });
}

let getAllSavesTabs = function () {
    let saved_tabs_json = localStorage.getItem(storage_key);
    var saved_tabs = [];
    if(saved_tabs_json) {
        saved_tabs = JSON.parse(saved_tabs_json);
    }
    return saved_tabs;
}

let saveTab = function (id, url, title, pinned) {
    var saved_tabs = getAllSavesTabs();
    var saved = false;
    saved_tabs.forEach(function(tab) {
        if(url == tab.url) {
            saved = true;
        }
    });
    if(!saved) {
        let save_tab = {
            "title": title,
            "url": url,
            "pinned": pinned
        };
        saved_tabs.push(save_tab);
    }
    localStorage.setItem(storage_key, JSON.stringify(saved_tabs));
    browser.tabs.remove(id);
    updateBrowserAction();
}

let updateBrowserAction = function () {
    var saved_tabs = getAllSavesTabs();
    browser.browserAction.setBadgeText({text: saved_tabs.length.toString()});
    browser.browserAction.setTitle({title: "Click to restore " + saved_tabs.length.toString() + " tabs."});
    browser.browserAction.setBadgeBackgroundColor({color: (saved_tabs.length > 0 ? "green" : "gray")});
}

let openAllTabs = function() {
    let saved_tabs = getAllSavesTabs();
    saved_tabs.forEach(function(tab) {
        browser.tabs.create({
            "url": tab.url,
            "pinned": tab.pinned
        });
    });
    localStorage.removeItem(storage_key);
    updateBrowserAction();
    window.close();
    return false;
}

let openTab = function(event) {
    event.preventDefault();
    browser.tabs.create({ "url": event.target.href });

    let saved_tabs = getAllSavesTabs();
    var new_tabs = [];
    saved_tabs.forEach(function(tab) {
        if(tab.url != event.target.href) {
            new_tabs.push(tab);
        }
    });

    localStorage.setItem(storage_key, JSON.stringify(new_tabs));
    updateBrowserAction();
    window.close();
    return false;
}
