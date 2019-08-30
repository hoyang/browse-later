let tab_item_copy_title = _("tabItemCopyTitle");
let tab_item_remove_title = _("tabItemRemoveTitle");
let tab_item_group_open_all_title = _("tabItemGroupOpenAllTitle");
let tab_item_group_open_all_new_window_title = _("tabItemGroupOpenAllNewWindowTitle");

var createURLElementItem = function(tab) {
    var tab_item = document.createElement("li");
    tab_item.setAttribute("class", "tab_list_item_li");

    var tab_item_url = document.createElement("a");
    tab_item_url.setAttribute("class", "tab_list_item_a");

    tab_item_url.href = tab.url;
    tab_item_url.innerText = tab.title;
    tab_item_url.target = "_blank";
    tab_item_url.title = tab.title + "\n" + tab.url;

    tab_item_url.style.backgroundImage = "url(../icons/icon.png)";
    if(tab.favicon != undefined) {
        tab_item_url.style.backgroundImage = "url("+ tab.favicon +")";
    }

    var tab_item_menu = document.createElement("div");
    tab_item_menu.setAttribute("class", "tab_item_menu");

    var tab_item_copy = document.createElement("button");
    tab_item_copy.setAttribute("class", "tab_list_item_nobg copy_item");
    tab_item_copy.setAttribute("title", tab_item_copy_title);
    tab_item_copy.setAttribute("data-url", tab.url);

    var tab_item_delete = document.createElement("button");
    tab_item_delete.setAttribute("class", "tab_list_item_nobg delete_item");
    tab_item_delete.setAttribute("title", tab_item_remove_title);
    tab_item_delete.setAttribute("data-url", tab.url);

    tab_item_menu.appendChild(tab_item_copy);
    tab_item_menu.appendChild(tab_item_delete);

    tab_item.appendChild(tab_item_url);
    tab_item.appendChild(tab_item_menu);

    tab_item_url.addEventListener("click", openTab);
    tab_item_delete.addEventListener("click", removeTab);
    tab_item_copy.addEventListener("click", copyTab);

    return tab_item;
}

var createURLGroupElementItem= function(tab) {
    var tab_item_group_item = document.createElement("li");
    tab_item_group_item.setAttribute("class", "tab_list_item_li tab_list_item_group_li");
    tab_item_group_item.dataset.group_id = tab.group_id;

    var tab_group_item = document.createElement("li");
    tab_group_item.setAttribute("class", "tab_list_item_li tab_list_item_group_li");
    tab_group_item.dataset.collapsed = "true";

    var tab_item_url = document.createElement("a");
    tab_item_url.setAttribute("class", "tab_list_item_a");

    tab_item_url.href = "";
    tab_item_url.innerText = tab.title;
    tab_item_url.target = "_blank";
    tab_item_url.title = tab.title;

    tab_item_url.style.backgroundImage = "url(../icons/BrowseLater-32.png)";
    
    var tab_item_menu = document.createElement("div");
    tab_item_menu.setAttribute("class", "tab_item_menu");

    var tab_item_copy = document.createElement("button");
    tab_item_copy.setAttribute("class", "tab_list_item_nobg copy_item");
    tab_item_copy.setAttribute("title", tab_item_copy_title);

    var tab_item_delete = document.createElement("button");
    tab_item_delete.setAttribute("class", "tab_list_item_nobg delete_item");
    tab_item_delete.setAttribute("title", tab_item_remove_title);

    var tab_item_open_all = document.createElement("button");
    tab_item_open_all.setAttribute("class", "tab_list_item_nobg group_open_all hidden");
    tab_item_open_all.setAttribute("title", tab_item_group_open_all_title);

    var tab_item_open_all_new_window = document.createElement("button");
    tab_item_open_all_new_window.setAttribute("class", "tab_list_item_nobg group_open_all_new_window hidden");
    tab_item_open_all_new_window.setAttribute("title", tab_item_group_open_all_new_window_title);

    tab_item_menu.appendChild(tab_item_copy);
    tab_item_menu.appendChild(tab_item_delete);
    tab_item_menu.appendChild(tab_item_open_all);
    tab_item_menu.appendChild(tab_item_open_all_new_window);

    tab_group_item.appendChild(tab_item_url);
    tab_group_item.appendChild(tab_item_menu);

    tab_item_url.addEventListener("click", function (e){
        e.preventDefault();

        var collapsed = e.target.parentNode.dataset.collapsed;
        if(collapsed == "true") {
            log(e.target.parentNode.children[1].children);
            e.target.parentNode.children[1].children[0].className += " hidden";
            e.target.parentNode.children[1].children[1].className += " hidden";
            e.target.parentNode.children[1].children[2].className = e.target.parentNode.children[1].children[2].className.replace(" hidden", "");
            e.target.parentNode.children[1].children[3].className = e.target.parentNode.children[1].children[3].className.replace(" hidden", "");
        } else {
            log(e.target.parentNode.children[1].children);
            e.target.parentNode.children[1].children[0].className = e.target.parentNode.children[1].children[0].className.replace(" hidden", "");
            e.target.parentNode.children[1].children[1].className = e.target.parentNode.children[1].children[1].className.replace(" hidden", "");
            e.target.parentNode.children[1].children[2].className += " hidden";
            e.target.parentNode.children[1].children[3].className += " hidden";
        }

        var group_items = e.target.parentNode.parentNode.children;
        var group_item_list = [].slice.call(group_items);
        group_item_list.forEach(function(tab, index){
            if(index !== 0) {
                if(collapsed == "true") {
                    tab.className = tab.className.replace(" hidden", "");
                } else {
                    tab.className += " hidden";
                }
            }
        });

        if(collapsed == "true") {
            e.target.parentNode.dataset.collapsed = "false";
        } else {
            e.target.parentNode.dataset.collapsed = "true";
        }

        return false;
    });

    tab_item_delete.addEventListener("click", removeTabGroup);
    tab_item_copy.addEventListener("click", copyTabGroup);
    tab_item_open_all.addEventListener("click", openTabGroup);
    tab_item_open_all_new_window.addEventListener("click", openTabGroupNewWindow);

    var tab_item_group = document.createElement("ul");
    tab_item_group.setAttribute("class", "tab_item_group");

    tab_item_group.appendChild(tab_group_item);

    tab.tabs.forEach(function(tab){
        var tab_item = createURLElementItem(tab);
        tab_item.className += " group_item hidden";
        tab_item_group.appendChild(tab_item);
    });

    tab_item_group_item.appendChild(tab_item_group);

    return tab_item_group_item;
}

