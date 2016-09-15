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
                var screenWidth = window.innerWidth;//����
                var screenHeight = window.innerHeight; //����

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
                    var pinchidReset = data.pinchid; //�ָ�ԭ״ when sliding..
                    if (pinchidReset == $scope.pinchId) {
                        $timeout(function () {
                            $element.panzoom("zoom", normalScale, { silent: true });
                            $element.panzoom("setMatrix", [normalScale, 0, 0, normalScale, 0, 0]);
                            $element[0].style.transform = 'inherit';//���� ionic slide box..
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

                    if (curScaleBy != normalScale) {//��������scale
                        $element.panzoom("zoom", normalScale, { animate: true, silent: true });
                        $element.panzoom("setMatrix", [normalScale, 0, 0, normalScale, 0, 0]);
                    } else {//�������ֵ ,�Խ�����
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
                    var picHeight = $element.height();//ͼƬԭʼ�߶�  
                    var picWidth = $element.width(); //ͼƬԭʼ����
                    var curScaleBy = curMatrix[0];//������� 
                    var zoomedWidth = picWidth * curScaleBy; //����󳤶�
                    var zoomedHeight = picHeight * curScaleBy;//�����߶�
                    var maxTranslateXWidth = ((zoomedWidth - screenWidth) < 0) ? 0 : ((zoomedWidth - screenWidth) / 2 + leftSpacePixels); //���translate ���
                    var maxTranslateXHeight = ((zoomedHeight - screenHeight) < 0) ? 0 : ((zoomedHeight - screenHeight) / 2 + leftSpacePixels);//���translate �߶�

                    var originMatrixWidth = curMatrix[4]; //��¼ԭʼtranslateX
                    var originMatrixHeight = curMatrix[5];//��¼ԭʼtranslateY

                    curMatrix[4] = Math.min(maxTranslateXWidth, Math.abs(curMatrix[4]));//���ܳ���������쳤��
                    curMatrix[5] = Math.min(maxTranslateXHeight, Math.abs(curMatrix[5]));//���ܳ���������쳤��

                    originMatrixWidth < 0 ? (curMatrix[4] = -curMatrix[4]) : (curMatrix[4] = curMatrix[4]);
                    originMatrixHeight < 0 ? (curMatrix[5] = -curMatrix[5]) : (curMatrix[5] = curMatrix[5]);

                    $element.panzoom("setMatrix", curMatrix); //���ü����matrix
                }

                function panPic() {
                    var martrix = $element.panzoom("getMatrix");
                    var curScaleBy = martrix[0];
                    if (curScaleBy == normalScale) {//��ǰδ��
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
