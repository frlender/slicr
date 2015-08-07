var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var hdl = require('hdl.js');

var jsonParser = bodyParser.json({limit:'5mb'});
var urlencodedParser = bodyParser.urlencoded({limit:'10mb',extended:false});

app.use('/',express.static(__dirname + '/public'));

app.get('/tags',hdl.suggest);
app.get('/search',hdl.search);
app.post('/selected',jsonParser,hdl.selected);
app.post('/download',urlencodedParser,hdl.download);

var port = 7070;
app.listen(port,function(){
	console.log('server@'+port);
});