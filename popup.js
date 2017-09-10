
var showTabsList = function(event) {
    //let scrollbar_width = getScrollbarWidth();

    getAllSavesTabs().then((tabs) => {
        var tabs_list = document.getElementById("tab_list");
        var tab_list_header_container = document.getElementById("tab_list_header_container");
        var empty_list = document.getElementById("empty_list_container");

        if(tabs.length == 0) {
            empty_list.style.display = 'inline-block';
            tabs_list.style.display = 'none';
            tab_list_header_container.style.display = 'none';
        } else {

            empty_list.style.display = 'none';
            tabs_list.style.display = 'inline-block';
            tabs_list.style.display = 'inline-block';

            tabs.forEach(function(tab) {
                if(typeof(tab) != 'undefined') {
                    var tab_item = document.createElement("li");
                    tab_item.setAttribute("class", "tab_list_item_li");

                    var tab_item_url = document.createElement("a");
                    tab_item_url.setAttribute("class", "tab_list_item_a");

                    tab_item_url.href = tab.url;
                    tab_item_url.innerText = tab.title;
                    tab_item_url.target = "_blank";
                    tab_item_url.title = tab.title;

                    var tab_item_favicon = document.createElement("img");
                    tab_item_favicon.setAttribute("class", "tab_list_item_img");
                    tab_item_favicon.setAttribute("src", "icons/icon.png");
                    if(tab.favicon != undefined) {
                        tab_item_favicon.setAttribute("src", tab.favicon);
                        //console.log(tab.favicon);
                    }

                    var tab_item_copy = document.createElement("img");
                    tab_item_copy.setAttribute("class", "tab_list_item_img tab_list_item_img_nobg");
                    tab_item_copy.setAttribute("src", "icons/copy.png");
                    tab_item_copy.setAttribute("title", "Copy this item's URL");
                    tab_item_copy.setAttribute("data-url", tab.url);

                    var tab_item_delete = document.createElement("img");
                    tab_item_delete.setAttribute("class", "tab_list_item_img tab_list_item_img_nobg");
                    tab_item_delete.setAttribute("src", "icons/trash.png");
                    tab_item_delete.setAttribute("title", "Remove this item");
                    tab_item_delete.setAttribute("data-url", tab.url);

                    tab_item.appendChild(tab_item_favicon);
                    tab_item.appendChild(tab_item_url);
                    tab_item.appendChild(tab_item_copy);
                    tab_item.appendChild(tab_item_delete);

                    tabs_list.appendChild(tab_item);

                    tab_item_url.addEventListener("click", openTab);
                    tab_item_delete.addEventListener("click", removeTab);
                    tab_item_copy.addEventListener("click", copyTab);
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
