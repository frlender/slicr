var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var hdl = require('./hdl.js');

var jsonParser = bodyParser.json({limit:'5mb'});
var urlencodedParser = bodyParser.urlencoded({limit:'10mb',extended:false});

router.use('/',express.static(__dirname + '/public'));

router.get('/tags',hdl.suggest);
router.get('/search',hdl.search);
router.post('/download',urlencodedParser,hdl.download);

router.get('/DEGs',hdl.DEGs);
router.get('/downloadSingle',hdl.downloadSingle);
router.get('/l1000cds2',hdl.l1000cds2);

router.post('/pca',jsonParser,hdl.pca);
router.post('/mds',jsonParser,hdl.mds);
router.post('/GEN3VA',jsonParser,hdl.GEN3VA);



app.use('/polslicr',router);

var port = 7070;
app.listen(port,function(){
	console.log('server@'+port);
});
