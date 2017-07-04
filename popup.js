var showTabsList = function(event) {
    let saved_tabs = getAllSavesTabs();
    var tabs_list = document.createElement("ul");

    var tab_item = document.createElement("li");
    var tab_item_url = document.createElement("a");
    tab_item_url.id = "open_all_tabs";
    tab_item_url.href = "#";
    tab_item_url.innerText = "OPEN ALL TABS";
    tab_item_url.setAttribute("style", "text-align: center; font-weight: bold;");
    tab_item.appendChild(tab_item_url);
    tabs_list.appendChild(tab_item);

    saved_tabs.forEach(function(tab) {
        var tab_item = document.createElement("li");
        var tab_item_url = document.createElement("a");
        tab_item_url.href = tab.url;
        tab_item_url.innerText = tab.title;
        tab_item_url.target = "_blank";
        tab_item_url.title = tab.title;
        tab_item.appendChild(tab_item_url);
        tabs_list.appendChild(tab_item);
        tab_item_url.addEventListener("click", openTab);
    });

    var container = document.getElementById("container");
    container.appendChild(tabs_list);

    document.getElementById("open_all_tabs").addEventListener("click", openAllTabs);
};

document.addEventListener("DOMContentLoaded", showTabsList);
