'use strict';

/**
 * @ngdoc function
 * @name mapBts4App.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the mapBts4App
 */
angular.module('mapBts4App')
  .controller('MapCtrl', function ($scope, $http, $timeout, NgMap, $mdDialog) {
NgMap.getMap().then(function(map) {
$scope.map = map;
$scope.map.busInnerStops = [];
$scope.map.busOuterStops = [];
$scope.map.markers = [];
$scope.map.busStops = [];
$scope.map.events = [];
// put some data on the map
fillStops();
getMarkers();
var center = map.getCenter();
// console.log(map.getCenter());
// google.maps.event.trigger(map, 'resize');
// map.setCenter(center);
google.maps.event.addDomListener(window, 'resize', function() {
  map.setCenter(center);
})
});

$scope.showShuttle = function(event, item) {
	$scope.selectedShuttle = item;
	$scope.map.showInfoWindow('myInfoWindow', this);
};


//Time between marker refreshes
var INTERVAL = 2000;

//Used to remember markers
var markerStore = {};
var busCount;

//Utility function to test for empty objects
function isEmpty(obj) {
	for(var key in obj) {
		if(obj.hasOwnProperty(key))
			return false;
		}
		return true;
	}

function getMarkers() {
	$http.get("http://bts.ucsc.edu:8081/location/get").then(function(data) {
		$scope.markers = data.data;
		$scope.busCount = $scope.markers.length;

		if(isEmpty(markerStore)) {
			console.log('markerStore is empty. Adding markers.');
			// add the marker
			markerStore = $scope.markers;
		}

		for(var i = 0; i < $scope.markers.length -1 ; i++){
			for(var j = 0; j < markerStore.length -1; j++) {
				 if(markerStore[j].id === $scope.markers[i].id) {
					//console.log('markerStore match on id');
					// we have a match, update the record
					markerStore[j] = $scope.markers[i];
				}
			}
		}
		// put our markerStore var on the scope.
		$scope.markerStore = markerStore;
		window.setTimeout(getMarkers,INTERVAL);
	}, "json");

}

/*
 * Stops are static and therefor don't need to be retrieved from the server, so
 * they are statically defined here. May move them to a utility file later :)
 */
var fillStops = function() {
	var InnerLoopstopData = [
		 [5, 36.9999313354492, -122.062049865723, 'McLaughlin & Science Hill'],
		 [2, 36.9967041015625, -122.063583374023, 'Heller & Kerr Hall'],
		 [3, 36.999210357666, -122.064338684082, 'Heller & Kresge College'],
		 [5, 36.9999313354492, -122.062049865723, 'McLaughlin & Science Hill'],
	 	 [6, 36.9997062683105, -122.05834197998, 'McLaughlin & College 9 & 10 - Health Center'],
	 	 [10, 36.9966621398926, -122.055480957031, 'Hagar & Bookstore'],
		 [13, 36.9912567138672, -122.054962158203, 'Hagar & East Remote'],
		 [15, 36.985523223877, -122.053588867188, 'Hagar & Lower Quarry Rd'],
		 [17, 36.9815368652344, -122.052131652832, 'Coolidge & Hagar'],
		 [18, 36.9787902832031, -122.057762145996, 'High & Western Dr'],
		 [20, 36.9773025512695, -122.054328918457, 'High & Barn Theater'],
		 [23, 36.9826698303223, -122.062492370605, 'Empire Grade & Arboretum'],
		 [26, 36.9905776977539, -122.066116333008, 'Heller & Oakes College'],
		 [29, 36.9927787780762, -122.064880371094, 'Heller & College 8 & Porter']
	];

	for (var i = InnerLoopstopData.length - 1; i >= 0; i--) {
		$scope.map.busInnerStops.push({
						id : InnerLoopstopData[i][0],
						loopType: 'Inner',
						icon: {
							url: '../../images/InnerLoopStop_small.png',
							anchor: new google.maps.Point(5,5),
							origin: new google.maps.Point(0,0),
							},
						latitude: InnerLoopstopData[i][1],
						longitude: InnerLoopstopData[i][2],
						showWindow: false,
						stopName: InnerLoopstopData[i][3]
					  });
	};

	// PSM was a _.each()
	angular.forEach($scope.map.busInnerStops, function (marker) {
	    marker.closeClick = function () {
	       marker.showWindow = false;
	        _.defer(function(){
	        	$scope.$apply();
	        });
	    };
	    marker.onClicked = function () {
	        onclickedStop(marker);
	    };
	});

	var OuterLoopstopData = [
		[1, 36.9992790222168, -122.064552307129, 'Heller & Kresge College'],
		[4, 37.0000228881836, -122.062339782715, 'McLaughlin & Science Hill'],
		[7, 36.9999389648438, -122.058349609375, 'McLaughlin & College 9 & 10 - Health Center'],
		[8, 36.9990234375, -122.055229187012, 'McLaughlin & Crown College'],
		[9, 36.9974822998047, -122.055030822754, 'Hagar & Bookstore-Stevenson College'],
		[11, 36.9942474365234, -122.055511474609, 'Hagar & Field House East'],
		[12, 36.9912986755371, -122.054656982422, 'Hagar & East Remote'],
		[14, 36.985912322998, -122.053520202637, 'Hagar & Lower Quarry Rd'],
		[16, 36.9813537597656, -122.051971435547, 'Coolidge & Hagar'],
		[19, 36.9776763916016, -122.053558349609, 'Coolidge & Main Entrance'],
		[21, 36.9786148071289, -122.05785369873, 'High & Western Dr'],
		[22, 36.9798469543457, -122.059257507324, 'Empire Grade & Tosca Terrace'],
		[24, 36.9836616516113, -122.064964294434, 'Empire Grade & Arboretum'],
		[25, 36.989917755127, -122.067230224609, 'Heller & Oakes College'],
		[27, 36.991828918457, -122.066833496094, 'Heller & Family Student Housing'],
		[28, 36.992977142334, -122.065223693848, 'Heller & College 8 & Porter']
		];

	for (var i = OuterLoopstopData.length - 1; i >= 0; i--) {
		var stop = OuterLoopstopData[i][3];
		$scope.map.busOuterStops.push({
			id : OuterLoopstopData[i][0],
			loopType: 'Outer',
			icon: {
				url: '../../images/OuterLoopStop_small.png',
				anchor: new google.maps.Point(5,5),
				origin: new google.maps.Point(0,0),
			},
			zIndex: 3,
			latitude: OuterLoopstopData[i][1],
			longitude: OuterLoopstopData[i][2],
			showWindow: false,
			stopName: OuterLoopstopData[i][3]
		  });
	};
		angular.forEach($scope.map.busOuterStops, function (marker) {
		    marker.closeClick = function () {
		       marker.showWindow = false;
		        _.defer(function(){$scope.$apply();});
		    };
		    marker.onClicked = function () {
		        onclickedStop(marker);
		    };
		});
}; // end fillstops()

// Dialogs for shuttle Stops
var onclickedStop = function( stop ){
		$scope.currentStopName = stop.stopName;
		$scope.currentStopId = stop.id;
		$scope.currentStopType = stop.loopType;
		$scope.showStop();
	};
var closeStopDialog = function( stop ){
		alert(stop);
	};

$scope.showStop = function($event) {
	    $mdDialog.show({
	      clickOutsideToClose: true,
	      controller: DialogController,
	      templateUrl: '../../views/stopDialog.html',
	      targetEvent: $event,
	      locals: { stop: $scope.currentStopName, id:$scope.currentStopId, type:$scope.currentStopType, map:$scope.map, maps:$scope.maps, marker:$scope.currBus}
	    })
	    .then(function() {
	      //nothing
	    }, function() {
	      //nothing
	    });
};

});
