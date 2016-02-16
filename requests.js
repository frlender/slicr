var request = require('request');
var config = require('config');
var Q = require('q');
var fs = require('fs');

var GEN3VAUrl = config.get('GEN3VAUrl');
var GEN3VAOptions = {
    url: GEN3VAUrl,
    method:'POST',
    json: true,
   headers: {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': 'application/json'
    }
};



exports.GEN3VA = function(doc){
	var deferred = Q.defer();
	GEN3VAOptions.body = doc;
	console.log('aa');
	request.post(GEN3VAOptions,function(err,response,body){
    	if(err) deferred.reject(err);
        else deferred.resolve(body);
  	});
  	return deferred.promise;
}