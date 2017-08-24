let storage_key = "BrowseLaterTabs";
let storage_opt_key = "BrowseLaterOptions";

let debug_log = true;

var log = function (msg) {
    if(debug_log) {
        console.log(msg);
    }
}

// choose storage backend
//TODO:: add sync storage option
var _storage_backend = browser.storage.local;
let local_settings = _storage_backend.get(storage_opt_key);
if(local_settings && local_settings.sync) {
    _storage_backend = browser.storage.sync;
    log("browser.storage.sync");
}

let storage_backend = _storage_backend;

let getScrollbarWidth = function () {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    // force scrollbars
    outer.style.overflow = "scroll";

    // add innerdiv
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    // remove divs
    outer.parentNode.removeChild(outer);
    return widthNoScroll - widthWithScroll;
}

let createPageAction = function () {
    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
      browser.pageAction.show(tabs[0].id);
    });
}

let getAllSavesTabs = function () {
    return new Promise(function (resolve, reject) {
        var saved_tabs = storage_backend.get(storage_key);
        saved_tabs.then((result) => {
            if(result && storage_key in result) {
                resolve(result[storage_key]);
            } else {
                resolve([]);
            }
        }, (error) => {
            log("getAllSavesTabs Reject, " + reason);
            reject(error);
        }).catch((reason) => {
            log("getAllSavesTabs Error, " + reason);
        });
    });
}

let saveTab = function (id, url, title, pinned) {
    getAllSavesTabs().then((tabs) => {
        var saved = false;
        tabs.forEach(function(tab) {
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
            tabs.push(save_tab);
        }
        var obj = {};
        obj[storage_key] = tabs;
        storage_backend.set(obj).then(() => {
            updateBrowserAction();
        });
        browser.tabs.remove(id);
    }).catch((reason) => {
        log("saveTab Error, " + reason);
    });
}

let updateBrowserAction = function (callback) {
    log("updateBrowserAction");
    getAllSavesTabs().then((tabs) => {
        if(tabs.length > 0) {
            browser.browserAction.setTitle({title: "Click to restore " + tabs.length.toString() + " tabs."});
            browser.browserAction.setBadgeText({text: tabs.length.toString()});
            browser.browserAction.setBadgeBackgroundColor({color: "green")});
        } else {
            browser.browserAction.setTitle({title: "Click heart icon inside addressbar to save tab."});
            browser.browserAction.setBadgeText({text: ""});
            browser.browserAction.setBadgeBackgroundColor({color: "gray")});
        }
        if(callback) callback();
    }).catch((reason) => {
        log("updateBrowserAction Error, " + reason);
    });
}

let openAllTabs = function() {
    getAllSavesTabs().then((tabs) => {
        tabs.forEach(function(tab) {
            browser.tabs.create({
                "url": tab.url,
                "pinned": tab.pinned
            });
        });
        storage_backend.remove(storage_key).then(() => {
            updateBrowserAction();
        });
        window.close();
    }).catch((reason) => {
        log("openAllTabs Error, " + reason);
    });

    return false;
}

let copyAllTabs = function(event) {
    event.preventDefault();

    getAllSavesTabs().then((tabs) => {
        var urls = "";
        tabs.forEach(function(tab) {
            urls += tab.url + "\n";
        });

        if (window.clipboardData && window.clipboardData.setData) {
            return clipboardData.setData("Text", urls);
        } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
            var textarea = document.createElement("textarea");
            textarea.textContent = urls;
            textarea.style.position = "fixed";
            document.body.appendChild(textarea);
            textarea.select();
            try {
                return document.execCommand("copy");
            } catch (ex) {
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
        window.close();
    }).catch((reason) => {
        log("copyAllTabs Error, " + reason);
    });

    return false;
}

let openTab = function(event) {
    event.preventDefault();

    getAllSavesTabs().then((tabs) => {
        var new_tabs = [];
        tabs.forEach(function(tab) {
            if(tab.url != event.target.href) {
                new_tabs.push(tab);
            }
        });

        var obj = {};
        obj[storage_key] = new_tabs;
        storage_backend.set(obj).then(() => {
            browser.tabs.create({ "url": event.target.href });
            updateBrowserAction(window.close);
        });
    }).catch((reason) => {
        log("openTab Error, " + reason);
    });

    return false;
}
