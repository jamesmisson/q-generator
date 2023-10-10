console.log("twitter content script running")

//running into problems here, haven;t been able to find a standrd way of selecting the right tweet element every time
// so may have to rely on a selecting the tweet text (/key word) and going from there

// using window.getSelection().anchorNode.parentNode to give the element of the selected text, then get the 'article' element that this is in somehow


function getDate(array) {
  //TO DO
  //locate date in the element
  let string = ''

  for (var i = 0; i < array.length; i++) {
    if (/.*[A-Z][a-z][a-z] \d\d?, \d\d\d\d$/.test(array[i])) {
      console.log('date found')
      string = array[i]
      break
    } else {
      string = 'date not found'
      console.log(string)
    }}

  //loop over array and locate date, turn into date object
  let dateObject = {
    year: string.match(/\d\d\d\d$/)[0],
    dayNum: string.match(/(?<= )\d\d?(?=,)/)[0],
    month: string.match(/[a-zA-Z][a-zA-Z][a-zA-Z]/)[0]
  }

  if (dateObject.month === 'Sep') {
    dateObject.month += 't.'
  } else if (dateObject.month.length === 3) {
    dateObject.month += '.'
  }

  console.log(dateObject)
  return dateObject
}

function getTodaysDate() {
  const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June",
  "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."]
date = new Date()
dateString = `accessed ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
return dateString
}

function getAuthor(array) {
  let author = ''
  for (var i=0; i < array.length; i++) {
    if (array[i].startsWith('@')) {
      author = array[i]
      break
    } else {
      author = null
    }
  }
  return author
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
  //maybe a function that makes edits to the text, replaces q. marks etc?
  return selection
}

function parseCitation() {
  let selectedEl = window.getSelection().anchorNode.parentNode
  let tweet = selectedEl.closest("article").innerText
  let tweetArray = tweet.split('\n')
  console.log(tweetArray)

  let citObject = {
    d: getDate(tweetArray).year,
    a: getAuthor(tweetArray),
    di: getDate(tweetArray).dayNum + ' ' + getDate(tweetArray).month,
    w: 'twitter.com',
    abbrNotes: null,
    loc: null,
    prov: 'net',
    qt: getOCR(),
    xmlString: ''
  } 

  citObject.xmlString = `<cit><d>${citObject.d}</d><bibSub><a>${citObject.a}</a><di>${citObject.di}</di></bibSub><bibMain><w>twitter.com</w><docType>${getTodaysDate()}</docType></bibMain></cit><qt>${citObject.qt}</qt>`
  return citObject

}

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
