var mongoose = require('mongoose');
mongoose.connect("mongodb://10.91.53.225/LINCS_L1000_LJP2015");

var Schema = mongoose.Schema({"CL_Name":String,"SM_Dose":Number,
    "SM_Name":String,"SM_Dose_Unit":String,"SM_Time":Number,"cid":String,
    "SM_Time_Unit":String,"vector":Array},{collection:"data"});
var Level3 = mongoose.model('Level3',Schema);


exports.selected = function(cids,callback){
	var query = Level3.find({cid:{$in:cids}}).select({vector:false})
		.lean().exec(function(err,docs){
        if(err) throw err;
       		callback(docs);
    }); 
}

exports.download = function(cids,callback){
	console.log(cids);
	var query = Level3.find({cid:{$in:cids}})
		.lean().exec(function(err,docs){
        if(err) throw err;
       		callback(docs);
    }); 
}