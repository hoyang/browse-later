
var showTabsList = function(event) {
    //let scrollbar_width = getScrollbarWidth();

    getAllSavesTabs().then((tabs) => {
        var tabs_list = document.getElementById("tab_list");
        var tab_list_header_container = document.getElementById("tab_list_header_container");
        var empty_list = document.getElementById("empty_list_container");

        if(tabs.length == 0) {
            empty_list.style.display = 'flex';
            tabs_list.style.display = 'none';
            tab_list_header_container.style.display = 'none';
        } else {

            empty_list.style.display = 'none';
            tab_list_header_container.style.display = 'flex';
            tabs_list.style.display = 'block';

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

                    tab_item_url.style.backgroundImage = "url(icons/icon.png)";
                    if(tab.favicon != undefined) {
                        tab_item_url.style.backgroundImage = "url("+ tab.favicon +")";
                        //console.log(tab.favicon);
                    }

                    var tab_item_menu = document.createElement("div");
                    tab_item_menu.setAttribute("class", "tab_item_menu");

                    var tab_item_copy = document.createElement("img");
                    tab_item_copy.setAttribute("class", "tab_list_item_img tab_list_item_img_nobg copy_item");
                    tab_item_copy.setAttribute("src", "icons/copy_url.png");
                    tab_item_copy.setAttribute("title", "Copy URL");
                    tab_item_copy.setAttribute("data-url", tab.url);

                    var tab_item_delete = document.createElement("img");
                    tab_item_delete.setAttribute("class", "tab_list_item_img tab_list_item_img_nobg delete_item");
                    tab_item_delete.setAttribute("src", "icons/delete.png");
                    tab_item_delete.setAttribute("title", "Remove");
                    tab_item_delete.setAttribute("data-url", tab.url);
                    
                    tab_item_menu.appendChild(tab_item_copy);
                    tab_item_menu.appendChild(tab_item_delete);

                    tab_item.appendChild(tab_item_url);
                    tab_item.appendChild(tab_item_menu);

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
