var config = require('config');
var fs = require('fs');
var _ = require('underscore');

var genes = fs.readFileSync('./data/POLgenes.json');

genes = JSON.parse(genes);

module.exports = {
	level34:{
		type:config.types.level34,
		itemId:'distil_id',
		mongodb:{
			collection:"inst",
			schema:{"distil_id":String, "cell_id":String,"pert_dose":Number,
    "pert_iname":String,"pert_dose_unit":String,"pert_time":Number,
    "pert_time_unit":String,"vector":Array,det_plate:String,
	det_well:String,pert_id:String,pert_mfc_id:String,pert_type:String},
		},
		format :function(archive,docs){
			var metaHeaders = ["distil_id", "cell_id", "det_plate", "det_well",
				"pert_dose", "pert_dose_unit", "pert_id", "pert_iname", 
				"pert_mfc_id", "pert_time", "pert_time_unit", "pert_type", 
				"batch"];
			var meta = [];
			var mat = [];
			var matHeader = [];
			matHeader.push('gene symbols');
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
			archive.append(meta.join('\n'),{name:'level3_meta.csv'});
			// matrix file
			mat = _.zip.apply(null,mat) // transpose;
			var matFile = [];
			matFile.push(matHeader.join(delim));
			mat.forEach(function(row,i){
				matFile.push(genes[i]+delim+row.join(delim));
			});
			archive.append(matFile.join('\n'),{name:'level3_matrix.csv'});
		}
 	},
	level5:{
		type:config.types.level5,
		itemId:'sig_id',
		mongodb:{
			collection:"cd",
			schema:{"sig_id":String,"cell_id":String,"pert_dose":Number,
    "pert_iname":String,"pert_dose_unit":String,"pert_time":Number,
    "pert_time_unit":String,"chdirFull":Array,"sigIdx":Array,pert_id:String,
    replicateCount:Number,pvalue:Number,chdirMeanDistLm:Number,pert_type:String}
	},
	format : function(archive,docs){
    // meta file
	var metaHeaders = ["sig_id","pvalue","replicateCount","cell_id","pert_dose",
    "pert_iname","pert_dose_unit","pert_time",
    "pert_time_unit","pert_id","pert_type"];
    var meta = [];
	var matFull = [];
	var matFullHeader = [];
	var sigGenes = _.range(0,docs[0].chdirFull.length).map(function(i){
		return [];
	});
	matFullHeader.push('signatures in which the gene is significant,gene symbol');
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
		matFull.push(doc.chdirFull);
		matFullHeader.push(doc.sig_id);
		meta.push(docArr.join(delim));
		if('sigIdx' in doc)
			doc.sigIdx.forEach(function(idx){
				sigGenes[idx-1].push(doc.sig_id)
			});
	});
	archive.append(meta.join('\n'),{name:'level5_CD_meta.csv'});
	// matrix file
	matFull = _.zip.apply(null,matFull) // transpose;
	var matFile = [];
	matFile.push(matFullHeader.join(delim));
	matFull.forEach(function(row,i){
		matFile.push(sigGenes[i].join('|')+delim+genes[i]+delim+row.join(delim));
	});
	archive.append(matFile.join('\n'),{name:'level5_CD_matrix.csv'});
}
}
}