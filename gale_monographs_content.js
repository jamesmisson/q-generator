console.log("gale monographs content script running")

//the below is mostly copied and pasted from newspapers script
// with thes changes:
// getAuthor changed to auto-initialize the names
// getPageNumber fixed to target the 'Pages' field rather than the 'page number' on newspapers

//TODO:
//fix getProvenance, i think there is a dif. list of these values needed


// define collection/provenance abbreviations
//this will need to be changed, need to look at the awhi scripts first
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
    let titleElem = document.querySelector("#content-wrapper > div.contentSection_header > div > div.dvi-document__info-wrapper > div > h1")
    let titleText = titleElem.innerText.trim()
    let abbObject = abbreviate(titleText)
    //can probably add a lil thing here to change the teleg. to tel. seeing as this is all newspapers
    return abbObject
}

function getPageNumber() {
    //page number
    let pageNumberXpath = "//span[text()='Pages']/following-sibling::span";
    let pageNumberElem = document.evaluate(pageNumberXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let pageNumberText = pageNumberElem.innerText.trim()
    return pageNumberText
}

function getDate() {
    let dateXpath = "//span[normalize-space(text()) = 'Date:']/following-sibling::span"
    let dateElem = document.evaluate(dateXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    let dateText = dateElem.innerText.trim()
    let dateObject = {}

    //just need a 4 digit number!
    if (/[12]\d\d\d/.test(dateText)) {
      dateObject.year = dateText.match(/[12]\d\d\d/)
      dateObject.dayNum = null,
      dateObject.month = null
    } else {
      dateObject.year = 'unknown'
      dateObject.dayNum = null,
      dateObject.month = null
    }
    return dateObject
}

function getAuthor() {
    //author
    // will probably need refining, other author name formats out there
    let authorXpath = "//span[normalize-space(text()) = 'Author:']/following-sibling::span"
    if (document.evaluate(authorXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
      let authorElem = document.evaluate(authorXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      let authorText = authorElem.innerText.trim();

        //initialize first word
        let nameArray = authorText.split(' ')
        if (nameArray.length > 1) {
            let initials = ''
            for (var i = 0; i < nameArray.length - 1; i++) {
                initials = initials + nameArray[i][0] + '. '
            }
            authorText = initials + nameArray[nameArray.length - 1]
            }
    } else {
      return null
    }
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
    a: getAuthor(),
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





