Lich.value('registry',{
	"level34":{
		"itemIdKey":"distil_id",
		"name":"Level 3",
		highlight:function(item){
			return false;
		},
		getName:function(item){
			return [item.batch,item.pert,item.dose].join(', ')
		},
		"searchView":{
			select:{
				// default
				init:'all',
				options:["all","reverse","none"],
			}
		},
		"checkoutView":{
			select:{
				init: 'all',
				options: ["all","reverse","none"],
			},
			remove:{
				init: 'selected',
				options: ['selected','all']
			},
			popoverIcons:["download"],
			popoverWidth: 22
		},
		"scatterView":{
			route:'pca'
		}
	},
	"level5":{
		"itemIdKey":"sig_id",
		"name":"Level 5 (CD)",
		// define whether to highlight an item.
		highlight:function(item){
			return item.pvalue<=0.1;
		},
		getName:function(item){
			return [item.batch,item.pert,item.dose].join(', ')
		},
		"searchView":{
			select:{
				init:'significant',
				options:["significant","all","reverse","none"]
			}
		},
		"checkoutView":{
			select:{
				init:'significant',
				options:["significant","all","reverse","none"]
			},
			remove:{
				init: 'selected',
				options: ['selected','all']
			},
			popoverIcons:["upGenes","dnGenes","download",'l1000cds2'],
			popoverWidth: 82
		},
		"scatterView":{
			route:'mds'
		}
	},	
});