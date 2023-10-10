console.log('Nexis content script running')


function getWork() {
    let titleElem = document.getElementsByClassName("SS_DocumentInfo")[0]
    let titleText = titleElem.innerText.trim()
    let abbObject = abbreviate(titleText)
    console.log('titleText')
    return abbObject
}

function getPageNumber() {
    //page number
    let pageNumberText
    let pageNumberXpath = "//span[text()='Section:']/parent::div";
    if (document.evaluate(pageNumberXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue) {
        let pageNumberElem = document.evaluate(pageNumberXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        pageNumberText = pageNumberElem.innerText;
        if (pageNumberText.match(/(?<=Pg. )[A-Z]?\d+/)) {
            pageNumberText = pageNumberText.match(/(?<=Pg. )[A-Z]?\d+/)[0]
        } else {
            pageNumberText = null
        }
    } else {
        pageNumberText = null
    }
    return pageNumberText
}

function getDate() {
    let dateElem = document.getElementsByClassName("SS_DocumentInfo")[1]
    let dateText = dateElem.innerText.trim()
    dateText = dateText.replace(',', '')
    let dateArray = dateText.split(' ')

    const months = {
        'January': 'Jan.',
        'February': 'Feb.',
        'March': 'Mar.',
        'April': 'Apr.',
        'May': 'May',
        'June': 'June',
        'July': 'July',
        'August': 'Aug.',
        'September': 'Sept.',
        'October': 'Oct.',
        'November': 'Nov.',
        'December': 'Dec.'
    }

    let dateObject = {
        dayNum: '',
        month: '',
        year: ''
    }
    
//get month
    for (var i = 0; i < dateArray.length; i++) {
      if (Object.keys(months).includes(dateArray[i])) {
      dateObject.month = months[dateArray[i]]
      break
      } else if (Object.values(months).includes(dateArray[i])) {
      dateObject.month = months[dateArray[i]]
      break
      } else {
      dateObject.month = null
      }
      }
      
//get dayNum
    for (var i = 0; i < dateArray.length; i++) {
        if (/^\d\d?$/.test(dateArray[i])) {
        		let number = dateArray[i]
            if (number[0] === '0') {
                number = number.replace('0', '')
                }
        dateObject.dayNum = number 
        break
            } else {
            dateObject.dayNum = null
            }
            }
    
//get year
    for (var i = 0; i < dateArray.length; i++) {
        if (/^\d\d\d\d$/.test(dateArray[i])) {
            dateObject.year = dateArray[i]
            break
        } else {
            dateObject.year = null
        }
    }
    return dateObject
}

function getOCR() {
  selection = document.getSelection().toString();

  selection = selection.trim();

  if (!/[.!?]$/.test(selection)) {
    selection += ".";
  }

  // Make the first letter uppercase if it's not already
  if (!/^[A-Z]/.test(selection)) {
    selection = selection.charAt(0).toUpperCase() + selection.slice(1);
  }

  return selection;
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
    prov: 'nex',
    qt: getOCR(),
    xmlString: ''
  } 

  // xml string needs fixing and an if statement for loc
  citObject.xmlString = `<cit><d>${citObject.d}</d><bibMain><w>${citObject.w.replace('(', '<place>').replace(')', '</place>')}</w><ob>Nexis</ob><di>${citObject.di}</di></bibMain></cit><qt>${citObject.qt}</qt>`
  // citObject.xmlString = 'testttt'
  console.log('citation parsed')
  console.log(citObject)
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

