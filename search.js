var http = require("http");

// this is a mirror of Pearson's word search API
// doing this because they don't allow AJAX requests
// this way we can make AJAX request to our server and get search results on the same page
// standard template taken from Postman
// directly outputing the whole response as string
// client can JSON parse it to use
function getResults(request, response) {
  var options = {
    "method": "GET",
    "hostname": "api.pearson.com",
    "port": null,
    "path": "/v2/dictionaries/ldoce5/entries?headword=" + request.url.replace("/search/", ""),
    "headers": {
      "cache-control": "no-cache"
    }
  };

  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
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

module.exports.getResults = getResults;