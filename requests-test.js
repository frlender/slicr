var request = require('request');
var Q = require('q');
var fs = require('fs');

var options = {
    url: 'http://amp.pharm.mssm.edu/g2e/api/extract/upload_gene_list',
    method: 'POST',
    json: true,
    headers: {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': 'application/json'
    }
};

var postToGen3va = function(doc) {
    var deferred = Q.defer();
    options.body = doc;
    request.post(options, function(err, response, body) {
        console.log(err, body,'end');
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(body);
        }
    });
    return deferred.promise;
}
var doc = JSON.parse(fs.readFileSync('test.json'));
postToGen3va(doc)
postToGen3va(doc)