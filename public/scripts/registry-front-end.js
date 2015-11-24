Lich.value('registry',{
	"level34":{
		"itemIdKey":"cid",
		"name":"Level 3",
		highlight:function(item){
			return false;
		},
		"searchView":{
			select:{
				// default
				option:'all',
				options:["all","reverse","none"],
			}
		},
		"checkoutView":{
			select:{
				option: 'all',
				options: ["all","reverse","none"],
			},
			popoverIcons:["download"]
		},
	},
	"level5":{
		"itemIdKey":"sig_id",
		"name":"Level 5 (CD)",
		// define whether to highlight an item.
		highlight:function(item){
			return item.pvalue<=0.1;
		},
		"searchView":{
			select:{
				option:'significant',
				options:["significant","all","reverse","none"]
			}
		},
		"checkoutView":{
			select:{
				option:'significant',
				options:["significant","all","reverse","none"]
			},
			popoverIcons:["upGenes","dnGenes","download"]
		},
	},	
});