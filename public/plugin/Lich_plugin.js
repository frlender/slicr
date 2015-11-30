angular.module('LichPlugin',['ngTagsInput'])
.directive('lichBar',function(){
	return {
		restrict:'AE',
		controller:['$scope','$http',function($scope,$http){
			var url = 'http://amp.pharm.mssm.edu/Lich/';
			var url = 'http://localhost:7070/Lich/';
			$scope.tags = [];
			$scope.loadTags = function(typed){
				return $http.get(url+'tags?typed='+typed);
			}
			$scope.$watchCollection('tags',function(newVal,oldVal){
				var tagString = $scope.tags.map(function(tag){
					return tag.text;
				}).join(',');
				$scope.searchUrl = url+'#/search/'+tagString
			});
		}],
		templateUrl:'plugin/lich_bar.html'
	}
});