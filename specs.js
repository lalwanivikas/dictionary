/*
**

Specs:
- Autocomplete
- Part of speech: noun, verb etc.
- Possible meanings
- Usage examples
- Pronunciation

APIs:
- Cambridge/Oxford API for autocomplete - Best in Macmillan
- Pearson API for rest of the stuff: http://developer.pearson.com/apis/dictionaries


Hosting:
- Bluemix: https://new-console.ng.bluemix.net/pricing/ OR 
- OpenShift: https://www.openshift.com/pricing/plan-comparison.html

**
*/


/* 
**

Types of request:
	- GET for getting home page - "/"
	- GET for a particular word directly - "/chip-basket"
	- GET for autocomplete - different API

Boggarapu's comments:
	- Make a separate path for static files - JS, CSS and index.html
	- No POST, only GET
	- Make a separate path for autocomplete request
	- Use regex to match paths

**
*/


/*
**

To be filled via template:

- Page title
- Word
- Part of speech
- UK and US audio links
- Meaning - variable
- Examples - variable
- More examples - variable



Things to do:
- deal with empty response - not display the fields? ✔
- Fix this: localhost:4000/cqAFaFT4YP ✔
- Make it responsive ✔
- deal with error in getting audio files ✔
- US and UK speaker position ✔
- make the dropdown work on first keydown + enter
- proper commenting

**
*/
