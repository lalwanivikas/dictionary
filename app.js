var http = require('http'),
 router = require('./router'),
 autocomplete = require('./autocomplete'),
 search = require('./search');

var port = Number(process.env.PORT || 4000);

http.createServer(function(req, res) {
  
  // console.log(req.url);
  var url = req.url;
  
  if (url === '/favicon.ico') { // handling favicon request
    res.writeHead(200, {
      'Content-Type': 'image/x-icon'
    });
    res.end();
    return;
  } else if (url === "/") { // home page
    router.home(req, res);
    return;
  } else if (/\/static\//.test(url)) { // static files from /static folder
    router.static(req, res);
    return;
  } else if (/\/autocomplete\//.test(url)) { // mirroring autocomplete API from macmillan
    autocomplete.getSuggestions(req, res);
    return;
  } else if (/\/search\//.test(url)) { // mirroring word search API from pearson
    search.getResults(req, res);
    return;
  } else if (/\/[a-z0-9]+$/gi.test(url)) { // for displaying details of a word using Pearson API
    router.word(req, res);
    return;
  } else {
    res.writeHead(404, {
      "Content-Type": "text/plain"
    });
    res.write("404 Not Found. \nAlthough you tried to crash my app, I still love you!");
    res.end();
    return;
  }
  
  res.on('error', function(err) {
      console.error(err);
  });

  // added error handler because shit happens
  // https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/#a-quick-thing-about-errors
  req.on('error', function(err) {
    // This prints the error message and stack trace to `stderr`.
    console.error(err.stack);
  });

}).listen(port);

console.log('Server running at http://127.0.0.1:4000/');