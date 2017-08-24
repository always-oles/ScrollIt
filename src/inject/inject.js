let clickedElement = null;

/**
  When user clicks somewhere on the page with Right mouse button - we save the
  clicked element in global variable(we will need it if user decides to scroll
  inside)
**/
document.addEventListener("mousedown", function(event){
    if(event.button == 2)
        clickedElement = event.target;
}, false);

/**
  The actual message listener when context menu is getting clicked
  @param object message = contains properties of the clicked CONTEXT_MENU
  element and action
**/
chrome.runtime.onMessage.addListener(message => {

	if (message.action && message.action == 'stop') {
		chrome.extension.sendMessage({
			type: 'notification',
			notification: {
				id: 'info',
				title: `Message`,
				text: `Lets stop for a sec...`
			}
		});
		return;
	}

	// if its a number (default 10 or 0 for user prompt)
	if ( !isNaN(message.times) ) {

		// if user selected N times
		if ( message.times === 0 ) {
			const userTimes = +prompt(chrome.i18n.getMessage("how_many_times"), 10);

			// if user didn't click the cancel button
			if(userTimes !== null)
				beforeScroll(message.direction, userTimes);
		}
		// user chose default 10 times
		else {
			beforeScroll(message.direction, message.times);
		}
	}
	// infinite times
	else {
		chrome.extension.sendMessage({
			type: 'notification',
			notification: {
				id: 'info',
				title: `Message`,
				text: `Infinite scroll will be ready soon!`
			}
		});
	}
});

/**
  Hook that runs before scrolling and launches it after
**/
function beforeScroll(direction, times) {

	// check if we are scrolling the instagram
	detectInstagram();

	// go go go!
	scroll(direction, times, closestScrollable(clickedElement));
}

/**
  Starts from element where user chose to scroll. If it's not scrollable - then
  go through all parents to the last <html> node and exit then
  If succeed: return node and max height of all these nodes
  @param node element = right-clicked element while opening a context menu
  @param int previousMaxHeight = max height of an element found during recursion
  @return object {node, maxHeight} or {false, maxHeight} if nothing has been found
**/
function closestScrollable(element, previousMaxHeight = 0) {
	let scrollableElement = element,
 			overflowY = window.getComputedStyle(element)['overflow-y'],
			maxHeight = element.clientHeight || 0;

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
		}
		else {

			// if he has a parent element - lets give him a try with recursion
			if (scrollableElement.parentElement)
				return closestScrollable(scrollableElement.parentElement, maxHeight);
			else
			// or let's just return the max height of elements and false instead of node
				return {
					node: false,
					maxHeight: maxHeight
				};
		}
}

/**
**/
function scroll(direction, total, closestScrollable) {
	// number of times we should scroll up/down
	total = parseInt(total) || 10;

	// iterator
	let doneTimes = 0;

	// interval to scroll again
	const interval = setInterval(() => {

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

		// check if we are done with iterations
		if (++doneTimes >= total) {
			clearInterval(interval);
			chrome.extension.sendMessage({
				type: 'notification',
				notification: {
					id: 'scrolling',
					title: `Job's done!`, // http://classic.battle.net/war3/images/orc/units/portraits/peon.gif
					text: `I scrolled ${direction} (${total} times) and idle now. \nClick me to switch to that tab.`
				}
			});
		}
	}, 500);
}

/**
  Check if current tab is an instagram website - click on "load more" button
  to scroll freely
**/
function detectInstagram() {
	if (window.location.href.includes('instagram')) {
		let anchor = _x(`//a[contains(@href, "${window.location.pathname}")]`);
		if (anchor && anchor[0]) {
			anchor[0].click();
		}
	}
}

function getWindowHeight() {
	const body = document.body,
				html = document.documentElement;

	return Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight,
									 html.scrollHeight, html.offsetHeight );
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
