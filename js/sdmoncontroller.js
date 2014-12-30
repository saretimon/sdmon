'use strict';

/* Controllers */

var myApp = angular.module('sdmonApp', ['ipCookie','ngSanitize']);

myApp.controller('SortableTableCtrl', function(ipCookie, $scope, $http) {
  
  $scope.skillid = new Array();
  //$scope.showskills = $cookieStore.get('showskills') || new Array();
  $scope.showskills = ipCookie('showskills') || new Array();
  $scope.allskills = new Array(); 
  $scope.teamtitle;
  $scope.hidesummary;
  $scope.s_agtable;
  $scope.multiteam = ipCookie('multiteam') || false;
  $scope.refresh_count = 0;
  $scope.r_counter = false;
  $scope.teamselected = false;
  $scope.hidelogout = false;
  $scope.body = new Array();
  $scope.agents = new Array();
  var nodupagent = new Array();
  $scope.visualalert = ipCookie('visalert') || true;
  $scope.audiblealert;
  $scope.audalertselect = ipCookie('audalert') || false;
  $scope.sound = ipCookie('audalertsnd') || "chime_a.wav";
  //jptst$scope.bgcolor = "background-color:white;";
  $scope.bgcolor = "white";
  $scope.buttonarray = new Array();
  $scope.finalbtnarray = new Array();
  $scope.btablestyle;
  var tmpbtnarray = new Array();
  var tmpbtnsetuparray = new Array();
  var btn_per_row = 100;
  var buttoncount;
  //var btntablewidth = document.getElementById('button_table').clientWidth;
  var btntablewidth;
  var browserwidth;
  var browserwidth_last = 0;
  var lastinrow = false;
  var numteams = 5;

  var premonly = ['3009','3016'];


  $scope.headorder = ['label', 'callsw', 'availag', 'staffed', 'oldestcall', 'abandoned', 'lastupd'];
  $scope.head = {"label": "Team<br>Name", "callsw": "Calls<br>Waiting", "availag": "Avail<br>Agents", "staffed": "Agents<br>Staffed", "oldestcall": "Oldest<br>Call<br>Waiting", "abandoned": "Abandons", "lastupd": "Last Update<br>(CT)"};
  $scope.agheadorder = ['ext', 'status', 'name', 'timeinstate', 'auxstate'];
  $scope.aghead = {"ext": "Extension", "status": "Status", "name": "Name", "timeinstate": "Time in State", "auxstate": "AUX State"};


  $http.get('summary/summary.json').success(function(data) {
    $scope.getdata();
//    $scope.body = data;

//    $scope.refresh(); 
  });
  

  $scope.setdefaults = function() {
    $scope.hidesummary = false;
    $scope.s_agtable = false;
    $scope.multiteam = false;
    $scope.visualalert = true;
    $scope.audalertselect = false;
    $scope.sound = "chime_a.wav";
    //jptst$scope.bgcolor = "background-color:white;";
    $scope.bgcolor = "white";
    $scope.hidelogout = false;
    $scope.r_counter = false;

    while($scope.showskills.length > 0) {
      $scope.showskills.pop();
    }
    while($scope.skillid.length > 0) {
      $scope.skillid.pop();
    }

    ipCookie('visalert',$scope.visualalert);
    ipCookie('audalert',$scope.audalertselect);
    ipCookie('audalertsnd',$scope.sound);
    ipCookie('showskills',$scope.showskills);
    ipCookie('multiteam',$scope.multiteam);
  }


  $scope.refresh = function() {
    //$scope.reloadvar = setTimeout(function() {$scope.getdata();}, 10000);
    $scope.getdata();
  }
  $scope.manualrefresh = function() {
    window.clearTimeout($scope.reloadvar);
    $scope.refresh();
  }


  $scope.getdata = function() {
    var callswcolor = "white";
    var oldaudiblealert = $scope.audiblealert;
    var oldbody = $scope.body;
    $scope.refresh_count++;
    $scope.audiblealert=false;
    //jptst$scope.btablestyle = "width:"+(window.innerWidth-80)+"px;";
    $scope.btablestyle = {'width':(window.innerWidth-80)+'px'};

//  Used this cluster instead of $http.get to avoid caching json files
    $http({
         url: 'summary/summary.json',
	 method: "GET",
         params: {'meaningless': new Date().getTime() }
    }).success(function(data) {
      $scope.body = data; 

      // Exit if no data returned
      if($scope.body.length < 1) {
        $scope.body = oldbody;
        $scope.audiblealert = oldaudiblealert;
        return;
      }

      // Clear arrays 
      while(tmpbtnarray.length > 0) {
        tmpbtnarray.pop();
      }
      while(tmpbtnsetuparray.length > 0) {
        tmpbtnsetuparray.pop();
      }
      while($scope.buttonarray.length > 0) {
        $scope.buttonarray.pop();
      }
      while($scope.allskills.length > 0) {
        $scope.allskills.pop();
      }

      // SET UP BUTTON TABLE 
      // Add all skills into array to build button table
      // And set audible alert if necessary
      for (var b=0; b < $scope.body.length; b++) {
        //tmpbtnarray.push({value:$scope.body[b].skill});
        tmpbtnarray.push({value:$scope.body[b].skill,label:$scope.body[b].label});

	if($scope.showskills.indexOf($scope.body[b].skill) > -1 && $scope.body[b].callsw > 0 && $scope.body[b].availag ==0) {
	  $scope.audiblealert=true;
          callswcolor = "red";
        }

        // This just creates an array of all the skills
	$scope.allskills.push($scope.body[b].skill);
      }
      $scope.buttonarray.push({items:tmpbtnarray});

      // Button table is one line. Rebuild it with mkbtntable to fit window.
      setTimeout(function() {$scope.mkbtntable();}, 10);

      // Set background color
      //jptst$scope.bgcolor = "background-color:"+callswcolor+";";
      $scope.bgcolor = callswcolor;
      
      // Play sound if calls waiting
      if($scope.audiblealert) {
        $scope.soundselect()
      }
    });

    // Clear agents array before rebuilding it.
    while($scope.agents.length > 0) {
      $scope.agents.pop();
    }
    // Clear nodupagent array before rebuilding it.
    while(nodupagent.length > 0) {
      nodupagent.pop();
    }
    for (var z=0; z< $scope.skillid.length; z++) {
      var isprem = false;
      if(premonly.indexOf($scope.skillid[z]) > -1) {isprem = true;}

      $http({
         url: 'skills/'+$scope.skillid[z]+'.agent.json',
	 method: "GET",
	 params: {'meaningless': new Date().getTime() }
      }).success(function(data) {
        for (var i=0; i< data.length; i++) {
	  // Check for logged in dupes
	  if (nodupagent.indexOf(data[i].name) == -1) {
	    if (data[i].status.indexOf('Logged') == -1) {
	      nodupagent.push(data[i].name);
	      // Set AUX State to premonly if premonly skill
	      if (isprem && data[i].status.indexOf('AVAIL') != -1) {
	        data[i].auxstate = 'PREM_ONLY';
	      }
              $scope.agents.push(data[i]);
            }
          }
	  // Check for logged out dupes
	  if (nodupagent.indexOf(data[i].name+'loggedout') == -1) {
	    if (data[i].status.indexOf('Logged') != -1) {
	      nodupagent.push(data[i].name+'loggedout');
              $scope.agents.push(data[i]);
            }
          }
        }
      });
    }

    // Restart the data refresh timer
    $scope.reloadvar = setTimeout(function() {$scope.refresh();}, 10000);
  }; 

  $scope.mkbtntable = function() {
    buttoncount = 1;
    browserwidth = window.innerWidth - 45;
    btntablewidth = document.getElementById('button_table').clientWidth;
    if (btntablewidth < 1) {btntablewidth = 1;}
    var rows = Math.floor(btntablewidth/browserwidth) + 1;
    btn_per_row = Math.floor($scope.body.length / rows);
      
    // Clear buttonarray
    while($scope.buttonarray.length > 0) {
      $scope.buttonarray.pop();
    }

    for (var b=0; b < $scope.body.length; b++) {
      if(buttoncount < btn_per_row) {
        //tmpbtnsetuparray.push({value:$scope.body[b].skill});
        tmpbtnsetuparray.push({value:$scope.body[b].skill,label:$scope.body[b].label});
        buttoncount++;
        lastinrow = false;
      }
      else {
        //tmpbtnsetuparray.push({value:$scope.body[b].skill});
        tmpbtnsetuparray.push({value:$scope.body[b].skill,label:$scope.body[b].label});
        $scope.buttonarray.push({items:tmpbtnsetuparray});
        buttoncount = 1;
        lastinrow = false;
        tmpbtnsetuparray = new Array();
      } 
    }

    $scope.$apply(function() {
      $scope.buttonarray.push({items:tmpbtnsetuparray});
    });
  };


  $scope.chgmultiteam = function() {
    ipCookie('multiteam',$scope.multiteam, { expires: 30 });
  }

  $scope.chgvisalert = function() {
    ipCookie('visalert',$scope.visualalert, { expires: 30 });
    if(!$scope.visualalert) {
      //jptst$scope.bgcolor = "background-color:white;";
      $scope.bgcolor = "white";
    }
  }

  $scope.chgaudalert = function() {
    ipCookie('audalert',$scope.audalertselect, { expires: 30 });
  }

  $scope.chgsndselect = function() {
    ipCookie('audalertsnd',$scope.sound, { expires: 30 });
    $scope.soundselect();
  }

  $scope.soundselect = function() {
    var myNav = navigator.userAgent.toLowerCase();
    if($scope.audalertselect) {
      var snd = new Audio("sounds/" + $scope.sound);
      snd.play();
    }
    // Play in IE browser
    if($scope.audalertselect && myNav.indexOf('msie') != -1) {
      document.getElementById("dummyspan").innerHTML= "<embed src='sounds/"+$scope.sound+"' hidden=true autostart=true loop=false>";
    }
  }


  $scope.rowcolor = function(callhold, availagent, skill) {
  	var elements;

  	if (callhold > 0 && availagent == 0) {
		// Set the row color to red
		//jptstelements = "background-color:red;color:white;";
		elements = {'background-color':'red','color':'white'};

		// Set the screen background color red 
		if($scope.visualalert) {
		  //jptst$scope.bgcolor = "background-color:red;";
		  $scope.bgcolor = "red";
		}
	} 
	else if (callhold > 0 && availagent > 0) {
		//jptst elements = "background-color:purple;color:white;";
		elements = {'background-color':'purple','color':'white'};

		// Set the screen background color red 
		if($scope.visualalert) {
		  //jptst$scope.bgcolor = "background-color:red;";
		  $scope.bgcolor = "red";
		}
	} 
	else if (callhold == 0 && availagent > 0) {
		//jptst elements = "background-color:blue;color:white;";
		elements = {'background-color':'blue','color':'white'};
	} 
	else if (callhold == 0 && availagent == 0) {
		//jptst elements = "background-color:orange;color:white;";
		elements = {'background-color':'orange','color':'white'};
	} 
	else {
		//jptst elements = "background-color:white";
		elements = {'background-color':'white'};
	}

	var skillidindex = $scope.skillid.indexOf(skill);
	if(skillidindex > -1) {
	  //jptstelements += "border:5px solid cyan";
	  elements.border = '5px solid cyan';
	}

	return elements;
  }
   
  $scope.agrowcolor = function(status) {
  	var elements;
	var avail = status.indexOf("AVAIL");
	if(avail > -1) {
	  //jptstelements = "background-color:lime";
	  elements = {'background-color':'lime'};
	}

	return elements;
  }
	  

  $scope.sumtable = function() {
    //jptstvar elements = "width:50%;";
    var elements = {'width':'50%'};
    if($scope.skillid.length < 1) {
      elements = {'width':'auto'};
    }
    return elements;
  }

  $scope.agtable_nosum = function () {
    //jptstvar elements = "agents";
    var elements;
    if($scope.hidesummary) {
      //elements = "agents_nosum";
      //jptst elements = "float:left;width:auto;";
      elements = {'cssFloat':'left','width':'auto'};
    }
    return elements;
  }


  $scope.sort = {
    column: "label",
    decending: false
  };

  $scope.agsort = {
    column: 'name',
    decending: false
  };

  $scope.selectedCls = function(column) {
    return column == $scope.sort.column && 'sort-' + $scope.sort.descending;
   };

  $scope.agselectedCls = function(column) {
    return column == $scope.agsort.column && 'sort-' + $scope.agsort.descending;
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

  $scope.agchangeSorting = function(column) {
	  var sort = $scope.agsort;
          if (sort.column == column) {
                  sort.descending = !sort.descending;
          } else {
	          sort.column = column;
                  sort.descending = false;
          }
  };

//  var tmparray = new Array();
//  tmparray.push({value:"3009"});
//  tmparray.push({value:"3010"});
//  $scope.buttonarray = [
//    {items: tmparray},
//    {items: [{value:"3012"}, {value:"3016"}]}
//  ];
//  $scope.buttonarray.push(
//    {items: [{value:"3019"}, {value:"3142"}]}
//  ); 


  $scope.selectItems = function (item) {
    if ($scope.showskills.indexOf(item.skill) > -1) {return true;}
  }

  $scope.filterlogout = function (item) {
    if ($scope.hidelogout && item.status.indexOf('Logged') > -1) {return false;}
    else {return true;}
  } 

  $scope.addremoveskill = function (skill) {
    // Start by setting background color to white each time
    //jptst$scope.bgcolor = "background-color:white;";
    $scope.bgcolor = "white";

    var i = $scope.showskills.indexOf(skill);
    var k = $scope.skillid.indexOf(skill);
    if (i > -1) {
      $scope.showskills.splice(i, 1); 
      if (k > -1) { 
        $scope.skillid.splice(k, 1);
      }
    }
    else {$scope.showskills.push(skill);}

    // Store cookie with skills
    //$cookieStore.put('showskills',$scope.showskills);
    ipCookie('showskills',$scope.showskills, { expires: 30 });
  }

  $scope.btnstyle = function (skill) {
    //jptstvar styletext = "text-align:center;font-size:0.7em;width:8em;";
    var styletext = {'text-align':'center','font-size':'0.7em','width':'8em'};
    var i = $scope.showskills.indexOf(skill);
    var b = $scope.allskills.indexOf(skill);
    if (i > -1) {
      //styletext = "border:0.25em solid blue;";
      //jptststyletext = styletext+"border:0.25em solid blue;";
      styletext.border = '0.25em solid blue';
    }
    //jptstif ($scope.body[b].callsw > 0 && $scope.body[b].availag ==0) {
    if ($scope.body[b].callsw > 0) {
      //jptststyletext = styletext+"background-color:red;"
      styletext.backgroundColor = 'red';
    }
    return styletext;
  } 
    

  $scope.showagents = function(skill) {
    var skillidindex = $scope.skillid.indexOf(skill);

    // Clear data refresh timer
    window.clearTimeout($scope.reloadvar);

    if(skillidindex > -1) {
      $scope.skillid.splice(skillidindex,1);
    }
    else { 
      //Multiple skill selection option
      if($scope.multiteam == true) {
        // Limit number of skills
        if($scope.skillid.length < numteams || $scope.agquery == "more teams") { $scope.skillid.push(skill); }
        else { alert("Maximum of "+numteams+" teams selected at a time."); }
      }
      else {
        while($scope.skillid.length > 0) {$scope.skillid.pop();}
	$scope.skillid.push(skill);
      }
    }
    
    $scope.refresh();
  };


  $scope.gettitle = function(skill) {
    $scope.teamselected = true;
    if(skill == 'backtoteams') {
      $scope.teamselected = false;
    }
    else {
      $scope.teamtitle = "titles/"+skill+".html";
    }
  };

});

myApp.filter('num', function() {
  return function(input) {
    return parseInt(input, 10);
  }
});
