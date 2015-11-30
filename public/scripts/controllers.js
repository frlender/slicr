Lich.controller('index',['$scope','$http', '$location', '$http','registry',
	function($scope,$http,$location,$http,registry){

	$scope.tags = [
		// {text:'A375'},
		// {text:'3.33um'}
	];
	var typeIDs = ['level34','level5']
	$scope.types = typeIDs.map(function(id){
		var type = registry[id];
		type.id = id;
		return type;
	});

	$scope.selectedCount = 0;
	$scope.types.forEach(function(type,i){
		type.selectedItems = {};
		type.initFrom = 0;
		type.initSize = 15;
		type.from = type.initFrom;
		type.size = type.initSize;
		type.checkoutSelectedCount = 0;
		$scope.$watch(function(scope){return scope.types[i].selectedItems;},
			function(newVal,oldVal){
			$scope.selectedCount += Object.keys(newVal).length-Object.keys(oldVal).length;
			if($scope.selectedCount==0 && $location.path() == '/checkout')
				$location.path('/search');
		},true);
		type.toggleSelected = function(item){
			if(item.__selected)type.selectedItems[item[type.itemIdKey]] = item
			else
				delete type.selectedItems[item[type.itemIdKey]]
		}
	});

	$scope.toPreviousView = function(){
		var view = $location.path();
		if(view=='/checkout')
			$location.path('/search');
		else if(S(view).contains('/scatter'))
			$location.path('/checkout');
	}
	$scope.loadTags = function(typed){
		return $http.get(baseURL+'tags?typed='+typed);
	}
	$scope.isNotSearchView = function() {
		 var view = $location.path();
		 return !S(view).contains('/search');
	}

	$scope.singleSearch = function(type){
		var phrase = $scope.tags.map(function(tag){
			return tag.text;
		}).join(' ');
		$http.get(baseURL+'search?typed='+phrase+'&from='+type.from+
				'&size='+type.size+'&type='+type.id).then(function(res){
				res.data.hits.forEach(function(e){
					if(e[type.itemIdKey] in type.selectedItems)
						e.__selected = true;
					else
						e.__selected = false;
				})
				type.items = res.data.hits;
				$scope.count = res.data.count;
		});
	}
	$scope.search = function(){
		$scope.types.forEach(function(type){
			type.from=type.initFrom;
			type.size=type.initSize;
			$scope.singleSearch(type);
		});
	}
	$scope.previous = function(type){
		if(type.from>0){
			type.from = type.from-type.size;
			$scope.singleSearch(type);
		}
	}
	$scope.next = function(type){
		type.from = type.from+type.size;
		$scope.singleSearch(type);
	}
	$scope.isEmptyObj = function(object){ for(var i in object) { return false; } return true; }
	$scope.hasSelected = function(type) {var object = type.selectedItems; return !$scope.isEmptyObj(object) }
	$scope.remove = function(type,item){
		var key = item[type.itemIdKey];
		type.selectedItems[key].__selected = false;
		type.selectedItems[key].__checkoutSelected = false;
		item.__selected = false;
		delete type.selectedItems[key];
	}
}])
.controller('search',['$scope', '$routeParams', function($scope, $routeParams){
	$scope.types.forEach(function(type){
		if(type.items)
		type.items.forEach(function(e){
					if(e[type.itemIdKey] in type.selectedItems)
						e.__selected = true;
					else
						e.__selected = false;
    	});
	});
	if(!$scope.isEmptyObj($routeParams) && $scope.firstParamSearch==undefined){
		$scope.$parent.tags = $routeParams.tags.split(',').map(function(tag){
			return {text:tag};
		});
		$scope.search();
		$scope.firstParamSearch = 'searched';
	}
	$scope.selectItems = function(type){
		var selectItem = function(item){
			item.__selected = true;
			type.selectedItems[item[type.itemIdKey]] = item;
		}
		switch(type.searchView.select.option){
			case 'all':
				type.items.forEach(function(item){
					selectItem(item);
				});
				break;
			case 'none':
				type.items.forEach(function(item){
					if(item.__selected) $scope.remove(type,item);
				});
				break;
			case 'reverse':
				type.items.forEach(function(item){
					if(item.__selected) $scope.remove(type,item);
					else selectItem(item);
				});
				break;
			case 'significant':
				type.items.filter(type.highlight).forEach(function(item){
					selectItem(item);
				});
				break;
		}
	}
}])
.controller('checkout',['$scope','$http', 'download','$window','$location','enrichr',
	function($scope,$http,download,$window,$location,enrichr){

	$window.onclick = function(event){
		// click elsewhere to close the icon popover
		if(!$(event.target).hasClass('icon-popover') && $scope.itemOfActivePopover){
			$scope.itemOfActivePopover.__popover = false;
			$scope.$digest();
		}
	}

	$scope.enrichr = enrichr;

	$scope.templateURL = {
		popover:'popover.html',
		upGenes:'upGenes.html',
		dnGenes:'dnGenes.html'
	}

	$scope.types.forEach(function(type){
		if(!('remove' in type)){
			type.remove = function(item){
				type.selectedItems[item[type.itemIdKey]].__selected = undefined;
				type.selectedItems[item[type.itemIdKey]].__checkoutSelected = undefined;
				delete type.selectedItems[item[type.itemIdKey]];
			}
	   	}
	});

	$scope.download = function(){
		var selected = [];
		$scope.types.forEach(function(type){
			if($scope.hasSelected(type)){
				var each = {id:type.id};
				each.selectedIds = Object.keys(type.selectedItems);
				selected.push(each)
			}
		})
		download(selected);
	}

	$scope.openDEGs = function(type,item,key){
		if(item.upGenes==undefined){
			$http.get(baseURL+'DEGs?id='+item[type.itemIdKey]+'&level='+type.id)
			.then(function(res){
				item.upGenes = res.data.upGenes;
				item.dnGenes = res.data.dnGenes;
				item[key] = true;
			});

		}else{
			item[key] = true;
		}
	}

	$scope.openPopover = function(type,item){

		if($scope.itemOfActivePopover && $scope.itemOfActivePopover[type.itemIdKey] != item[type.itemIdKey])
			$scope.itemOfActivePopover.__popover = false;

		if(!item.__popover){
			item.__popover = true;
			$scope.itemOfActivePopover = item;
		}else{
			item.__popover = false;
		}
	}

	$scope.buildDownloadURL = function(type,item){
		return baseURL+'downloadSingle?id='+item[type.itemIdKey]+'&level='+type.id;
	}

	$scope.getLinkToL1000CDS2 = function(type,item){
		$http.get(baseURL+'l1000cds2?id='+item[type.itemIdKey]+'&level='+type.id).then(function(res){
			window.open(res.data)
		});
	}

	$scope.includeThisIcon = function(type,icon){
		if(type.checkoutView.popoverIcons.indexOf(icon)>-1) return true
		else return false;
	}

	$scope.selectItems = function(type){
		switch(type.checkoutView.select.option){
			case 'all':
				for(var key in type.selectedItems){
					type.selectedItems[key].__checkoutSelected = true;
				}
				type.checkoutSelectedCount = Object.keys(type.selectedItems).length;
				break;
			case 'none':
				for(var key in type.selectedItems){
					type.selectedItems[key].__checkoutSelected = false;
				}
				type.checkoutSelectedCount = 0;
				break;
			case 'reverse':
				var i=0;
				for(var key in type.selectedItems){
					type.selectedItems[key].__checkoutSelected = !type.selectedItems[key].__checkoutSelected;
					if(type.selectedItems[key].__checkoutSelected) i=i+1;
				}
				type.checkoutSelectedCount = i;
				break;
			case 'significant':
				var i = 0;
				for(var key in type.selectedItems){
					if(type.highlight(type.selectedItems[key]))
						type.selectedItems[key].__checkoutSelected = true;
					if(type.selectedItems[key].__checkoutSelected) i=i+1;
				}
				type.checkoutSelectedCount = i;
				break;
		}

	}

	$scope.removeItems = function(type){
		switch(type.checkoutView.remove.option){
			case 'all':
				for(var key in type.selectedItems){
					$scope.remove(type,type.selectedItems[key]);
				}
				type.checkoutSelectedCount = 0;
				break;
			case 'selected':
				for(var key in type.selectedItems){
					if(type.selectedItems[key].__checkoutSelected)
						$scope.remove(type,type.selectedItems[key]);
				}
				type.checkoutSelectedCount = 0;
				break;
		}
	}

	$scope.countCheckoutSelected = function(type){
		var i = 0;
		for(var key in type.selectedItems){
			if(type.selectedItems[key].__checkoutSelected) i=i+1;
		}
		type.checkoutSelectedCount = i;
	}

	$scope.visualizePCA = function(type){
		$location.path('/scatter/'+type.id);
	}
}])
.controller('scatter',['$scope','$http','$routeParams','$location',
	function($scope,$http,$routeParams,$location){
	var type = $scope.types.filter(function(type){return type.id==$routeParams.typeId})[0];
	if(type.checkoutSelectedCount<3)
		$location.path('/checkout');
	else{
		$scope.scatterInput = {
			items:[],
			plotName: type.scatterView.route.toUpperCase()
		};
		var IDs = [];
		for(var key in type.selectedItems){
			var item = type.selectedItems[key];
			if(item.__checkoutSelected){
				IDs.push(item[type.itemIdKey]);
				$scope.scatterInput.items.push(item);
			}
		}
		var payload = {
			level:type.id,
			IDs:IDs
		}
		$scope.colorParam = 'perturbation';
		$http.post(baseURL+type.scatterView.route,payload).then(function(res){
			$scope.scatterInput.scores = res.data;
		});
	}
}])
