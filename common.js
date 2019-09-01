let log = function (msg) {
    if(debug_log) {
        console.log(msg);
    }
}

let saveOptions = function (key, val) {
    var obj = {};

    window.options.forEach(function(e, i) {
        if(e.key == key) {
            window.options[i].value = val;
            log(window.options[i]);
        }
    });

    obj[storage_opt_key] = window.options;
    storage_backend.set(obj);
}

let getOption = function (saved_options, key) {
    for(var i=0; i< saved_options.length; i++) {
        if(saved_options[i].key == key) {
            return (saved_options[i].value == undefined ? saved_options[i].default : saved_options[i].value);
        }
    }
    return undefined;
}

let loadOptions = function (callback) {
    storage_backend.get(storage_opt_key).then((result) => {
        if(result && storage_opt_key in result) {
            log("loadOptions");
            log(result[storage_opt_key]);
            callback(result[storage_opt_key]);
        } else {
            callback(defaultOptions);
        }
    }, (error) => {
        log("storage_opt_key error, " + error);
    }).catch((reason) => {
        log("storage_opt_key exception, " + reason);
    });
}

window.options = window.options || defaultOptions;

loadOptions(function (saved_options){ window.options = saved_options; });

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
        if(tab.url.startsWith("http://") || tab.url.startsWith("https://") || tab.url.startsWith("ftp://")) {
            browser.pageAction.show(tab.id);

            loadOptions(function (saved_options) {
                if(getOption(saved_options, defaultOptionsName.MakeGoogleGreatAgain)) {
                    makeGoogleGreatAgain(tab.url);
                }
                if(getOption(saved_options, defaultOptionsName.KeepYoutubeWatchedTime)) {
                    log("KeepYoutubeWatchedTime: " + tab.url);
                    makeYoutubeTimeMark(tab.url);
                }
            });
        }
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
            if(result && storage_key in result) {
                var urls = result[storage_key].filter(function(n){
                    return n != undefined
                });
                urls = clearDuplicateURLs(e => e.url, urls);
                resolve(urls);
            } else {
                resolve([]);
            }
        }, (error) => {
            log("getAllSavesTabs Reject, " + error);
            reject(error);
        }).catch((reason) => {
            log("getAllSavesTabs Error, " + reason);
        });
    });
}

let saveGroupTabs = function (window_tabs) {
    getAllSavesTabs().then((tabs) => {

        group_tabs = [];

        window_tabs.forEach(function(tab) {
            let save_tab = {
                "title": tab.title,
                "url": tab.url,
                "pinned": tab.pinned,
                "added_time": Date.now(),
                "favicon": tab.favIconUrl
            };
            group_tabs.push(save_tab);
        });

        var save_time = new Date();
        var group = {
            "title": save_time.toLocaleString(),
            "tabs": group_tabs,
            "favicon": "",
            "added_time": Date.now(),
            "group_id": save_time.getTime(),
            "url": save_time.getTime().toString()
        }

        tabs.push(group);

        var obj = {};
        obj[storage_key] = clearDuplicateURLs(e => e.url, tabs);
        storage_backend.set(obj).then(() => {
            updateBrowserAction();
        });

        loadOptions(function (saved_options) {
            var keep_tab_after_stash = getOption(saved_options, defaultOptionsName.KeepTabAfterStash);
            if(!keep_tab_after_stash) {
                browser.tabs.query({currentWindow: true, pinned: false}).then((tabs) => {
                    browser.tabs.create({
                        "url": "about:home",
                        "pinned": false
                    });

                    tabs.forEach(function(tab) {
                        browser.tabs.remove(tab.id);
                    });
                });
            }
        });

    }).catch((reason) => {
        log("saveTab Error, " + reason);
    });
}

let saveTabs = function (window_tabs) {
    getAllSavesTabs().then((tabs) => {
        window_tabs.forEach(function(tab) {
            let save_tab = {
                "title": tab.title,
                "url": tab.url,
                "pinned": tab.pinned,
                "added_time": Date.now(),
                "favicon": tab.favIconUrl
            };
            tabs.push(save_tab);
        });

        var obj = {};
        obj[storage_key] = clearDuplicateURLs(e => e.url, tabs);
        storage_backend.set(obj).then(() => {
            updateBrowserAction();
        });

        loadOptions(function (saved_options) {
            var keep_tab_after_stash = getOption(saved_options, defaultOptionsName.KeepTabAfterStash);
            if(!keep_tab_after_stash) {
                browser.tabs.query({currentWindow: true, pinned: false}).then((tabs) => {
                    browser.tabs.create({
                        "url": "about:home",
                        "pinned": false
                    });

                    tabs.forEach(function(tab) {
                        browser.tabs.remove(tab.id);
                    });
                });
            }
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
                "added_time": Date.now(),
                "favicon": favicon
            };
            tabs.push(save_tab);
        }
        var obj = {};
        obj[storage_key] = tabs;
        storage_backend.set(obj).then(() => {
            updateBrowserAction();
        });

        loadOptions(function (saved_options) {
            var keep_tab_after_stash = getOption(saved_options, defaultOptionsName.KeepTabAfterStash);
            browser.tabs.query({currentWindow: true}).then((tabs) => {
                if(tabs.length > 1) {
                    if(!keep_tab_after_stash) {
                        browser.tabs.remove(id);
                    }
                } else {
                    if(!keep_tab_after_stash) {
                        browser.tabs.create({
                            "url": "about:home",
                            "pinned": false
                        }).then(() => {
                            browser.tabs.remove(id);
                        });
                    }
                }
            });
        });
        
    }).catch((reason) => {
        log("saveTab Error, " + reason);
    });
}

