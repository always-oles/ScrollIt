var helpers = {};

// Milliseconds
helpers.LAZY_DELAY_DURATION = 1000; 

helpers.DEFAULT_DOCUMENT_BODY = document.body;
helpers.bodyElement = helpers.DEFAULT_DOCUMENT_BODY;

/**
  Xpath helper
  @param string STR_XPATH = the actual xpath of searched element(s)
  @credits Thanks to https://stackoverflow.com/a/14669479/3687408
**/
helpers.x = (STR_XPATH) => {
  let xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null),
      xnodes = [],
      xres;

  while (xres = xresult.iterateNext()) {
    xnodes.push(xres);
  }

  return xnodes;
}

/**
  Check if current tab is an instagram website - click on "load more" button
  to scroll freely
**/
helpers.detectInstagram = () => {
  if (window.location.href.includes('instagram')) {

    // find "load more" button
    let nodes = helpers.x(`//a[contains(@href, "${window.location.pathname}")]`);

    // click on last of this kind of nodes
    if (nodes.length) {
      nodes[nodes.length-1].click();
    }
  }
}

helpers.detectReddit = () => {
  if (window.location.href.includes('reddit')) {

    // find "load more" button
    let nodes = helpers.x(`//a[starts-with(@id,'more_')]`);

    // click on last of this kind of nodes
    if (nodes.length) {
      nodes[nodes.length-1].click();
    }
  }
}

helpers.detectYoutube = () => {
  if (window.location.href.includes('youtube')) {

    // find "load more" button
    let nodes = helpers.x(`//*[contains(@class, 'load-more-button')]`);

    // click on last of this kind of nodes
    if (nodes.length) {
      nodes[nodes.length-1].click();
    }
  }
}

helpers.sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}

helpers.sleep_block = (ms) => {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < ms);
	
}


helpers.detectRedditChat = () => {
  if (window.location.href.includes("reddit.com/chat")) {
    let users = helpers.x('//a[contains(@href, "reddit.com/user")]');
    if (users.length) {
      let first_user = users[0];
	  
	  console.log("???");
	  // Set the body element for checking scroll heights
	  
	  
	  console.log({"helpers.bodyElement": helpers.bodyElement });
	  
	  helpers.bodyElement = first_user.parentElement;
	  
	  console.log({"helpers.bodyElement": helpers.bodyElement });
	  
      if (first_user.previousSibling.textContent.includes("Loading")) {
        // Fire a mouseup event
        // Tested on chrome devtools
        e_wheel = document.createEvent("MouseEvents");
        e_wheel.initEvent("wheel", true, true);
        e_wheel.detail = 1;
		
		console.log("scrolling up due to reddit chat!");
        
        first_user.dispatchEvent(e_wheel);
		
		//helpers.sleep_block(helpers.LAZY_DELAY_DURATION);
		console.log("Done waiting");
		
      }
    }
    
  }

}

/**
  Obvious helper
**/
helpers.getWindowHeight = () => {
  const body = document.body,
        html = document.documentElement;

  return Math.max(
    body.scrollHeight, body.offsetHeight, html.clientHeight,
    html.scrollHeight, html.offsetHeight
  );
}


helpers.getContainerHeight = () => {
	const body = helpers.bodyElement,
		  html = document.documentElement;
	

  return Math.max(
    body.scrollHeight, body.offsetHeight, html.clientHeight,
    html.scrollHeight, html.offsetHeight
  );
	
}