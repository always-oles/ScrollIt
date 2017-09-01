// element which will be clicked while opening a context menu
let clickedElement = null;

// variables for infinite scrolling conditions
let stopScrolling = false,
    isRunning = false;

// scrolling function will repeat every (MS)
const INTERVAL = 400;

// retries before it decides it's stuck
const STUCK_RETRIES = 30;

// variables for stuck feature checking
let previousMaxElemHeight = 0,
    previousWindowHeight = 0,
    stuckCounter = 0;

// if this script was already injected in the webpage or not
let injected = false;

// global variable for the main loop
let interval = null;

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
  @param object sender = unused, prolly contains an extension data
  @param function sendResponse = callback function
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
  @param object message = contains data from context menu (direction, type of
  scrolling like infinite / finite)
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
  @param string direction = "up" / "down"
  @param int total = how many times we need to scroll (-1 if infinite)
**/
function beforeScroll(direction, total) {

  // check if we are scrolling the instagram, we need it once
  helpers.detectInstagram();

  // happens when launched from extensions bar
  if (clickedElement == null) {
    clickedElement = document.body;
  }

  // go go go
  scroll(direction, total, closestScrollable(clickedElement));
}

/**
  Starts from element where user chose to scroll. If it's not scrollable - then
  go through all parents to the last <html> node and exit then
  If succeed: return node and max height of all these nodes
  @param node element = right-clicked element while opening a context menu
  @param node previousMaxElement = save whitch element has the max height
  @param int previousMaxHeight = max height of an element found during recursion
  @return object {node, maxHeight} or {false, maxHeight} if nothing has been found
**/
function closestScrollable (element, previousMaxElement, previousMaxHeight = 0) {
  let scrollableElement = element,
      overflowY = window.getComputedStyle(element)['overflow-y'],
      maxHeight = element.clientHeight || 0,
      maxElement = element;


  // if we have new maximum
  if (previousMaxHeight > maxHeight) {
    maxHeight   = previousMaxHeight;
    maxElement  = previousMaxElement;
  }

	// checking if current element has overflow / scroll
  if (( overflowY === 'scroll' || overflowY === 'auto' ) &&
      ( scrollableElement.scrollHeight > scrollableElement.clientHeight ))
    {
      // we got THE ONE
      return {
        node: scrollableElement,
        maxHeight: maxHeight,
        maxElement: maxElement
      };
    } else {
      // if he has a parent element - lets give him a try with recursion
      if (scrollableElement.parentElement) {
        return closestScrollable(scrollableElement.parentElement, maxElement, maxHeight);
      } else {
        // or let's just return the max height of elements and false instead of node
        return {
          node: false,
          maxHeight: maxHeight,
          maxElement: maxElement
        };
      }
    }
}

/**
  The actual scroll function
  @param string direction "up/down"
  @param integer total = how many times to scroll
  @param node closestScrollable = div/container which will be scrolled
**/
function scroll (direction, total, closestScrollable) {

  let infinite = false;

  let appendix = '';

  // -1 if infinite
  if ( total == -1 ) {
    infinite = true;
    total = 1;
  } else {
    appendix = '\n' + chrome.i18n.getMessage("click_to_switch");
  }

  // iterator
  let doneTimes   = 0,
      safeCounter = 0; // safe because unused in conditions

  // interval to scroll again
  interval = setInterval(() => {

    // we need to these websites "load more" button every iteration
    helpers.detectReddit();
    helpers.detectYoutube();

    ++safeCounter;
    isRunning = true;

    // if we found an element that can be scrolled
    if (closestScrollable.node) {

      // get current height
      previousMaxElemHeight = closestScrollable.maxElement.clientHeight;

      if (direction == "up")
        closestScrollable.node.scrollTop -= closestScrollable.maxHeight;
      else
        closestScrollable.node.scrollTop += closestScrollable.maxHeight;

      // check if this is getting bigger
      if (closestScrollable.maxElement.clientHeight == previousMaxElemHeight) {

        // we are stuck
        if (++stuckCounter >= STUCK_RETRIES) {
          finishScrolling();
          imStuck(safeCounter, appendix);
        }
      } else {
        // reset stuck counter if progress goes
        stuckCounter = 0;
      }
    }
    // scrolling window by default
    else {

      // save previous value
      previousWindowHeight = helpers.getWindowHeight();

      if (direction == "up")
        window.scrollTo(0, -helpers.getWindowHeight());
      else
        window.scrollTo(0, helpers.getWindowHeight());

        // check for stucking
        if ( helpers.getWindowHeight() == previousWindowHeight ) {
          if (++stuckCounter >= STUCK_RETRIES) {
            finishScrolling();
            imStuck(safeCounter, appendix);
          }
        } else {
          // reset stuck counter if progress goes
          stuckCounter = 0;
        }
    }

    // increment iterator if loop is finite
    if ( !infinite && doneTimes < total ) {
      doneTimes++;
    }

    // check if we are done with iterations
    if ( doneTimes >= total || stopScrolling === true ) {

      finishScrolling();

      // show user everything is ok
      chrome.extension.sendMessage({
        type: 'notification',
        notification: {
          id: 'scrolling',
          title: chrome.i18n.getMessage("jobs_done"), // http://classic.battle.net/war3/images/orc/units/portraits/peon.gif
          text: chrome.i18n.getMessage("scrolling_result", [ chrome.i18n.getMessage(direction), safeCounter]) + appendix
        }
      });
    }
  }, INTERVAL);
}

/**
  Sends user a message that loop is stuck
  @param int safeCounter = how many times main loop went
  @param string appendix = "click to switch to that tab"
**/
function imStuck(safeCounter, appendix) {
  chrome.extension.sendMessage({
    type: 'notification',
    notification: {
      id: 'scrolling',
      title: chrome.i18n.getMessage("stuck_header"),
      text: chrome.i18n.getMessage("stuck", [safeCounter]) + appendix
    }
  });
}

/**
  A helper to reset variables
**/
function finishScrolling() {
  stopScrolling = false;
  isRunning = false;
  stuckCounter = 0;
  previousMaxElemHeight = 0;
  previousWindowHeight = 0;
  clearInterval(interval);
}
