// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

const request=require('request')
const csv=require('csvtojson')



function getSrc(id){
  return 'https://docs.google.com/spreadsheets/d/e/' + id + '/pub?output=csv';
}


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


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
  
  
  var src = getSrc(req.query.id); 
  
  
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
    .fromStream(request.get(src))
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
      res.send(json);
    })
  
  
});


app.get("/jsonx", function (req, res) {
  var headers;
  var rows = [];
  var json = {
    dialogs: [],
    rows: []
  };
  
  
  /*
    - Skip Reprompts
    - only Dialogs
  */
  var Dialog = class {
    constructor(level) {
      this.level = level || 0;
      this.dialogs = [];
      this.actions = [];
    };
    
    bar() {
      return "Hello World!";
    }
    
    toJson(){
      return {
        level: this.level,
        dialogs: this.dialogs,
        actions: this.actions
      }
    }
  };
  
  let lastLevel = '';
  let currentDialog = new Dialog(0);
  function processRow(data) {
    //descide if add to current dialog or open a new one
    if (lastLevel === data.level){
        
    } else {
      //initialize new level
      let level = parseInt(data.level);
      json.dialogs.push(currentDialog.toJson());
      currentDialog = new Dialog(level);
      lastLevel = data.level;
    }
  }
  
  
  var src = getSrc(req.query.id); 
  
  csv()
    .fromStream(request.get(src))
    .on('header',(header)=>{
      headers = header;
    })
    .on('csv',(csvRow)=>{
      // csvRow is an array
      var row = {};
      csvRow.forEach((item, index) => {
        row[headers[index]] = item;
      });
      rows.push(row);
      processRow(row);
      //addText(row);
      //lastRow = row;
    })
    .on('done',(error)=>{
      json.rows = rows;
      res.send(json);
    })
  
  
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
