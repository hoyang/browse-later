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
        popup: "pages/tabs.html"
    });
});

(function() {
    loadOptions(function (saved_options) {
        var hide_tabs_right_menu = getOption(saved_options, defaultOptionsName.HideTabsRightMenu);
        if(!hide_tabs_right_menu) {
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
            
            browser.menus.create({
                id: browse_later_all_tab_group_menu_id,
                title: browser.i18n.getMessage("browseLaterAllTabGroupMenu"),
                contexts: ["tab"]
            });
        }

        if(getOption(saved_options, defaultOptionsName.MakeImageSearchable)) {
            makeImageSearchable();
        }
    });
})();

browser.menus.onClicked.addListener((info, tab) => {
    if(info.menuItemId == browse_later_tab_menu_id) {
        saveTab(tab.id, tab.url, tab.title, tab.pinned, tab.favIconUrl);
    } else if (info.menuItemId == browse_later_all_tab_menu_id) {
        browser.tabs.query({currentWindow: true, pinned: false}).then((tabs) => {
            saveTabs(tabs);
        });
    } else if (info.menuItemId == browse_later_all_tab_group_menu_id) {
        browser.tabs.query({currentWindow: true, pinned: false}).then((tabs) => {
            saveGroupTabs(tabs);
        });
    } else if(info.menuItemId == image_reverse_search_menu_id) {
        searchByImage(info.srcUrl);
    } else if(info.menuItemId == google_search_link_fix_menu_id) {
        browser.tabs.executeScript({
            code: 'let rwt=function(){}'
        });
    } else if(info.menuItemId == youtube_time_mark_menu_id) {
        browser.tabs.executeScript({
            code: `document.getElementById('movie_player').wrappedJSObject.getVideoUrl();`
        }).then((url) => {
            log("Saving Youtube URL: " + url);
            saveTab(tab.id, url, tab.title, tab.pinned, tab.favIconUrl);
        });
    }
});

updateBrowserAction(); // update badge text and title
