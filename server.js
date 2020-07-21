'use strict';

const express = require('express');
const app = express();

require('dotenv').config();
require('ejs');

const superagent = require('superagent');

//below sets the view engine
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3001;

//middleware
app.use(express.static('./public'));
app.use(express.urlencoded({extended: true}));

app.get('/', renderHomepage);
app.get('/searches/new', renderNewForm);
app.post('/searches', collectSearchResults);

function renderHomepage(request, response){
  response.render('pages/index');
}

function renderNewForm(request, response){
  response.render('pages/searches/new');
}

function collectSearchResults(request, response){

  console.log('data from form:', request.body);
  let search = request.body.search[0];
  let searchCategory = request.body.search[1];
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  //maxResults default is 10 items

  if(searchCategory === 'title'){url += `+intitle:${search}`}
  if(searchCategory === 'author'){url += `+inauthor:${search}`}

  superagent.get(url)
    .then(results => {
      let bookReturn = results.body.items;

      const bookArray = bookReturn.map(books => {
        return new Book(books.volumeInfo);
      })

      response.render('pages/searches/show.ejs', {searchResults: bookArray})
    })
}



function Book(obj){

  let regex = /^http:\/\//i;

  this.thumbnail = obj.imageLinks.thumbnail ? obj.imageLinks.thumbnail.replace(regex, 'https://') : 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = obj.title ? obj.title : 'Title not available';
  this.authors = obj.authors ? obj.authors : 'Author(s) not available';
  this.description = obj.description ? obj.description : 'Description not available';
}


app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
