let storage_key = "BrowseLaterTabs";
let storage_opt_key = "BrowseLaterOptions";

let browse_later_tab_menu_id = "browse_later_tab_menu_id";
let browse_later_all_tab_menu_id = "browse_later_all_tab_menu_id";
let browse_later_all_tab_group_menu_id = "browse_later_all_tab_group_menu_id";

let image_reverse_search_menu_id = "ImageReverseSearch";
let google_search_link_fix_menu_id = "GoogleSearchLinkFix";
let youtube_time_mark_menu_id = "YoutubeTimeMark";

let debug_log = true;

let options_ui_text_attr = "data-text";

let defaultOptionsName = {
    MakeGoogleGreatAgain: "MakeGoogleGreatAgain",
    MakeImageSearchable: "MakeImageSearchable",
    ConsoleLogImagesURL: "ConsoleLogImagesURL",
    BypassSadPanda: "BypassSadPanda",
    KeepYoutubeWatchedTime: "KeepYoutubeWatchedTime",
    
    KeepTabAfterStash: "KeepTabAfterStash",
    PinTabGroupOnTop: "PinTabGroupOnTop",
    HideTabsCounterBadge: "HideTabsCounterBadge",
    HideTabsRightMenu: "HideTabsRightMenu",
    KeepTabAfterRestore: "KeepTabAfterRestore",
    ConfirmBeforeDeletion: "ConfirmBeforeDeletion",
    ReverseListOrder: "ReverseListOrder"
};

let defaultOptions = [
    {key: defaultOptionsName.KeepTabAfterStash, default: false},
    {key: defaultOptionsName.PinTabGroupOnTop, default: false},
    {key: defaultOptionsName.HideTabsCounterBadge, default: false},
    {key: defaultOptionsName.HideTabsRightMenu, default: false},
    {key: defaultOptionsName.KeepTabAfterRestore, default: false},
    {key: defaultOptionsName.ReverseListOrder, default: false},
    {key: defaultOptionsName.ConfirmBeforeDeletion, default: false, unavailable: true},

    {key: defaultOptionsName.BypassSadPanda, default: false, extra: true, unavailable: true},
    {key: defaultOptionsName.ConsoleLogImagesURL, default: false, extra: true},
    {key: defaultOptionsName.MakeGoogleGreatAgain, default: false, extra: true, unavailable: true},
    {key: defaultOptionsName.MakeImageSearchable, default: false, extra: true},
    {key: defaultOptionsName.KeepYoutubeWatchedTime, default: false, extra: true}
];

let storage_backend = browser.storage.local;
let _ = browser.i18n.getMessage;