let updateBrowserAction = function (callback) {
    log("updateBrowserAction");
    
    getAllSavesTabs().then((tabs) => {
        loadOptions(function (saved_options) {
            var hide_tabs_count_badge = getOption(saved_options, defaultOptionsName.HideTabsCounterBadge);
            if(!hide_tabs_count_badge) {
                if(tabs.length > 0) {
                    browser.browserAction.setTitle({title: browser.i18n.getMessage("browserActionCounterTitle").replace("$COUNT", tabs.length.toString())});
                    browser.browserAction.setBadgeText({text: tabs.length.toString()});
                    browser.browserAction.setBadgeBackgroundColor({color: "green"});
                } else {
                    browser.browserAction.setTitle({title: browser.i18n.getMessage("browserActionEmptyTitle")});
                    browser.browserAction.setBadgeText({text: ""});
                    browser.browserAction.setBadgeBackgroundColor({color: "gray"});
                }
            } else {
                browser.browserAction.setBadgeText({text: ""});
            }

            if(callback) callback();
        });
    }).catch((reason) => {
        log("updateBrowserAction Error, " + reason);
    });
}

let openAllTabs = function() {
    getAllSavesTabs().then((tabs) => {
        tabs.forEach(function(tab) {
            if("group_id" in tab) {
                tab.tabs.forEach(function(group_tab) {
                    browser.tabs.create({
                        "url": group_tab.url,
                        "pinned": group_tab.pinned
                    });
                });
            } else {
                browser.tabs.create({
                    "url": tab.url,
                    "pinned": tab.pinned
                });
            }
        });

        loadOptions(function (saved_options) {
            var keep_tab_after_restore = getOption(saved_options, defaultOptionsName.KeepTabAfterRestore);
            if(!keep_tab_after_restore) {
                storage_backend.remove(storage_key).then(() => {
                    updateBrowserAction(window.close);
                });
            } else {
                updateBrowserAction(window.close);
            }
        });
        
    }).catch((reason) => {
        log("openAllTabs Error, " + reason);
    });

    return false;
}

let openTabGroup = function(event) {
    event.preventDefault();
    var group_id = event.target.parentNode.parentNode.parentNode.parentNode.dataset.group_id;

    getAllSavesTabs().then((tabs) => {
        tabs.forEach(function(tab) {
            if("group_id" in tab && tab.group_id == Number.parseInt(group_id)) {
                tab.tabs.forEach(function(group_tab) {
                    browser.tabs.create({
                        "url": group_tab.url,
                        "pinned": group_tab.pinned
                    });
                });
            }
        });

        loadOptions(function (saved_options) {
            var keep_tab_after_restore = getOption(saved_options, defaultOptionsName.KeepTabAfterRestore);
            if(!keep_tab_after_restore) {
                removeTabGroup(event);
            }
        });

    }).catch((reason) => {
        log("openTabGroup Error, " + reason);
    });

    return false;
}

let openTabGroupNewWindow = function(event) {
    event.preventDefault();
    var group_id = event.target.parentNode.parentNode.parentNode.parentNode.dataset.group_id;

    getAllSavesTabs().then((tabs) => {
        tabs.forEach(function(tab) {
            if("group_id" in tab && tab.group_id == Number.parseInt(group_id)) {
                var urls = [];
                tab.tabs.forEach(function(group_tab) {
                    urls.push(group_tab.url);
                });

                browser.windows.create({
                    url: urls
                });
            }
        });

        loadOptions(function (saved_options) {
            var keep_tab_after_restore = getOption(saved_options, "KeepTabAfterRestore");
            if(!keep_tab_after_restore) {
                removeTabGroup(event);
            }
        });

    }).catch((reason) => {
        log("openTabGroupNewWindow Error, " + reason);
    });

    return false;
}

