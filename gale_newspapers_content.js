console.log("gale newspapers content script running")

// define collection/provenance abbreviations
const collections = {
"Eighteenth Century Collections Online": "ecco",
"17th-18th Century Burney Collection Newspapers": "blnewsp",
"17th and 18th Century Burney Collection": "blnewsp",
"19th Century British Newspapers": "blnewsp",
"19th Century British Library Newspapers: Part 1": "blnewsp",
"19th Century British Library Newspapers: Part 2": "blnewsp",
"19th Century British Library Newspapers: Part 3": "blnewsp",
"19th Century British Library Newspapers: Part 4": "blnewsp",
"British Library Newspapers": "blnewsp",
"British Library Newspapers, Part I: 1800-1900": "blnewsp",
"British Library Newspapers, Part II: 1800-1900": "blnewsp",
"Times Digital Archive": "times",
"The Times Digital Archive, 1785-2009": "times",
"The Times Digital Archive": "times",
"19th Century U.S. Newspapers": "usnews19",
"Nineteenth Century US Newspapers": "usnews19",
"Nineteenth Century U.S. Newspapers": "usnews19",
"19th Century UK Periodicals": "ukper19",
"19th Century UK Periodicals: New Readerships": "ukper19",
"19th Century UK Periodicals: New Readerships": "ukper19",
"Economist Historical Archive": "econha",
"The Economist Historical Archive, 1843-2012": "econha",
"The Economist Historical Archive, 1843-2015": "econha",
"The Economist Historical Archive": "econha",
"Illustrated London News Historical Archive": "gale",
"Financial Times": "gale",
"Financial Times Historical Archive": "gale",
"The Financial Times Historical Archive, 1888-2010": "gale",
"Financial Times Historical Archive": "gale",
"Times Literary Supplement": "gale",
"Times Literary Supplement Historical Archive": "gale",
"Times Literary Supplement Historical Archive, 1902-2011": "gale",
"Daily Mail Historical Archive": "gale",
"British Newspapers, Part 4: 1780-1950": "gale",
"Seventeenth and Eighteenth Century Burney Newspapers Collection": "blnewsp",
"Nineteenth Century UK Periodicals": "ukper19"
};

//define functions to parse the components
//maybe split out functions so there's just one for each field then have an overall 'parsecitation()' function?

function getProvenance() {
  let citationToolsData = document.querySelector("#cite > input")
  let collection = citationToolsData.getAttribute("data-productname")
  if (collection in collections) {
    return collections[collection]
  } else {
    return 'gale'
  }
}

function getWork() {
    //title Object (with notes about abbreviations)
    let titleXpath = "//span[normalize-space(text()) = 'Publication:']/following-sibling::span/a";
    let titleElem = document.evaluate(titleXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let titleText = titleElem.innerText.trim()
    let abbObject = abbreviate(titleText)
    return abbObject
}

function getPageNumber() {
    //page number
    let pageNumberXpath = "//span[text()='Page Number']/following-sibling::span";
    let pageNumberElem = document.evaluate(pageNumberXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let pageNumberText = pageNumberElem.innerText.trim()
    return pageNumberText
}

function getDate() {
    //date
    let dateXpath = "//span[normalize-space(text()) = 'Date:']/following-sibling::span"
    let dateElem = document.evaluate(dateXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let dateText = dateElem.innerText.trim()

      //split into components
        //are all newspaper dates of the format Friday, Aug. 4, 2017?
    // if so split into array along space
    let dateArray = dateText.split(' ')
    let dateObject = {}
    //i guess there could be dates of format 'Aug. 2017' and others, so need a more regexy way of doing this probably
    if (dateArray.length > 1) {
      dateObject.day = dateArray[0].replace(/,\s*$/, "");
      dateObject.month = dateArray[1].replace(/,\s*$/, "");
      dateObject.dayNum = dateArray[2].replace(/,\s*$/, "");
      dateObject.year = dateArray[3].replace(/,\s*$/, "");
    } else {
      dateObject.year = dateArray[0].replace(/,\s*$/, "");
    }
    // console.log(dateObject)
    return dateObject
}

function getOCR() {
  selection = document.getSelection().toString();
  //maybe a function that makes edits to the text, replaces q. marks etc?
  return selection
}

function parseCitation() {
  //asign the results of above functions to an object
  let citObject = {
    d: getDate().year,
    a: null,
    di: getDate().dayNum + ' ' + getDate().month,
    w: getWork().title,
    abbrNotes: getWork().notes,
    loc: getPageNumber(),
    prov: getProvenance(),
    qt: getOCR(),
    xmlString: ''
  } 

  // fix string and if statements for optional values
  // citObject.xmlString = `<q d="${citObject.prov}"><cit><d>${citObject.date.year}</d><bibMain><w>${citObject.work}</w><di>${citObject.date.dayNum} ${citObject.date.month}</di><loc>${citObject.page}</loc></bibMain></cit><qt>${citObject.text}</qt><q>`

  citObject.xmlString = 'xml string placeholder'

  return citObject
}


//call constructXML when popup is opened below

///////// passing message to popup

///i dont really get what's going on here but the important bit is in the middle 'info to send'. Match that up with whatever the parsing function above selects
chrome.runtime.sendMessage({
  from: 'content',
  subject: 'showPageAction',
});
// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  // First, validate the message's structure.
  if ((msg.from === 'popup') && (msg.subject === 'citationObject')) {

    let citObject = parseCitation()
      // info to send:
    response(citObject)
  }
});





