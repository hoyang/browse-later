/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

// shamelessly copied from : https://github.com/palant/searchlinkfix
// 🔔Shame, 🔔Shame, 🔔Shame.

window.addEventListener("mousedown", saveLinkTarget, true);
window.addEventListener("mousedown", restoreLinkTarget, false);
window.addEventListener("click", interceptEvent, true);
window.addEventListener("keydown", interceptEvent, true);

function detach()
{
  try
  {
    window.removeEventListener("mousedown", saveLinkTarget, true);
    window.removeEventListener("mousedown", restoreLinkTarget, false);
    window.removeEventListener("click", interceptEvent, true);
    window.removeEventListener("keydown", interceptEvent, true);
  }
  catch (e)
  {
    // Ignore, likely "permission denied" because window has been unloaded
  }
}

let currentLink = null;
let currentLinkHref = null;

let hosts = {
  "groups.google.com": "google-groups",
  "yandex.com": "yandex",
  "yandex.com.tr": "yandex",
  "yandex.by": "yandex",
  "yandex.fr": "yandex",
  "yandex.kz": "yandex",
  "yandex.ru": "yandex",
  "yandex.ua": "yandex",
};

let containerAttr = {
  "google": ["id", "search"],
  "google-groups": ["role", "main"],
};

function isSearchPage(window)
{
  try
  {
    let host = window.location.host;
    if (hosts.hasOwnProperty(host))
      return hosts[host];

    host = host.replace(/^.*?\./, "");
    if (hosts.hasOwnProperty(host))
      return hosts[host];
  }
  catch (e)
  {
    // Getting host could throw on special pages
  }

  // Detect Google search pages by running some code in their context
  if (document instanceof HTMLDocument)
  {
    let eventName = "searchlinkfix" + Math.random();
    let script = document.createElement("script");
    script.async = false;
    script.textContent = "if (window.google && (window.google.sn || window.google.search))" +
                           "window.dispatchEvent(new Event('" + eventName + "'))";

    let isGoogle = false;
    let handler = () => isGoogle = true;
    window.addEventListener(eventName, handler, true);
    document.documentElement.appendChild(script);
    document.documentElement.removeChild(script);
    window.removeEventListener(eventName, handler, true);
    if (isGoogle)
      return "google";
  }

  if (document.readyState == "complete")
    detach();
  return null;
}

function isSearchResult(link)
{
  let type = isSearchPage(link.ownerDocument.defaultView);
  if (type === null)
    return false;

  if (containerAttr.hasOwnProperty(type))
  {
    let [attr, value] = containerAttr[type];
    for (let parent = link; parent; parent = parent.parentNode)
      if ("getAttribute" in parent && parent.getAttribute(attr) == value)
        return true;
  }
  return false;
}

function saveLinkTarget(event)
{
  let type = isSearchPage(event.target.ownerDocument.defaultView);
  if (!type)
    return;

  for (currentLink = event.target; currentLink; currentLink = currentLink.parentNode)
    if (currentLink.localName == "a")
      break;

  currentLinkHref = (currentLink ? currentLink.href : null);

  if (type == "yandex" && currentLink)
    currentLink.removeAttribute("data-counter");

  // Just in case event propagation is canceled
  setTimeout(restoreLinkTarget, 0);
}

function restoreLinkTarget(event)
{
  try
  {
    if (currentLink && currentLink.href != currentLinkHref)
      currentLink.href = currentLinkHref;
  }
  catch (e)
  {
    // Ignore, likely "can't access dead object" (currentLink has been garbage collected)
  }

  currentLink = currentLinkHref = null;
}

function interceptEvent(event)
{
  if (event.type == "keydown" && event.keyCode != event.DOM_VK_RETURN)
    return;

  let link = null;
  for (link = event.target; link; link = link.parentNode)
    if (link.localName == "a" || link.localName == "img")
      break;

  if (link && link.localName == "a" && isSearchResult(link) &&
      /^\s*https?:/i.test(link.getAttribute("href")))
  {
    event.stopPropagation();
  }
}