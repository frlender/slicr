var elasticsearch = require('elasticsearch');
var mongo = require('./mongodb.js');
var fs = require('fs');
var archiver = require('archiver');
var config = require('config');
var Q = require('q');
var registry = require('./registry.js');


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
    	var hits = resp.hits.hits;
    	res.send(hits.map(function(hit){
    		var source = hit._source;
    		return source
    	}))
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
