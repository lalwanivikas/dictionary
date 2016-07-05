"use strict";

var input = document.querySelector('input'),
  autoSuggestList = document.querySelector('.autosuggest-list'),
  suggestions = document.querySelectorAll('li.suggestions'),
  searchList = document.querySelector('.search-list'),
  searchResults = document.querySelectorAll('li.searchResults'),
  wordDetails = document.querySelector('.word-details');

// variable to keep track of user's input filled inside keyboardControl function
// before he starts using the dropdown through keyboard
// saving it so that it can be replaced inside the input box
// so that user can begin typing where he left
var enteredInput;




/*
**

** Logic for autocomplete ** 
- send an AJAX request to /autocomplete/ path (mirror of macmillan autocomplete API)
- get response and form list('li') elements
- append that to ul already present in the HTML
- also add relevant event handlers for click, mouseover and mouseout

**
*/
function showSuggestions(query) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {

      var options = JSON.parse(this.responseText).results;

      if (options.length) {

        autoSuggestList.style.display = "block";
        autoSuggestList.innerHTML = "";

        for (var i = 0; i < options.length; i++) {

          var li = document.createElement('li');
          li.innerHTML = options[i].searchtext;
          li.className = "suggestions";
          autoSuggestList.appendChild(li);

          li.addEventListener('click', function(e) {
            input.value = e.target.innerHTML;
            showResult(e.target.innerHTML);
          });

          li.addEventListener('mouseover', function(e) {
            var currentlyHighlighted = document.querySelector(".highlighted");
            if (currentlyHighlighted) {
              currentlyHighlighted.classList.remove('highlighted');
            }
            e.target.className += " highlighted";
          });

          li.addEventListener('mouseout', function(e) {
            e.target.className = "suggestions";
          });

        }

      }

    }
  });
  xhr.open("GET", "/autocomplete/" + query);
  xhr.send();
}




/*
**

** Logic for showing search results ** 
- hide autocomplete box
- clear past search results if present ('wordDetails')
- send an AJAX request to /search/ path (mirror of pearson word search API)
- get response and form anchor('a') elements
- append all the relevant data to it - word, part of speech and meaning
- and finally append that to 'searchList' div

**
*/
function showResult(searchQuery) {

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function() {

    if (this.readyState === 4) {

      autoSuggestList.innerHTML = "";
      autoSuggestList.style.display = "none";
      if (wordDetails) {
        wordDetails.style.display = "none";
      }

      var searchResponse = JSON.parse(this.responseText).results;
      if (searchResponse.length) {

        searchList.innerHTML = "";

        var h2 = document.createElement('h2');
        h2.innerHTML = "Search Results";
        searchList.appendChild(h2);

        for (var i = 0; i < searchResponse.length; i++) {
          var resultDiv = document.createElement('a');
          var wordDiv = document.createElement('div');
          var word = document.createElement('p');
          var pos = document.createElement('p');
          var meaning = document.createElement('p');

          word.innerHTML = searchResponse[i].headword;
          word.className = "word"
          wordDiv.appendChild(word);

          if (searchResponse[i].part_of_speech) {
            pos.innerHTML = searchResponse[i].part_of_speech;
            wordDiv.appendChild(pos);
          }

          resultDiv.appendChild(wordDiv);

          if (searchResponse[i].senses !== null && searchResponse[i].senses[0].definition) {
            meaning.innerHTML = searchResponse[i].senses[0].definition[0];
            resultDiv.appendChild(meaning);

            resultDiv.className = "searchResults";
            resultDiv.href = "/" + searchResponse[i].id;

            searchList.appendChild(resultDiv);
          }

        }
      } else {
        searchList.innerHTML = "<h2>Nothing found.</h2>";
      }
    }
  });
  xhr.open("GET", "/search/" + searchQuery);
  xhr.send();
}




/*
**

** Logic for controlling the autosuggestion box with keyboard ** 
- applies 'highlighted' class to one element and removes from previous
- changes the input field on the basis of currently highlighted element
- handles edge cases like when up key is pressed on first li then input shpuld get focus
- important to take care of blurring and focusing input

**
*/
function keyboardControl(e) {

  var currentlyHighlighted = document.querySelector(".highlighted");
  
  if (currentlyHighlighted) {

    currentlyHighlighted.classList.remove('highlighted');

    if (e.keyCode === 38) {
      if (currentlyHighlighted.previousSibling) {
        input.blur();
        currentlyHighlighted.previousSibling.classList.add('highlighted');
        input.value = document.querySelector(".highlighted").innerHTML;
      } else {
        input.value = enteredInput;
        input.focus();
      }
    }

    if (e.keyCode === 40) {
      if (currentlyHighlighted.nextSibling) {
        input.blur();
        currentlyHighlighted.nextSibling.classList.add('highlighted');
        input.value = document.querySelector(".highlighted").innerHTML;
      } else {
        input.value = enteredInput;
        input.focus();
      }
    }

  } else {
      
      if (e.keyCode === 38) {
        input.blur();
        autoSuggestList.lastElementChild.classList.add('highlighted');
        input.value = document.querySelector(".highlighted").innerHTML;
      }

      if (e.keyCode === 40) {
        input.blur();
        enteredInput = input.value;
        autoSuggestList.firstElementChild.classList.add('highlighted');
        input.value = document.querySelector(".highlighted").innerHTML;
      }
  }

}




/*
**

** Event handlers for input field ** 
- keyup - if input nonempty then show suggestions
- keyup - if 'return/enter' key then show search results
- focus - if input nonempty then show suggestions

**
*/
input.addEventListener('keyup', function(e) {

  if (input.value == "") {
    autoSuggestList.style.display = "none";
  } else {
    showSuggestions(input.value);
  }

  if (e.keyCode == 13) {
    autoSuggestList.style.display = "none";
    showResult(input.value);
  }

});

input.addEventListener('focus', function() {
  if (input.value == "") {
    autoSuggestList.style.display = "none";
  } else {
    showSuggestions(input.value);
  }
});




/*
**

** Event handlers for whole documetn ** 
- click outside - hide autosuggestion box
- keydown - if 'return/enter' key then show search results
- keydown - is up/down, prevent defalut(page scroll) and pass control to keyboardControl function
- keydown - if escape(27), hide autosuggestion box

**
*/
document.addEventListener('click', function(e) {
  if (e.target.tagName !== "INPUT" || e.target.className !== "autosuggest-list") {
    autoSuggestList.style.display = "none";
  }
});

document.addEventListener('keydown', function(e) {

  if (e.keyCode === 13) {
    showResult(input.value);
  }

  if (e.keyCode === 38 || e.keyCode === 40) {
    if (autoSuggestList.hasChildNodes()) {
      e.preventDefault();
      keyboardControl(e);
    }
  }

  if (e.keyCode === 27) {
    input.blur();
    autoSuggestList.style.display = "none";
  }

});