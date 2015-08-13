var config = require('config');
var fs = require('fs');
var _ = require('underscore');

var genes = fs.readFileSync('data/GEOgenes.json');

genes = JSON.parse(genes);

module.exports = {
	level34:{
		type:config.types.level34,
		itemId:'cid',
		mongodb:{
			collection:"data",
			schema:{"cid":String, "CL_Name":String,"SM_Dose":Number,
    "SM_Name":String,"SM_Dose_Unit":String,"SM_Time":Number,
    "SM_Time_Unit":String,"vector":Array,"chdirLm":Array,det_plate:String,
	det_well:String,SM_LINCS_ID:String,SM_Center_Compound_ID:String,SM_Pert_Type:String},
		},
		format :function(archive,docs){
			var metaHeaders = ["cid", "CL_Name", "det_plate", "det_well",
				"SM_Dose", "SM_Dose_Unit", "SM_LINCS_ID", "SM_Name", 
				"SM_Center_Compound_ID", "SM_Time", "SM_Time_Unit", "SM_Pert_Type", 
				"batch"];
			var meta = [];
			var mat = [];
			var matHeader = [];
			matHeader.push('gene symbols');
			var delim = ',';
			meta.push(metaHeaders.join(delim));
			console.log(53);
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
			console.log('55');
			// matrix file
			mat = _.zip.apply(null,mat) // transpose;
			var matFile = [];
			matFile.push(matHeader.join(delim));
			mat.forEach(function(row,i){
				matFile.push(genes[i]+delim+row.join(delim));
			});
			console.log('522');
			archive.append(matFile.join('\n'),{name:'level3_matrix.csv'});
			console.log('558');
		}
 	},
	level5:{
		type:config.types.level5,
		itemId:'sig_id',
		mongodb:{
			collection:"CD",
			schema:{"sig_id":String,"cell_id":String,"pert_dose":Number,
    "pert_desc":String,"pert_dose_unit":String,"pert_time":Number,
    "pert_time_unit":String,"chdirFull":Array,"sigIdx":Array,pert_id:String,
    replicateCount:Number,pvalue:Number,chdirMeanDistLm:Number,pert_type:String}
	},
	format : function(archive,docs){
    // meta file
	var metaHeaders = ["sig_id","pvalue","replicateCount","cell_id","pert_dose",
    "pert_desc","pert_dose_unit","pert_time",
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