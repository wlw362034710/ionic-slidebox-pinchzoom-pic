angular.module('starter.directives', [])
  .directive('pinchzoom',function($ionicGesture,$timeout){
    return {
      scope: {
         pinchId: '@'
      },
      link: function ($scope, $element, attrs, ngModelCtrl) {
		  const leftSpacePixels = 20;
                const maxScale = 2;
                const minScale = 0.5;
                const normalScale = 1;
                var gestureDbClick = $ionicGesture.on('doubletap', doubleScalePic, $element, { prevent_default_directions: ['left', 'right', 'up', 'down'] });
                var screenWidth = window.innerWidth;//屏宽
                var screenHeight = window.innerHeight; //屏高

                function resetzoom() {
                    $element.panzoom("resetZoom", {
                        animate: true,
                        silent: true
                    });

                    $element.panzoom("resetPan", {
                        animate: false,
                        silent: true
                    });
                }

                $scope.$on('$resetPinchZoomWhileSliding', function (event, data) {
                    var pinchidReset = data.pinchid; //恢复原状 when sliding..
                    if (pinchidReset == $scope.pinchId) {
                        $timeout(function () {
                            $element.panzoom("zoom", normalScale, { silent: true });
                            $element.panzoom("setMatrix", [normalScale, 0, 0, normalScale, 0, 0]);
                            $element[0].style.transform = 'inherit';//兼容 ionic slide box..
                        }, 200);
                    }
                });

                function doubleScalePic(event) {
                    if (event) {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        event.stopPropagation();//prevent ng-click ?
                    }
                    var middle = {
                        clientX: event.gesture.center.pageX,
                        clientY: event.gesture.center.pageY
                    }

                    var martrix = $element.panzoom("getMatrix");
                    var curScaleBy = martrix[0];

                    if (curScaleBy != normalScale) {//不在正常scale
                        $element.panzoom("zoom", normalScale, { animate: true, silent: true });
                        $element.panzoom("setMatrix", [normalScale, 0, 0, normalScale, 0, 0]);
                    } else {//如果正常值 ,对焦伸缩
                        $element.panzoom("zoom", maxScale, {
                            focal: middle,
                            matrix: martrix,
                            animate: false
                        });

                        //$element.panzoom("pan", +martrix[4] - middle.clientX,
                        //    +martrix[5] - middle.clientY, { matrix: martrix, animate: 'skip' });
                    }
                    return false;
                }

                function zoomend() {
                    var martrix = $element.panzoom("getMatrix");
                    var curScaleBy = martrix[0];
                    if (curScaleBy < normalScale) {
                        resetzoom();
                    }
                    if (curScaleBy > maxScale) {
                        $element.panzoom("zoom", maxScale, { silent: true });
                        $element.panzoom("setMatrix", [maxScale, 0, 0, maxScale, 0, 0]);
                    }
                }

                function caculateMatrix(curMatrix) {
                    var picHeight = $element.height();//图片原始高度  
                    var picWidth = $element.width(); //图片原始长度
                    var curScaleBy = curMatrix[0];//拉伸比例 
                    var zoomedWidth = picWidth * curScaleBy; //拉伸后长度
                    var zoomedHeight = picHeight * curScaleBy;//拉伸后高度
                    var maxTranslateXWidth = ((zoomedWidth - screenWidth) < 0) ? 0 : ((zoomedWidth - screenWidth) / 2 + leftSpacePixels); //最大translate 宽度
                    var maxTranslateXHeight = ((zoomedHeight - screenHeight) < 0) ? 0 : ((zoomedHeight - screenHeight) / 2 + leftSpacePixels);//最大translate 高度

                    var originMatrixWidth = curMatrix[4]; //记录原始translateX
                    var originMatrixHeight = curMatrix[5];//记录原始translateY

                    curMatrix[4] = Math.min(maxTranslateXWidth, Math.abs(curMatrix[4]));//不能超过最大拉伸长度
                    curMatrix[5] = Math.min(maxTranslateXHeight, Math.abs(curMatrix[5]));//不能超过最大拉伸长度

                    originMatrixWidth < 0 ? (curMatrix[4] = -curMatrix[4]) : (curMatrix[4] = curMatrix[4]);
                    originMatrixHeight < 0 ? (curMatrix[5] = -curMatrix[5]) : (curMatrix[5] = curMatrix[5]);

                    $element.panzoom("setMatrix", curMatrix); //设置计算后matrix
                }

                function panPic() {
                    var martrix = $element.panzoom("getMatrix");
                    var curScaleBy = martrix[0];
                    if (curScaleBy == normalScale) {//当前未动
                        $element.panzoom("resetPan", {
                            animate: false,
                            silent: true
                        });
                    } else {
                        caculateMatrix(martrix);
                    }
                }

                $timeout(function () {
                    $element.panzoom({
                        contain: false,
                        disablePan: false,
                        increment: 0.5,
                        minScale: minScale,
                        maxScale: maxScale,
                        onEnd: zoomend,
                        onPan: panPic,
                        deviceWidth: screenWidth,
                        deviceHeight: screenHeight
                    });
                }, 100);

                $scope.$on('$destroy', function () {
                    $ionicGesture.off(gestureDbClick, 'doubletap', doubleScalePic);
                    $element.panzoom("destroy");
                });
      }
    }
  });
