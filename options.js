
let defaultOptionsEventListener = [
    {key: "HideTabsRightMenu", event_listener: function (event){
        //saveOptions("HideTabsRightMenu", event.target.checked);
        if(!event.target.checked) {
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
        } else {
            browser.menus.remove(browse_later_tab_menu_id);
            browser.menus.remove(browse_later_all_tab_menu_id);
            browser.menus.remove(browse_later_all_tab_group_menu_id);
        }
    }},
    {key: "HideTabsCounterBadge", event_listener: function (event){
        //saveOptions("HideTabsCounterBadge", event.target.checked);
        updateBrowserAction();
    }},

    {key: "MakeImageSearchable", event_listener: function (event) {
        if(event.target.checked) {
            makeImageSearchable();
        } else {
            makeImageUnsearchable();
        }
    }}
];

let generate_boolean_section = function (key, val, default_val, event_listener) {
    var section = document.createElement("tr");
    var key_section = document.createElement("td");
    var val_section = document.createElement("td");
    var label = document.createElement("label");
    var checkbox = document.createElement("input");

    label.setAttribute(options_ui_text_attr, key);
    label.setAttribute("for", key);
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", key);
    if(event_listener != undefined) {
        checkbox.onclick = event_listener;
    }
    if(val || default_val) {
        checkbox.setAttribute("checked", "checked");
    }

    key_section.appendChild(label);
    val_section.appendChild(checkbox);

    section.appendChild(val_section);
    section.appendChild(key_section);

    return section;
}

let showOptionsUI = function () {
    loadOptions(function (saved_options){
        saved_options.forEach(function (e){
            if(typeof(e.default) == "boolean") {
                var event_listener = function (event) {
                    log(e.key + "[save]: " + event.target.checked);
                    saveOptions(e.key, event.target.checked);
                };
                defaultOptionsEventListener.forEach(function(el) {
                    if(e.key == el.key) {
                        event_listener = function (event) {
                            log(e.key + "[wrap]: " + event.target.checked);
                            saveOptions(e.key, event.target.checked);
                            el.event_listener(event);
                        };
                    }
                });

                document.getElementById((e.extra == undefined) ? "options_container" : "meddlesome_container").appendChild(generate_boolean_section(e.key, e.value, e.default, event_listener));
            }
        });
        
        document.querySelectorAll('[' + options_ui_text_attr + ']').forEach(function (e){
            e.innerText = _(e.getAttribute(options_ui_text_attr));
        });

        

    });
}

document.addEventListener("DOMContentLoaded", showOptionsUI);
