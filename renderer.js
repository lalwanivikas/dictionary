var fs = require('fs');

function mergeValues(values, content) {
  
  //cycle over keys
  for (var key in values) {
    //replace all {{keys}} wil values from object
    var pattern = new RegExp("{{" + key + "}}", "g"); // g for global
    content = content.replace(pattern, values[key] || "");
  }
  
  //return merged content
  return content;

}

function view(templateName, values, res) {
  
  //read from template file
  var fileContents = fs.readFileSync("./views/" + templateName + ".html", {
    encoding: 'utf8'
  });
  
  //insert values in the content
  fileContents = mergeValues(values, fileContents);
  
  //write out the contents to the response
  res.write(fileContents);

}

module.exports.view = view;