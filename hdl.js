var elasticsearch = require('elasticsearch');
var mongo = require('./mongodb.js');
var fs = require('fs');
var archiver = require('archiver');
var config = require('config');
var Q = require('q');
var registry = require('./registry/registry-back-end.js');
var request = require('request');



var client = new elasticsearch.Client({
  host: config['esUrl'],
  log: 'trace'
});

exports.suggest = function(req,res){
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
	res.attachment('Lich_data.zip');
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
  console.log(req.query);
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
var pythonUrl = config.get('pythonUrl'),
    pcaUrl = pythonUrl+'pca';
exports.pca = function(req,res){
  var options = {
    url: pcaUrl,
    method:'POST',
    headers:headers,
    form:{input:JSON.stringify(req.body)}
  };
  console.log(options);
  request(options,function(err,response,body){
      console.log(body);
      res.send(body);
  });
}
