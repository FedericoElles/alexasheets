// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

const request=require('request')
const csv=require('csvtojson')



const SRC = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQj6n-EOQGbCibyh9o3_2jnESi2cDw_lCTDjPNfNg680rqXrIsGaKCEKog5FSWYyohGxH7C8hHy3ZgZ/pub?output=csv';



// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

/**
 
 const languageStrings = {
    'en': {
        translation: {
        
*/


app.get("/json", function (req, res) {
  var headers;
  var rows = [];
  var lastRow;
  var langs = [];
  
  var json = {};
  
  function addLang(lng){
    if (typeof json[lng] === 'undefined'){
      json[lng] = {
        translation:{}
      };
      langs.push(lng);
    }
  }
  
  function addText(row){
    let key = '';
    if (row.level){
      key+= 'L' + row.level + '_';
    }
    key += row.key.toUpperCase();
    if (row.reprompt){
      key+= '_' + 'REPROMPT';
    }
    
    var text = '';
    var target;
    console.log('key', key);
    
    langs.forEach((lang)=>{
      text = row['text_' + lang];
      var val = json[lang].translation[key] + '';
      if (text){
        if (typeof json[lang].translation[key] === 'undefined'){
          json[lang].translation[key] = text;
          console.log('action: string');
        } else {
          if (typeof json[lang].translation[key] === 'object'){
            json[lang].translation[key].push(text);
            console.log('action: append');
          } else {
            json[lang].translation[key] = [json[lang].translation[key], text];
            console.log('action: array', json[lang].translation[key]);
          }
        }
        
        //json[lang].translation[key] = text;
      }
    });
  }
  
  csv()
    .fromStream(request.get(SRC))
    .on('header',(header)=>{
      headers = header;
      headers.forEach((name) => {
        if (name.substr(0,5) === 'text_'){
          addLang(name.substr(5));
        }
      });
    })
    .on('csv',(csvRow)=>{
      // csvRow is an array
      var row = {};
      csvRow.forEach((item, index) => {
        row[headers[index]] = item;
      });
      rows.push(row);
      addText(row);
      lastRow = row;
    })
    .on('done',(error)=>{
      res.send({
        json: json,
        raw: rows
      });
    })
  
  
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
