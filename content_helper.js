let makeGoogleGreatAgain = function (tab_url) {
    var url = new URL(tab_url);
    if(url.hostname == "www.google.com" && url.pathname == "/search") {
        browser.contextMenus.create({
            id: google_search_link_fix_menu_id,
            title: browser.i18n.getMessage(google_search_link_fix_menu_id),
            contexts: ['page'],
        });
    } else {
        makeGoogleDoEvil();
    }
}

let makeGoogleDoEvil = function () {
    browser.contextMenus.remove(google_search_link_fix_menu_id);
}

let makeImageSearchable = function () {
    browser.contextMenus.create({
		id: image_reverse_search_menu_id,
		title: browser.i18n.getMessage(image_reverse_search_menu_id),
		contexts: ['image'],
    });
}

let makeImageUnsearchable = function () {
    browser.contextMenus.remove(image_reverse_search_menu_id);
}

let searchByImage = function (image_src_url) {
    let google_image_search_url = "https://www.google.com/searchbyimage?image_url=%s";
    
    browser.tabs.create({
        url: google_image_search_url.replace('%s', encodeURIComponent(image_src_url)),
    });
}
