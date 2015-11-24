var mongoose = require('mongoose');
var config = require('config');
var Q = require('q');
var registry = require('./registry/registry-back-end.js');

mongoose.connect(config.get('dbUrl'));

var models = {};

for(var key in registry){
  var level = registry[key];
  var Schema = mongoose.Schema(level.mongodb.schema,{collection:level.mongodb.collection});
  models[key] = mongoose.model(key,Schema);
}


exports.download = function(input){
  var deferred = Q.defer();
  var findQuery = {};
  findQuery[input.itemId] = {$in:input.selectedIds};
	var query = models[input.model].find(findQuery)
		.lean().exec(function(err,docs){
        if(err) deferred.reject(err);
        else deferred.resolve(docs);
    }); 
    return deferred.promise;
}

exports.downloadSingle = function(input,cb){
  var query = {};
  query[input.itemId] = input.queryId;
  var projection = input.projection;
  models[input.model].findOne(query,projection).lean()
  .exec(function(err,doc){
    cb(doc);
  });
};