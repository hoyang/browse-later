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

let makeGoogleDontChangeSearchResultURL = function (event) {
  if (event.type == "keydown" && event.keyCode != event.DOM_VK_RETURN)
    return;

  let link = null;
  for (link = event.target; link; link = link.parentNode)
    if (link.localName == "a" || link.localName == "img")
      break;

  if (link && link.localName == "a" && /^\s*https?:/i.test(link.getAttribute("href")))
    event.stopPropagation();
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
    var image_search_url = "https://www.google.com/searchbyimage?image_url=%s";
    if(browser.i18n.getUILanguage() == "zh-CN") { // Baidu for chinese people, google was blocked.
        image_search_url = "https://image.baidu.com/pcdutu?queryImageUrl=%s"
    }
    browser.tabs.create({
        url: image_search_url.replace('%s', encodeURIComponent(image_src_url)),
    });
}

let makeYoutubeTimeMark = function (tab_url) {
    var url = new URL(tab_url);
    log("makeYoutubeTimeMark: " + tab_url);
    if(url.host === "www.youtube.com"
        && url.pathname === "/watch"
        && url.search.startsWith("?v=")) {
        browser.contextMenus.create({
            id: youtube_time_mark_menu_id,
            title: browser.i18n.getMessage(youtube_time_mark_menu_id),
            contexts: ['page'],
        });
    } else {
        dontMakeYoutubeTimeMark();
    }
}

let dontMakeYoutubeTimeMark = function () {
    browser.contextMenus.remove(youtube_time_mark_menu_id);
}