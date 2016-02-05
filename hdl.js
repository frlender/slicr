var elasticsearch = require('elasticsearch');
var mongo = require('./mongodb.js');
var fs = require('fs');
var archiver = require('archiver');
var config = require('config');
var Q = require('q');
var registry = require('./registry/registry-back-end.js');
var request = require('request');



var client = new elasticsearch.Client({
  hosts: config['esUrl'],
  log: 'trace'
});

exports.suggest = function(req,res){
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Methods', 'GET');
	client.search({
  	index: config['esIndex'],
  	type: 'suggest',
  	body: {
    	query: {
      	match_phrase_prefix: {
        	_all: req.query.typed
      	}
    	}
  	}
	}).then(function (resp) {
    	var hits = resp.hits.hits;
    	res.send(hits.map(function(hit){
    		var source = hit._source;
    		for(var key in source){
    			return source[key];
    		}
    	}))
	}, function (err) {
    	// console.trace(err.message);
	});
}

exports.search = function(req,res){
	client.search({
  	index: config['esIndex'],
  	type: registry[req.query.type].type,
  	body: {
      from:req.query.from,
      size:req.query.size,
    	query: {
      		match:{
      			_all:req.query.typed
      		}
    	}
  	}
	}).then(function (resp) {
      var resObj = {}
    	resObj.hits = resp.hits.hits.map(function(hit){
        var source = hit._source;
        return source
      });
      resObj.count = resp.hits.total;
    	res.send(resObj);
	}, function (err) {
    	// console.trace(err.message);
	});
}



exports.download = function(req,res){
	var levels = JSON.parse(req.body.data);
	var promises = levels.map(function(level){
		var input = {};
		input.model = level.id;
		input.itemId = registry[level.id].itemId;
		input.selectedIds = level.selectedIds;
		return mongo.download(input);
	});

	var archive = archiver('zip');
	Q.all(promises).then(function(docArr){
		docArr.forEach(function(docs,i){
			registry[levels[i].id].format(archive,docs);
		});
		archive.finalize();
	});
	res.attachment('Slicr_data.zip');
	archive.pipe(res);
}

exports.downloadSingle = function(req,res){
  var input = {};
  input.model = req.query['level'];
  input.itemId = registry[input.model].itemId;
  input.queryId = req.query['id'];
  input.projection = {};
  mongo.downloadSingle(input,function(doc){
    res.setHeader('Content-Disposition','attachment; filename="'+doc[input.itemId]+'.json"');
    res.send(JSON.stringify(doc))
  });
}

exports.DEGs = function(req,res){
  var input = {};
  input.model = req.query['level'];
  input.itemId = registry[input.model].itemId;
  input.queryId = req.query['id'];
  input.projection = {upGenes:true,dnGenes:true};
  mongo.downloadSingle(input,function(doc){
    res.send(doc);
  });
}

var headers = {
    'User-Agent':       'Super Agent/0.0.1',
    'Content-Type':     'application/x-www-form-urlencoded'
}
var pythonUrl = config.get('pythonUrl');
exports.pca = function(req,res){
  var pcaUrl = pythonUrl+'pca';
  var options = {
    url: pcaUrl,
    method:'POST',
    headers:headers,
    form:{input:JSON.stringify(req.body)}
  };
  request(options,function(err,response,body){
      res.send(body);
  });
}

exports.mds = function(req,res){
  var url = pythonUrl+'mds';
  var options = {
    url: url,
    method:'POST',
    headers:headers,
    form:{input:JSON.stringify(req.body)}
  };
  request(options,function(err,response,body){
      res.send(body);
  });
}

var genes = fs.readFileSync('./data/GEOgenes.json');
genes = JSON.parse(genes);
var lmGenes = genes.slice(0,978);
exports.l1000cds2 = function(req,res){
  var input = {};
  input.model = req.query['level'];
  input.itemId = registry[input.model].itemId;
  input.queryId = req.query['id'];
  input.projection = {chdirLm:true};
  mongo.downloadSingle(input,function(doc){
    var payload = {
      data:{
        genes:lmGenes,
        vals:doc.chdirLm
      },
      config:{aggravate:true,searchMethod:"CD",combination:true,
      "db-version":"cpcd-gse70138-lm-v1.0",share:false},
      metadata:[{key:"Tag",value:"from Lich"}]
    }
    var options = {
      url: 'http://amp.pharm.mssm.edu/L1000CDS2/queryURLEncoded',
      method:'POST',
      headers:headers,
      form:{input:JSON.stringify(payload)}
    };
    request(options,function(err,response,body){
      body = JSON.parse(body);
      res.send('http://amp.pharm.mssm.edu/L1000CDS2/#/result/'+body.shareId);
    });
  });
}
