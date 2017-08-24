/**
  TODO:
    - replace all text with translations
    - infinite scroll
    - write a readme
    - icon/logo
    - description
    - all to github
    - test in telegram vk instagram facebook reddit
    - create screenshots for eng/ru opera chrome test in chrome
    - add donate button
**/
const NOTIFICATION_EXPIRES = 6000;
let startTabId = null,
    currentTab = null;

/**
  The main PARENT context menu element
**/
chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_main"),
  contexts:["all"],
  id: "parent"
});

/**
  Infinite scrolling section
**/
chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_up_forever"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      direction: 'up',
      times: "infinite"
    });
  }
});

chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_down_forever"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      direction: 'up',
      times: "infinite"
    });
  }
});

chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_stop"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      action: 'stop'
    });
  }
});

///////////////////////////////////////////////////////////////////////////
chrome.contextMenus.create({
  type:'separator',
  parentId: "parent"
});
///////////////////////////////////////////////////////////////////////////

chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_up_ten_times"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      direction: 'up',
      times: 10
    });
  }
});

chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_up_n_times"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      direction: 'up',
      times: 0
    });
  }
});

///////////////////////////////////////////////////////////////////////////
chrome.contextMenus.create({
  type:'separator',
  parentId: "parent"
});
///////////////////////////////////////////////////////////////////////////

chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_down_n_times"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      direction: 'down',
      times: 0
    });
  }
});

chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_down_ten_times"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      direction: 'down',
      times: 10
    });
  }
});

/**
  On message receive (usually from injected script to background ext script)
  @param message - JSON object that contains at least type field to switch on it
**/
chrome.runtime.onMessage.addListener( message => {

  switch (message.type) {

    case 'notification':

      // close all notifications before creating new
      chrome.notifications.getAll((items) => {
        if ( items ) {
          for (let key in items) {
            chrome.notifications.clear(key);
          }
        }
      });

      let notification = chrome.notifications.create(message.notification.id, {
        type: "basic",
        title: message.notification.title,
        message: message.notification.text,
        iconUrl: "/icons/icon48.png",
        isClickable: true
      });

      // switch to starting tab upon click on notification
      chrome.notifications.onClicked.addListener( notificationId => {
        chrome.tabs.update(startTabId, {selected: true});
      });

      // auto close notification
      setTimeout( () => chrome.notifications.clear(message.notification.id), NOTIFICATION_EXPIRES);
    break;
  }
});
