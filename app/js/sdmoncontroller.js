'use strict';

/* Controllers */

var myApp = angular.module('sdmonApp', ['ngSanitize']);


myApp.controller('SortableTableCtrl', function($scope, $http) {

  $scope.headorder = ['label', 'callsw', 'availag', 'staffed', 'oldestcall', 'abandoned', 'lastupd'];
  $scope.head = {"label": "Team<br>Name", "callsw": "Calls<br>Waiting", "availag": "Avail<br>Agents", "staffed": "Agents<br>Staffed", "oldestcall": "Oldest<br>Call<br>Waiting", "abandoned": "Abandons", "lastupd": "Last Update<br>(CT)"};


  $http.get('jpdata/summary.json').success(function(data) {
    $scope.body = data;
  });

  $scope.sort = {
  	column: 'a',
	decending: false
  };

  $scope.rowcolor = function(callhold, availagent) {
  	if (callhold > 0 && availagent == 0) {
		return "background-color:red;color:white;";
	} 
	else if (callhold > 0 && availagent > 0) {
		return "background-color:purple;color:white;";
	} 
	else if (callhold == 0 && availagent > 0) {
		return "background-color:blue;color:white;";
	} 
	else if (callhold == 0 && availagent == 0) {
		return "background-color:orange;color:white;";
	} 
	else {
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

  $scope.buttonarray = [
    {items: [{value:"3009"}, {value:"3010"}]}, 
    {items: [{value:"3012"}, {value:"3016"}]}
  ];
  $scope.buttonarray.push(
    {items: [{value:"3019"}, {value:"3142"}]}
  ); 

  $scope.showskills = [];
  $scope.selectItems = function (item) {
    if ($scope.showskills.indexOf(item.skill) > -1) {return true;}
  }

  $scope.addremoveskill = function (skill) {
    var i = $scope.showskills.indexOf(skill);
    if (i > -1) {
      console.log("showskills before:" + $scope.showskills);
      $scope.showskills.splice(i, 1); 
      console.log("showskills after:" + $scope.showskills);
    }
    else {$scope.showskills.push(skill);}
  }

  $scope.blueborder = function (skill) {
    var i = $scope.showskills.indexOf(skill);
    if (i > -1) {
      return "border:0.25em solid blue;";
    }
  } 
    

  $scope.testalert = function() {
  	alert("testing");
  };
});

myApp.filter('num', function() {
  return function(input) {
    return parseInt(input, 10);
  }
});
