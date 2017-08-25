/**
  TODO:
    - replace all text with translations
    - infinite scroll
    - write a readme
    - description
    - test in telegram vk instagram facebook reddit
    - create screenshots for eng/ru opera chrome test in chrome
    - add donate button
**/
const NOTIFICATION_EXPIRES = 6000;
let startTabId = null;

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
  P.S. I tried to write a generator for them but seems like it's a complex waste
**/

/**
  Infinite scroll UP
**/
chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_up_infinite"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      action: 'scroll',
      direction: 'up',
      infinite: true
    });
  }
});

/**
  Infinite scroll DOWN
**/
chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_down_infinite"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      action: 'scroll',
      direction: 'down',
      infinite: true
    });
  }
});

//////////////////////////////S E P A R A T O R ///////////////////////
chrome.contextMenus.create( { type:'separator', parentId: "parent" } );

/**
  Infinite scroll STOP button
**/
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

//////////////////////////////S E P A R A T O R ///////////////////////
chrome.contextMenus.create( { type:'separator', parentId: "parent" } );

/**
  Scroll UP X times
**/
chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_up_n_times"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      action: 'scroll',
      direction: 'up'
    });
  }
});

/**
  Scroll DOWN X times
**/
chrome.contextMenus.create({
  title: chrome.i18n.getMessage("context_menu_down_n_times"),
  contexts:["all"],
  parentId: "parent",
  onclick: (info, tab) => {
    chrome.tabs.sendMessage(startTabId = tab.id, {
      action: 'scroll',
      direction: 'down'
    });
  }
});


/**
  On message receive (usually from injected script to background ext script)
  @param object message - JSON object that contains at least type field to switch on it
**/
chrome.runtime.onMessage.addListener( message => {

  switch (message.type) {

    case 'notification':

      // close all notifications before creating a new one
      chrome.notifications.getAll((items) => {
        if ( items ) {
          for (let key in items) {
            chrome.notifications.clear(key);
          }
        }
      });

      chrome.notifications.create(message.notification.id, {
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
