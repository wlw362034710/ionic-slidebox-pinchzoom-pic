angular.module('starter.controllers', [])
  .controller('DemoController',function($scope,$ionicSlideBoxDelegate){
	  var previousSliderInd = 0;
	  $scope.allPics = [{picurl:'img/2.png'},{picurl:'img/2.png'}];
	  
	  $scope.slideChange = function(activeInd){
		   $scope.$broadcast('$resetPinchZoomWhileSliding', { pinchid: previousSliderInd });
		   previousSliderInd = activeInd;
	  }
	  $scope.slide = function(left) {
                    if (left) {
                        //console.log('slide left happen !');
                        $ionicSlideBoxDelegate.next();
                    } else {
                        //console.log('slide right happen !');
                        $ionicSlideBoxDelegate.previous();
                    }
      }
  });