let copyAllTabs = function(event) {
    event.preventDefault();

    getAllSavesTabs().then((tabs) => {
        var urls = "";
        tabs.forEach(function(tab) {
            if("group_id" in tab) {
                tab.tabs.forEach(function(group_tab) {
                    urls += group_tab.url + "\n";
                });
            } else {
                urls += tab.url + "\n";
            }
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

    var group_id = event.target.parentNode.parentNode.parentNode.dataset.group_id;
    
    getAllSavesTabs().then((tabs) => {
        loadOptions(function (saved_options) {
            var keep_tab_after_restore = getOption(saved_options, defaultOptionsName.KeepTabAfterRestore);
            if(group_id != undefined) {
                var new_tabs = [];
                for(var i=0; i<tabs.length; i++) {
                    if("group_id" in tabs[i] && tabs[i].group_id == Number.parseInt(group_id)) {
                        var tab_group = tabs[i];
                        var new_group_tabs = [];
                        tab_group.tabs.forEach(function(tab) {
                            if(tab.url != event.target.href) {
                                new_group_tabs.push(tab);
                            } else {
                                if(keep_tab_after_restore) {
                                    new_group_tabs.push(tab);
                                }
                            }
                        });
                        tabs[i].tabs = new_group_tabs;
                        if(tabs[i].tabs.length > 0) {
                            new_tabs.push(tabs[i]);
                        } else {
                            event.target.parentNode.parentNode.parentNode.remove();
                        }
                    } else {
                        new_tabs.push(tabs[i]);
                    }
                }
                
                var obj = {};
                obj[storage_key] = new_tabs;
                storage_backend.set(obj).then(() => {
                    browser.tabs.create({ "url": event.target.href });
                    updateBrowserAction(window.close);
                });
            } else {
                var new_tabs = [];
                tabs.forEach(function(tab) {
                    if(tab.url != event.target.href) {
                        new_tabs.push(tab);
                    } else {
                        if(keep_tab_after_restore) {
                            new_tabs.push(tab);
                        }
                    }
                });
    
                var obj = {};
                obj[storage_key] = new_tabs;
                storage_backend.set(obj).then(() => {
                    browser.tabs.create({ "url": event.target.href });
                    updateBrowserAction(window.close);
                });
            }
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

let copyTabGroup = function (event) {
    event.preventDefault();
    
    var group_id = event.target.parentNode.parentNode.parentNode.parentNode.dataset.group_id;
    copy_string = "";
    
    getAllSavesTabs().then((tabs) => {
        if(group_id != undefined) {
            var copy_tabs = [];
            for(var i=0; i<tabs.length; i++) {
                if("group_id" in tabs[i]) {
                    if(tabs[i].group_id == Number.parseInt(group_id)) {
                        copy_tabs = tabs[i].tabs;
                        copy_tabs.forEach(function (tab){
                            copy_string += tab.url + "\n";
                        });
                    }
                }
            }
        }

        copyToClipboard(copy_string);
        window.close();    
    }).catch((reason) => {
        log("copyTabGroup Error, " + reason);
    });
    
    return false;
}

let removeTabGroup = function (event) {
    event.preventDefault();
    
    var group_id = event.target.parentNode.parentNode.parentNode.parentNode.dataset.group_id;
    event.target.parentNode.parentNode.parentNode.remove();

    getAllSavesTabs().then((tabs) => {
        if(group_id != undefined) {
            var new_tabs = [];
            for(var i=0; i<tabs.length; i++) {
                if("group_id" in tabs[i]) {
                    if(tabs[i].group_id != Number.parseInt(group_id)) {
                        new_tabs.push(tabs[i]);
                    }
                } else {
                    new_tabs.push(tabs[i]);
                }
            }
            
            var obj = {};
            obj[storage_key] = new_tabs;
            storage_backend.set(obj).then(() => {
                updateBrowserAction(window.close);
            });
        }
    }).catch((reason) => {
        log("removeTabGroup Error, " + reason);
    });

    return false;
}

let removeTab = function (event) {
    event.preventDefault();

    var group_id = event.target.parentNode.parentNode.parentNode.parentNode.dataset.group_id;

    var target_url = event.target.dataset.url;
    getAllSavesTabs().then((tabs) => {
        if(group_id != undefined) {
            var new_tabs = [];
            for(var i=0; i<tabs.length; i++) {
                if("group_id" in tabs[i] && tabs[i].group_id == Number.parseInt(group_id)) {
                    var tab_group = tabs[i];
                    var new_group_tabs = [];
                    tab_group.tabs.forEach(function(tab) {
                        if(tab.url != target_url) {
                            new_group_tabs.push(tab);
                        }
                    });
                    tabs[i].tabs = new_group_tabs;
                    if(tabs[i].tabs.length > 0) {
                        new_tabs.push(tabs[i]);
                    } else {
                        event.target.parentNode.parentNode.parentNode.parentNode.remove();
                    }
                } else {
                    new_tabs.push(tabs[i]);
                }
            }
            
            var obj = {};
            obj[storage_key] = new_tabs;
            storage_backend.set(obj).then(() => {
                updateBrowserAction();
            });
        } else {
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
        }

        event.target.parentNode.parentNode.remove();
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