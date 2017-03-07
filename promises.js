var storyDiv = document.querySelector('.story');

function addHtmlToPage(content) {
  var div = document.createElement('div');
  div.innerHTML = content;
  storyDiv.appendChild(div);
}

function addTextToPage(content) {
  var p = document.createElement('p');
  p.textContent = content;
  storyDiv.appendChild(p);
}


function get(url) {
  // Return a new promise
  return new Promise(function(resolve, reject) {
    //  Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is also called on 404 to check the status
      if (req.status === 200) {
        // Resolve the promise with response text
        resolve(req.response);
      } else {
        // Other wise reject the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };
    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

function getJSON(url) {
  return get(url).then(JSON.parse)
}


getJSON('story.json').then(function(story) {
  addHtmlToPage(story.heading);
  // Map our array of chapters url to an array
  // of chapter json promises. This makes sure that
  // they are downloaded in parallel.
  return story.chapterUrls.map(getJSON).reduce(function(sequence, chapterPromise) {
    // Use reduce to chain promises toghether,
    // adding content to the page for each chapter
    return sequence.then(function() {
      // wait for everything in sequence so far,
      // then wait for this chapter to arrive
      return chapterPromise;
    }).then(function(chapter) {
      addHtmlToPage(chapter.html);
    });
  }, Promise.resolve());
}).then(function() {
  addTextToPage("All Done");
}).catch(function(err) {
  // Catch any error that happened along the way
  addTextToPage("Argh broken... " + err.message);
}).then(function() {
  // Always hide the spinner
  document.querySelector('.spinner').style.display = 'none';
});
