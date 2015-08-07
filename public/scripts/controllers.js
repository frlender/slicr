Lich.controller('index',['$scope','$http', '$location',
	function($scope,$http,$location){
	$scope.tags = [

	];
	$scope.from = 0;
	$scope.size = 15;
	$scope.toDefautView = function(){
		$location.path('/search');
	}
	$scope.loadTags = function(typed){
		return $http.get(baseURL+'tags?typed='+typed);
	}
	$scope.isCheckoutView = function() {
		 return $location.path() == '/checkout';
	}
	$scope.search = function(){
		var phrase = $scope.tags.map(function(tag){
			return tag.text;
		}).join(' ');
		$http.get(baseURL+'search?typed='+phrase+'&from='+$scope.from+'&size='+$scope.size).then(function(res){
			res.data.forEach(function(e){
				if(e.cid in $scope.selectedItems)
					e.__selected = true;
				else
					e.__selected = false;
			})
			$scope.items = res.data;
		});
	}
	$scope.previous = function(){
		$scope.from = $scope.from-$scope.size;
		$scope.search();
	}
	$scope.next = function(){
		$scope.from = $scope.from+$scope.size;
		$scope.search();
	}
	$scope.selectedItems = {};
	$scope.selectedCount = 0;
	$scope.$watch('selectedItems',function(newVal,oldVal){
		$scope.selectedCount = Object.keys(newVal).length;
		console.log($location.path());
		if($scope.selectedCount==0 && $location.path() == '/checkout')
			$location.path('/search');
	},true);
	$scope.changeSelected = function(item){
		if(item.__selected)$scope.selectedItems[item.cid] = true
		else
			delete $scope.selectedItems[item.cid]
	}
}])
.controller('search',['$scope', function($scope){
	if($scope.items)
	$scope.items.forEach(function(e){
				if(e.cid in $scope.selectedItems)
					e.__selected = true;
				else
					e.__selected = false;
    });
}])
.controller('checkout',['$scope','$http', 'download',
	function($scope,$http,download){
		$http.post(baseURL+'selected',$scope.selectedItems).then(function(res){
			$scope.items = res.data
		});

	$scope.download = function(){
		download($scope.selectedItems);
	}
	$scope.remove = function(item){
		delete $scope.selectedItems[item.cid];
		item.__selected = false;
	}
}]);
