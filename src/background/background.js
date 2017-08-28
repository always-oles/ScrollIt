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
  When user selects another tab - we shold be sure that our script is injected
**/
chrome.tabs.onSelectionChanged.addListener( newTabId => {

  // getting the full info about that tab
  chrome.tabs.get(newTabId, (newTab) => {

    // if it's not a service url
    if (newTab.url && newTab.url.indexOf("chrome://") != 0 && newTab.url.indexOf("chrome-extension") != 0) {

      // check if we have access to injected script
      chrome.tabs.sendMessage(newTab.id, { action: 'checkInjected' }, response => {

        // if it gives undefined = not injected yet. set injected
        if (!response) {
          chrome.tabs.executeScript(newTab.id, { file: 'src/inject/helpers.js' });
          chrome.tabs.executeScript(newTab.id, { file: 'src/inject/inject.js' });
          chrome.tabs.sendMessage(newTab.id, { action: 'setInjected' });
        }
      });
    }
  });
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
