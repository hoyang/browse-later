let storage_key = "BrowseLaterTabs";
let storage_opt_key = "BrowseLaterOptions";
let browse_later_tab_menu_id = "browse_later_tab_menu_id";
let browse_later_all_tab_menu_id = "browse_later_all_tab_menu_id";

let debug_log = false;

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

let copyToClipboard = function (text) {
    if (window.clipboardData && window.clipboardData.setData) {
        clipboardData.setData("Text", text);
    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
        } catch (ex) {
            log(ex);
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

let createPageAction = function () {
    browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        let tab = tabs[0];

        browser.pageAction.show(tab.id);
    });
}

let clearDuplicateURLs = function (prop, urls) {
  var mySet = new Set();
  return urls.filter(function(x) {
    var key = prop(x), isNew = !mySet.has(key);
    if (isNew) mySet.add(key);
    return isNew;
  });
}

let getAllSavesTabs = function () {
    return new Promise(function (resolve, reject) {
        var saved_tabs = storage_backend.get(storage_key);
        saved_tabs.then((result) => {
            // back compatibility for previous release.
            let _saved_tabs_json = localStorage.getItem(storage_key);
            var _saved_tabs = [];
            if(_saved_tabs_json) {
                _saved_tabs = JSON.parse(_saved_tabs_json);
                // migrate storage
                log("migrate");
                log(_saved_tabs.concat(result[storage_key]));
                var urls = _saved_tabs.concat(result[storage_key]).filter(function(n){
                    return n != undefined
                });
                urls = clearDuplicateURLs(e => e.url, urls);
                var obj = {};
                obj[storage_key] = urls;
                storage_backend.set(obj);
                log("done");
                localStorage.removeItem(storage_key);
            }

            if(_saved_tabs.length > 0 || (result && storage_key in result)) {
                if(result && storage_key in result) {
                    var urls = _saved_tabs.concat(result[storage_key]).filter(function(n){
                        return n != undefined
                    });
                    urls = clearDuplicateURLs(e => e.url, urls);
                    resolve(urls);
                } else {
                    resolve(_saved_tabs);
                }
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

let saveTabs = function (window_tabs) {
    getAllSavesTabs().then((tabs) => {
        window_tabs.forEach(function(tab) {
            let save_tab = {
                "title": tab.title,
                "url": tab.url,
                "pinned": tab.pinned,
                "favicon": tab.favIconUrl
            };
            tabs.push(save_tab);
        });

        var obj = {};
        obj[storage_key] = clearDuplicateURLs(e => e.url, tabs);
        storage_backend.set(obj).then(() => {
            updateBrowserAction();
        });

        browser.tabs.query({currentWindow: true, pinned: false}).then((tabs) => {
            browser.tabs.create({
                "url": "about:home",
                "pinned": false
            });

            tabs.forEach(function(tab) {
                browser.tabs.remove(tab.id);
            });
        });

    }).catch((reason) => {
        log("saveTab Error, " + reason);
    });
}

let saveTab = function (id, url, title, pinned, favicon) {
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
                "pinned": pinned,
                "favicon": favicon
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
            browser.browserAction.setBadgeBackgroundColor({color: "green"});
        } else {
            browser.browserAction.setTitle({title: "Click heart icon inside addressbar to save tab."});
            browser.browserAction.setBadgeText({text: ""});
            browser.browserAction.setBadgeBackgroundColor({color: "gray"});
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
            updateBrowserAction(window.close);
        });
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
        copyToClipboard(urls);
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

let cleanupAllTabs = function () {
    storage_backend.remove(storage_key).then(() => {
        updateBrowserAction(window.close);
    });
}

let removeTab = function (event) {
    event.preventDefault();
    event.target.parentNode.parentNode.remove();
    var target_url = event.target.dataset.url;
    getAllSavesTabs().then((tabs) => {
        var new_tabs = [];
        tabs.forEach(function(tab) {
            if(tab.url != target_url) {
                new_tabs.push(tab);
            }
        });

        var obj = {};
        obj[storage_key] = new_tabs;
        storage_backend.set(obj).then(() => {
            updateBrowserAction();
        });
    }).catch((reason) => {
        log("removeTab Error, " + reason);
    });

    return false;
}

let copyTab = function (event) {
    event.preventDefault();
    var target_url = event.target.dataset.url;
    copyToClipboard(target_url);
    window.close();

    return false;
}
