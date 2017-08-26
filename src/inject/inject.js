// element which will be clicked while opening a context menu
let clickedElement = null;

// variables for infinite scrolling conditions
let stopScrolling = false,
    isRunning = false;

// scrolling function will repeat every (MS)
const INTERVAL = 500;

let injected = false;

/**
  When user clicks somewhere on the page with Right mouse button - we save the
  clicked element in global variable(we will need it if user decides to scroll
  inside)
**/
document.addEventListener("mousedown", function(event){
  if(event.button == 2) {
    clickedElement = event.target;
  }
}, false);

/**
  The actual message listener when context menu is getting clicked
  @param object message = contains action and data from context menu element
**/
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
  switch (message.action) {
    // user wants to cancel infinite scroll
    case 'stop':
      // do not stop scrolling if it's not running
      if (isRunning) {
        stopScrolling = true;
      }
    break;

    case 'setInjected':
      injected = true;
    break;

    case 'checkInjected':
      sendResponse(true);
    break;

    // we are going to scroll by default
    default:
      prepareScroll(message);
    break;
  }

});

/**
  Runs when message from context menu is received and we will scroll
**/
function prepareScroll (message) {

  // infinite scrolling
  if ( message.infinite ) {
    beforeScroll(message.direction, -1);
  }
  // finite scrolling, ask user to enter number of repeats
  else {
    const total = +prompt(chrome.i18n.getMessage("how_many_times"), 5);

    // if user clicked OK not CANCEL - run hook
    if( total !== null ) {
      beforeScroll(message.direction, total);
    }
  }
}

/**
  Hook that runs before scrolling and launches it after
**/
function beforeScroll(direction, total) {

  // check if we are scrolling the instagram
  detectInstagram();

  // go go go!
  scroll(direction, total, closestScrollable(clickedElement));
}

/**
  Starts from element where user chose to scroll. If it's not scrollable - then
  go through all parents to the last <html> node and exit then
  If succeed: return node and max height of all these nodes
  @param node element = right-clicked element while opening a context menu
  @param int previousMaxHeight = max height of an element found during recursion
  @return object {node, maxHeight} or {false, maxHeight} if nothing has been found
**/
function closestScrollable (element, previousMaxHeight = 0) {
  let scrollableElement = element,
      overflowY = window.getComputedStyle(element)['overflow-y'],
      maxHeight = element.clientHeight || 0;

  // if we have new maximum
  if (previousMaxHeight > maxHeight) {
    maxHeight = previousMaxHeight;
  }

	// checking if current element has overflow / scroll
  if (( overflowY === 'scroll' || overflowY === 'auto' ) &&
      ( scrollableElement.scrollHeight > scrollableElement.clientHeight ))
    {
      // we got THE ONE
      return {
        node: scrollableElement,
        maxHeight: maxHeight
      };
    } else {
      // if he has a parent element - lets give him a try with recursion
      if (scrollableElement.parentElement) {
        return closestScrollable(scrollableElement.parentElement, maxHeight);
      } else {
        // or let's just return the max height of elements and false instead of node
        return {
          node: false,
          maxHeight: maxHeight
        };
      }
    }
}

/**
  The actual scroll function
  @param string direction "up/down"
  @param integer total = how many times to scroll
  @param node closestScrollable = item which will be scrolled
**/
function scroll (direction, total, closestScrollable) {

  let infinite = false;

  let appendix = '';

  // -1 if infinite
  if ( total == -1 ) {
    infinite = true;
    total = 1;
  } else {
    appendix = '\nClick me to switch to that tab.';
  }

  // iterator
  let doneTimes   = 0,
      safeCounter = 0; // safe because unused in conditions

  // interval to scroll again
  const interval = setInterval(() => {

    ++safeCounter;
    isRunning = true;

    // if we found an element that can be scrolled
    if (closestScrollable.node) {
      if (direction == "up")
        closestScrollable.node.scrollTop -= closestScrollable.maxHeight;
      else
        closestScrollable.node.scrollTop += closestScrollable.maxHeight;
    }
    // try to use window by default
    else {
      if (direction == "up")
        window.scrollTo(0, -getWindowHeight());
      else
        window.scrollTo(0, getWindowHeight());
    }

    // increment iterator if loop is finite
    if ( !infinite && doneTimes < total ) {
      doneTimes++;
    }

    // check if we are done with iterations
    if ( doneTimes >= total || stopScrolling === true ) {

      stopScrolling = false;
      isRunning = false;
      clearInterval(interval);

      // show user everything is ok
      chrome.extension.sendMessage({
        type: 'notification',
        notification: {
          id: 'scrolling',
          title: `Job's done!`, // http://classic.battle.net/war3/images/orc/units/portraits/peon.gif
          text: `I scrolled ${direction} (${safeCounter} times) and idle now.` + appendix
        }
      });
    }
  }, INTERVAL);
}

/**
  Check if current tab is an instagram website - click on "load more" button
  to scroll freely
**/
function detectInstagram() {
  if (window.location.href.includes('instagram')) {

    // find "load more" button
    let anchor = _x(`//a[contains(@href, "${window.location.pathname}")]`);

    // click on it if it is found
    if (anchor && anchor[0]) {
      anchor[0].click();
    }
  }
}

/**
  Obvious helper
**/
function getWindowHeight() {
  const body = document.body,
        html = document.documentElement;

  return Math.max(
    body.scrollHeight, body.offsetHeight, html.clientHeight,
    html.scrollHeight, html.offsetHeight
  );
}

/**
  Xpath helper
  @param string STR_XPATH = the actual xpath of searched element(s)
  @credits Thanks to https://stackoverflow.com/a/14669479/3687408
**/
function _x(STR_XPATH) {
  let xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null),
      xnodes = [],
      xres;

  while (xres = xresult.iterateNext()) {
    xnodes.push(xres);
  }

  return xnodes;
}
