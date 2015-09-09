Lich.controller('index',['$scope','$http', '$location',
	function($scope,$http,$location){
	$scope.tags = [
		// {text:'A375'},
		// {text:'3.33um'}
	];
	$scope.types = [
		{id:"level34",
	     name:"Level 3",
	     itemIdKey:'cid'},
		{id:'level5',
		 name:'Level 5 (CD)',
		 itemIdKey:'sig_id'}
	];
	$scope.selectedItems = {};
	$scope.selectedCount = 0;
	$scope.types.forEach(function(type,i){
		type.selectedItems = {};
		type.initFrom = 0;
		type.initSize = 15;
		type.from = type.initFrom;
		type.size = type.initSize;
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
	$scope.toDefautView = function(){
		$location.path('/search');
	}
	$scope.loadTags = function(typed){
		return $http.get(baseURL+'tags?typed='+typed);
	}
	$scope.isCheckoutView = function() {
		 return $location.path() == '/checkout';
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
			type.size = type.initSize;
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
}])
.controller('search',['$scope', function($scope){
	$scope.types.forEach(function(type){
		if(type.items)
		type.items.forEach(function(e){
					if(e[type.itemIdKey] in type.selectedItems)
						e.__selected = true;
					else
						e.__selected = false;
    	});
	});
}])
.controller('checkout',['$scope','$http', 'download',
	function($scope,$http,download){

	$scope.types.forEach(function(type){
		if(!('remove' in type)){
			type.remove = function(item){
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
}]);
