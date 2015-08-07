var elasticsearch = require('elasticsearch');
var mongo = require('./mongodb.js');
var fs = require('fs');
var archiver = require('archiver');
var _ = require('underscore');

var genes = fs.readFileSync('data/GEOgenes.json');
genes = JSON.parse(genes);
console.log(genes.length)


var client = new elasticsearch.Client({
  host: '10.91.53.79:9200',
  log: 'trace'
});

exports.suggest = function(req,res){
	client.search({
  	index: 'l1000-2',
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
  	index: 'l1000-2',
  	type: 'leve34',
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

exports.selected = function(req,res){
    var cids = Object.keys(req.body);
	mongo.selected(cids,function(docs){
		res.send(docs);
	});
}


exports.download = function(req,res){
	console.log(req.body);
	var cids = Object.keys(JSON.parse(req.body.cids));
	var archive = archiver('zip');
	mongo.download(cids,function(docs){
		// meta ssfile
		var metaHeaders =  ["cid", "CL_Name", "det_plate", "det_well", "SM_Dose", "SM_Dose_Unit", "SM_LINCS_ID", "SM_Name", "SM_Center_Compound_ID", "SM_Time", "SM_Time_Unit", "SM_Pert_Type", "batch"];
		var meta = [];
		var mat = [];
		var matHeader = [];
		matHeader.push('');
		var delim = ',';
		meta.push(metaHeaders.join(delim));
		docs.forEach(function(doc,i){
			var docArr = [];
			metaHeaders.forEach(function(key){
				if(key in doc)
					docArr.push(doc[key]);
				else
					docArr.push('');
			});
			mat.push(doc.vector);
			matHeader.push(doc.cid);
			meta.push(docArr.join(delim));
		});
		archive.append(meta.join('\n'),{name:'meta.csv'});

		// matrix file
		mat = _.zip.apply(null,mat) // transpose;
		var matFile = [];
		matFile.push(matHeader.join(delim));
		mat.forEach(function(row,i){
			matFile.push(genes[i]+delim+row.join(delim));
		});
		archive.append(matFile.join('\n'),{name:'matrix.csv'});
		archive.finalize();
	});
	res.attachment('Lich_data.zip');
	archive.pipe(res);
}