var showTabsList = function(event) {
    //let scrollbar_width = getScrollbarWidth();

    getAllSavesTabs().then((tabs) => {
        var tabs_list = document.getElementById("tab_list");
        var tab_list_header_container = document.getElementById("tab_list_header_container");
        var empty_list = document.getElementById("empty_list_container");

        document.getElementById("tab_list_open").innerText = browser.i18n.getMessage("tabListOpen");
        document.getElementById("tab_list_clear").innerText = browser.i18n.getMessage("tabListClear");
        document.getElementById("tab_list_copy").title = browser.i18n.getMessage("tabListCopy");
        
        if(tabs.length == 0) {
            empty_list.style.display = 'flex';
            tabs_list.style.display = 'none';
            tab_list_header_container.style.display = 'none';
            document.getElementsByClassName("empty_list_text")[0].innerHTML = browser.i18n.getMessage("slogan");
        } else {

            empty_list.style.display = 'none';
            tab_list_header_container.style.display = 'flex';
            tabs_list.style.display = 'block';

            loadOptions(function (saved_options) {
                if(getOption(saved_options, defaultOptionsName.PinTabGroupOnTop)) {
                    tabs.reverse().forEach(function(tab) {
                        if(typeof(tab) != 'undefined') {
                            if("tabs" in tab) {
                                let tab_group_item = createURLGroupElementItem(tab);
                                tabs_list.appendChild(tab_group_item);
                            }
                        }
                    });
                    tabs.reverse().forEach(function(tab) {
                        if(typeof(tab) != 'undefined') {
                            if(!("tabs" in tab)) {
                                let tab_item = createURLElementItem(tab);
                                tabs_list.appendChild(tab_item);
                            }
                        }
                    });
                } else { // !pin_tab_group_on_top
                    tabs.reverse().forEach(function(tab) {
                        if(typeof(tab) != 'undefined') {
                            if("tabs" in tab) {
                                let tab_group_item = createURLGroupElementItem(tab);
                                tabs_list.appendChild(tab_group_item);
                            } else {
                                let tab_item = createURLElementItem(tab);
                                tabs_list.appendChild(tab_item);
                            }
                        }
                    });
                }
            });
            
            document.getElementById("tab_list_open").addEventListener("click", openAllTabs);
            document.getElementById("tab_list_copy").addEventListener("click", copyAllTabs);
            document.getElementById("tab_list_clear").addEventListener("click", cleanupAllTabs);
        }
    }).catch((error) => {
        console.log(error);
    });
};

document.addEventListener("DOMContentLoaded", showTabsList);
