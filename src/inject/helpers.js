var helpers = {};

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
