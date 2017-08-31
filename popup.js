
var showTabsList = function(event) {
    let scrollbar_width = getScrollbarWidth();

    getAllSavesTabs().then((tabs) => {
        var tabs_list = document.createElement("ul");

        var tab_item = document.createElement("li");

        var tab_item_open_all_tab = document.createElement("a");
        tab_item_open_all_tab.id = "open_all_tabs";
        tab_item_open_all_tab.href = "#";
        tab_item_open_all_tab.innerText = "OPEN ALL TABS";
        tab_item_open_all_tab.setAttribute("style", "float: left; text-align: center; font-weight: bold; width: 48%;");

        var tab_item_copy_all_tab = document.createElement("a");
        tab_item_copy_all_tab.id = "copy_all_tabs";
        tab_item_copy_all_tab.href = "#";
        tab_item_copy_all_tab.innerText = "COPY TABS URL";
        tab_item_copy_all_tab.setAttribute("style", "float: left; text-align: center; font-weight: bold; width: 48%;");

        tabs_list.appendChild(tab_item);
        tab_item.appendChild(tab_item_open_all_tab);
        tab_item.appendChild(tab_item_copy_all_tab);

        tabs.forEach(function(tab) {
            if(typeof(tab) != 'undefined') {
                var tab_item = document.createElement("li");
                var tab_item_url = document.createElement("a");
                tab_item_url.href = tab.url;
                tab_item_url.innerText = tab.title;
                tab_item_url.target = "_blank";
                tab_item_url.title = tab.title;
                tab_item.appendChild(tab_item_url);
                tabs_list.appendChild(tab_item);
                tab_item_url.addEventListener("click", openTab);
            }
        });

        var container = document.getElementById("container");
        container.appendChild(tabs_list);

        document.getElementById("open_all_tabs").addEventListener("click", openAllTabs);
        document.getElementById("copy_all_tabs").addEventListener("click", copyAllTabs);
    }).catch((error) => {
        console.log(error);
    });
};

document.addEventListener("DOMContentLoaded", showTabsList);
