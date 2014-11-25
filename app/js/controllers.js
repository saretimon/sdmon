'use strict';

/* Controllers */

var myApp = angular.module('myApp', ['ui.bootstrap']);

myApp.controller('MyCtrl1', ['$scope', function($scope) {

  }]);
  
myApp.controller('MyCtrl2', ['$scope', function($scope) {

  }]);


myApp.controller('SortableTableCtrl', function($scope, $http) {
  $scope.head = {a: "Name", b: "Surname", c: "City", d: "Num"};


  $http.get('jpdata/names.json').success(function(data) {
    $scope.body = data;
  });

  $scope.jpbody = [{
          a: "Hans",
          b: "Mueller",
          c: "Leipzig"
      }, {
          a: "Dieter",
          b: "Zumpe",
          c: "Berlin"
      }, {
          a: "Bernd",
          b: "Danau",
          c: "Muenchen"
      }];

  $scope.sort = {
  	column: 'a',
	decending: false
  };

  $scope.rowcolor = function(callhold) {
  	if (callhold > 0) {
		return "background-color:red;color:blue;";
	} else {
		return "background-color:white";
	}
  }

  $scope.selectedCls = function(column) {
  	return column == $scope.sort.column && 'sort-' + $scope.sort.descending;
   };
          
  $scope.changeSorting = function(column) {
	  var sort = $scope.sort;
          if (sort.column == column) {
                  sort.descending = !sort.descending;
          } else {
	          sort.column = column;
                  sort.descending = false;
          }
  };

  $scope.testalert = function() {
  	alert("testing");
  };
});

myApp.controller('DatepickerDemoCtrl', function($scope) {
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.initDate = new Date('2016-15-20');
  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
});
