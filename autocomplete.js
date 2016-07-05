var http = require("http");

// this is just for mirroring the macmillan's autocomplete API
// doing this because they don't allow AJAX requests
// this way we can make AJAX request to our server and get autocomplete entries
// standard template taken from Postman
// directly outputing the whole response as string
// client can JSON parse it to use
function getSuggestions(request, response) {
  var options = {
    "method": "GET",
    "hostname": "www.macmillandictionary.com",
    "port": null,
    "path": "/autocomplete/american/?contentType=application%252Fjson%253B%20charset%253Dutf-8&q=" + request.url.replace("/autocomplete/", ""),
    "headers": {
      "cache-control": "no-cache",
    }
  };

  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function() {
      var body = Buffer.concat(chunks);
      response.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });

      response.end(body.toString());
    });
    
    res.on('error', function(err) {
      console.error(err);
    });
  
  });

  req.end();
}

module.exports.getSuggestions = getSuggestions;