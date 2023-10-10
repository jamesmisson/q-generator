const fieldKey = {
  d: 'Year',
  a: 'Author',
  di: 'Date',
  w: 'Work',
  abbrNotes: 'Notes',
  loc: 'Location',
  prov: 'Provenance',
  qt: 'Quotation'
}

const setDOMInfo = info => {
    //changes the popup element to the info

    for (const field in info) {
      console.log(field)
      console.log(info[field])
      if (info[field]) {
        if (String(field) != 'xmlString' && typeof info[field] === 'string') {
        document.getElementById("fields").innerHTML += "<li><h3>" + fieldKey[field] + "</h3>" + info[field] + "</li>"
        }
    }
    }

    document.getElementById('xml').value = info.xmlString;

    if (info.abbrNotes) {
      for (var i=0; i < info.abbrNotes.length; i++) {
        document.getElementById('Notes').innerHTML = "<li>⚠️ " + info.abbrNotes[i] + "</li>"
      }
    }
  };
  


  // Once the DOM is ready...
  window.addEventListener('DOMContentLoaded', () => {
    // ...query for the active tab...
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      // ...and send a request for the DOM info...
      chrome.tabs.sendMessage(
          tabs[0].id,
          {from: 'popup', subject: 'citationObject'},
          // ...also specifying a callback to be called 
          //    from the receiving end (content script).
          setDOMInfo);
    });
  });

  ///copies the text to clipboard when alt A pressed
document.onkeyup = function () {
  var e = e || window.event; // for IE to cover IEs window event-object
  if(e.ctrlKey && e.which == 88) {
    navigator.clipboard.writeText(document.getElementById('xml').textContent)
    return false;
  }
}