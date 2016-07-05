var http = require("http"),
  fs = require('fs'),
  url = require('url'),
  path = require('path'),
  renderer = require('./renderer.js');


// handling home page request
// simple readstream for home.html - no templating
function home(req, res) {
  if (req.method === "GET") {
    console.log("I am home!");
    fs.createReadStream('./views/home.html').pipe(res);
    return;
  }
}


/*
**

meat of the app.
- send a GET request via node to pearson api to get details of a single entry
- API details: http://developer.pearson.com/apis/dictionaries
- pick out relevant part from the JSON response and make it a string
- then passes that string to render.view to replace templates (word, part of speect, audio etc)
- close the request and response

**
*/
function word(request, response) {

  // standard GET request format taken from Postman
  var options = {
    "method": "GET",
    "hostname": "api.pearson.com",
    "port": null,
    "path": "/v2/dictionaries/entries/" + request.url,
    "headers": {
      "cache-control": "no-cache",
    }
  };

  var req = http.request(options, function(res) {
    var chunks = [];

    res.on("data", function(chunk) {
      chunks.push(chunk);
    });

    // start all the processing when the response 'ends'
    res.on("end", function() {
      
      var json = JSON.parse(Buffer.concat(chunks).toString()).result;

      var wordDetails = {};
      wordDetails.title = json.headword;
      wordDetails.part_of_speech = json.part_of_speech || "";

      // sending senses array to fetachMeaning to form proper string of HTML elements
      // senses array contains meaning and couple usage examples
      // same method to fetch examples using fetchExamples
      if (json.senses[0].definition) {
        wordDetails.meaning = fetchMeaning(json.senses);
      } else {
        wordDetails.meaning = "";
      }

      if (json.examples) {
        wordDetails.examples = fetchExamples(json.examples);
      } else {
        wordDetails.examples = "";
      }

      // audio/pronunciation is the trickiest
      // other than fetching the URL we need to verify the status as well
      // only if the status is 200 it should be included in the page
      // send a http.get request to check status
      // if 200 OK status include it
      // if no audio URL or if no response in 800ms, don't include audio icons in the page
      var au = json.audio;
      var counter = 0;
      var us_audio, uk_audio;
      var audio = "";

      if (au) {
        
        if (au[0].lang === "American English") {
          us_audio = "http://api.pearson.com" + au[0].url;
          uk_audio = "http://api.pearson.com" + au[1].url;
        } else {
          us_audio = "http://api.pearson.com" + au[1].url;
          uk_audio = "http://api.pearson.com" + au[0].url;
        }

        checkAudio(us_audio, "US");
        checkAudio(uk_audio, "UK");

      } else {
        wordDetails.audio = audio;
        renderer.view("word", wordDetails, response);
        response.end();
      }

      function checkAudio(audioUrl, country) {
        http.get(audioUrl, function(audioResponse) {
          counter++;
          if (audioResponse.statusCode === 200) {
            audio += "<div><h4>" + country + "</h4><img class='us-audio' src='./static/speaker.svg'>";
            audio += "<audio class='us-audio' src='" + audioUrl + "'></audio></div>"
          } else {
            audio = "";
          }
          if (counter === 2) {
            wordDetails.audio = audio;
            renderer.view("word", wordDetails, response);
            response.end();
          }
        });
      }

      setTimeout(function() {
        console.log("Timeout for audio!");
        wordDetails.audio = audio;
        renderer.view("word", wordDetails, response);
        response.end();
      }, 800);

    });

    res.on('error', function(err) {
      console.error(err);
    });
    
  });

  req.end();
}


// serving static files is relatively easy
// first find the right extension for response header using regex
// then createReadStream to send along the file as response
function static(req, res) {

  var uri = url.parse(req.url).pathname;
  var filename = path.join(process.cwd(), uri);

  if (/.css/.test(uri)) {
    res.writeHead(200, {
      'Content-Type': 'text/css'
    });
  } else if (/.js/.test(uri)) {
    res.writeHead(200, {
      'Content-Type': 'text/javascript'
    });
  } else if (/.svg/.test(uri)) {
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml'
    });
  }

  fs.createReadStream(filename).pipe(res);

}


// function to fetch meaning and examples from senses array
// form HTML only if entries are present
function fetchMeaning(senses) {

  var meaning = "<h2 class='section-heading'>Meaning and Usage</h2><hr>"

  for (var i = 0; i < senses.length; i++) {
    if (senses[i].definition) {
      meaning += "<p class='meaning'>" + senses[i].definition + "</p>";
      meaning += "<ul class='usage'>";
      if (senses[i].examples) {
        for (var j = 0; j < senses[i].examples.length; j++) {
          meaning += "<li>" + senses[i].examples[j].text + "</li>";
        }
      }
      if (senses[i].gramatical_examples) {
        for (var k = 0; k < senses[i].gramatical_examples.length; k++) {
          meaning += "<li>" + senses[i].gramatical_examples[k].examples[0].text + "</li>";
        }
      }
      meaning += "</ul>";
    }
  }

  return meaning;
}


// same as above function
// include all the examples from the examples array
function fetchExamples(eg) {

  var examples = "<h2 class='section-heading'>More examples</h2><hr>";

  examples += "<ul class='usage'>";
  for (var i = 0; i < eg.length; i++) {
    examples += "<li>" + eg[i].text + "</li>";
  }
  examples += "</ul>";

  return examples;
}


module.exports.home = home;
module.exports.word = word;
module.exports.static = static;