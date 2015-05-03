window.APIURL = ""

angular.module("Creddon", [
  "ui.router",
  "ngImgCrop"
])

.config(["$stateProvider", "$urlRouterProvider", "$httpProvider", function($stateProvider, $urlRouterProvider, $httpProvider){
  $urlRouterProvider.otherwise("/")

  $stateProvider
    .state("landing", {
      url: "/",
      templateUrl: "templates/landing.html"
    })
    .state("causes", {
      url: "/causes",
      templateUrl: "templates/causes.html"
    })
}])


.controller("landingCtrl", ["$scope", function($scope){}])
.controller("causesCtrl", ["$scope", "$httpf", function($scope, $httpf){

  $scope.tw = false
  $scope.fb = false
  $scope.ig = false

  $scope.selectCause = function(cause) {
    $scope.selectedCause = cause
    angular.element("#file-reader").trigger("click")
  }
  // $scope.share = function(){
  //   $http({
  //     type: "POST",
  //     url: "https://creddon.com/crop",
  //     data: {img: $scope.image, logo: $scope.selectedCause.logo, tw: $scope.tw, fb: $scope.fb, ig: $scope.ig}
  //   })
  // }

  $httpf.get(APIURL+"/causes/").success(function(data){
    $scope.causes = data
  }).error(log)

  angular.element(document.querySelector("#file-reader")).on("change", function(e){
    var file = e.currentTarget.files[0],
        reader = new FileReader()
    reader.onload = function(e){
      $scope.image = e.target.result
      $scope.$apply()
    }
    reader.readAsDataURL(file)
  })
}])































.service("$httpf", [function(){
  this.api = window.$apif = {
    "causes": [
      {"id":1, "name":"ACS", "description":"For over 100 years...", "totalDonations": 23098, "link":"", "logo":"img/acs.png"},
      {"id":2, "name":"Kiva", "description":"We are a non-profit...", "totalDonations": 163083, "link":"", "logo":"img/kiva.png"},
      {"id":3, "name":"Unicef", "description":"UNICEF promotes...", "totalDonations": 97856, "link":"", "logo":"img/unicef.png"},
      {"id":4, "name":"Water.org", "description":"Water.org provides...", "totalDonations": 303875, "link":"", "logo":"img/water.png"}
    ]
  }





  /* Pathval for fake api. I modified it for browser. Original: chaijs/pathval */var pathval=function(){function e(e,n){var t=r(n);return i(t,e)}function n(e,n,i){var p=r(n);t(p,i,e)}function r(e){for(var n=(e||"").replace(/\[/g,".["),r=n.match(/(\\\.|[^.]+?)+/g),i=/\[(\d+)\]$/,t=[],p=null,a=0,f=r.length;f>a;a++)p=i.exec(r[a]),t.push(p?{i:parseFloat(p[1])}:{p:r[a]});return t}function i(e,n){for(var r,i=n,t=0,a=e.length;a>t;t++){var f=e[t];i?(p(f.p)?i=i[f.p]:p(f.i)&&(i=i[f.i]),t==a-1&&(r=i)):r=void 0}return r}function t(e,n,r){for(var i,t=r,a=0,f=e.length;f>a;a++)if(i=e[a],p(t)&&a==f-1){var u=p(i.p)?i.p:i.i;t[u]=n}else if(p(t))if(p(i.p)&&t[i.p])t=t[i.p];else if(p(i.i)&&t[i.i])t=t[i.i];else{var o=e[a+1],u=p(i.p)?i.p:i.i,l=p(o.p)?{}:[];t[u]=l,t=t[u]}else a==f-1?t=n:p(i.p)?t={}:p(i.i)&&(t=[])}function p(e){return!(!e&&"undefined"==typeof e)}return{parse:r,set:n,get:e}}();
  function filterByQuery(set, properties) {
    return set.filter(function (entry) {
      return Object.keys(properties).every(function (key) {
        return similar(entry[key], properties[key])
      })
    })
  }
  function similar(v1, v2){
    return (v1+"").toLowerCase().indexOf((v2+"").toLowerCase()) != -1
  }

  function serverInfo(){return {"date": Date.now(),"server": "$httpf","connection": "close"}}
  function requestInfo(method, url, data){
    return {
      method: "POST",
      headers: {"HTTPF-HEADERS": 0},
      url: url,
      data: data
    }
  }

  this.success = function(fn){
    if (this.vals) fn.apply({}, this.vals)
    return this
  }

  this.error = function(fn){
    if (this.errs) fn.apply({}, this.errs)
    return this
  }

  this.post = function(route, data){
    var oroute = route
    try {
      if (route.slice(0, 1) === "/") route = route.slice(1)
      var path = route.split("/").join(".")
      if (path.slice(-1) === ".") {         // collection
        path = path.slice(0, -1)
        var ar = pathval.get(this.api, path)
        ar.push(data)
        data = ar
      }
      pathval.set(this.api, path, data)
      this.vals = [{ok: 1, n: 0, err: null, errmsg: null}, 200, serverInfo, requestInfo("POST", oroute, data)]
    } catch (e) {
      this.errs = [JSON.stringify(e), 400, serverInfo, requestInfo("POST", oroute, data)]
    }
    return this
  }


  this.get = function(route){
    var oroute = route,
        query  = {}                 // Init query object
    try {
      if (route.slice(-1) === "/") route = route.slice(0, -1)
      if (route.slice(0, 1) === "/") route = route.slice(1)
      if (route.indexOf("?") >= 0) {    // Check for qs
        var parts = route.split("?"),   // Split to [route, qs]
            qstr  = parts.slice(-1)[0], // Get qs
            amp   = qstr.split("&")     // Split each query
        for (var i in amp) {
          var b = amp[i].split("=")     // Split/assign k & v to query object after decode
          query[decodeURIComponent(b[0])] = decodeURIComponent(b[1])
        }
        route = parts[0] // Re-assign route variable to route without a qs
      }
      var res = pathval.get(this.api, route.split("/").join(".")) // Map route to json api
      if (Array.isArray(res) && query) {       // Collection and qs?
        if (typeof query.q === "string") {     // Check if full text search
          var newRes = []
          for (var i=0;i<res.length;i++) {     // Iterate through objects & attrs
            var ob = res[i]
            for (var k in ob) {
              if (similar(ob[k], query.q)) {   // Check if val exists, case insensitive
                newRes.push(ob)                // Break & push when match
                break
              }
            }
          }
          if (Object.keys(query).length > 1) { // Check if other qs k's & v's aside from q
            delete query.q                     // Delete q and filter by other k's & v's
            newRes = filterByQuery(newRes, query)
          }
          res = newRes
        } else if (query) {               // Else if qs, but not collection
          res = filterByQuery(res, query) // Match via qs
        }
      }
      if (!res) throw new Error(404)
      this.vals = [res, 200, serverInfo, requestInfo("GET", oroute, query)]          // Should clone query to make query.q show up here
    } catch(e) {
      this.errs = ["Not Found", 404, serverInfo, requestInfo("GET", oroute, query)]
    }
    return this
  }
}])


function log(a,b,c,d){console.log("<----- START LOG ----->");console.log(a,b);if(c||d){console.log(c||null,d||null)}console.log("<------ END LOG ------>")}
