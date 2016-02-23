var myLocation;

var map, placesService, directionsService;

var Status = { OK: "", LOADING: "busy", WARNING: "warn" };
function setStatus(message, classname) {
    document.getElementById("status").innerHTML = "<div class='title " + classname + "'>" + message + "</div>";
}

function init () {
    map = new google.maps.Map(document.getElementById("map-canvas"), {
      center: new google.maps.LatLng(0, 0),
      zoom: 15
    });

    placesService = new google.maps.places.PlacesService(map);
    directionsService = new google.maps.DirectionsService(map);

    locateMe();
}

function locateMe() {

  setStatus("Locating you...", Status.LOADING);

  navigator.geolocation.getCurrentPosition(function (position) {
    foundMe(position.coords.latitude, position.coords.longitude);
  }, function (err) {
    setStatus("Unable to locate you", Status.WARNING);
  });
}

function foundMe(lat, lng) {

  myLocation = new google.maps.LatLng(lat, lng);

  var searchRequest = {
    location: myLocation,
    rankBy: google.maps.places.RankBy.DISTANCE,
    types: ["cafe"],
    keyword: "espresso",
    openNow: true
  };

  setStatus("Finding coffee...", Status.LOADING);
  placesService.nearbySearch(searchRequest, foundCoffee);
}

function foundCoffee(results, status) {

  if (status !== google.maps.places.PlacesServiceStatus.OK) {
    return setStatus("No coffee found nearby", Status.WARNING);
  }

  for (var i = 0; i < results.length; i++) {
    addMarker(results[i]);
  }

  map.setCenter(myLocation);
  document.getElementById("map-canvas").style.marginTop = "0";

  searchRoute(results[0]);
}

function addMarker(cafe) {
  var cafeMarker = new google.maps.Marker({
    position: cafe.geometry.location,
    map: map
  });
  google.maps.event.addListener(cafeMarker, "click", function () {
      searchRoute(cafe);
  });
}

function searchRoute(destination) {

  setStatus(destination.name + " (navigating)...", Status.LOADING);

  var routeRequest = {
    origin: myLocation,
    destination: destination.geometry.location,
    travelMode: google.maps.TravelMode.WALKING
  };

  directionsService.route(routeRequest, function (result, status) {
    foundRoute(destination.name, result, status)
  });
}

function foundRoute(cafeName, result, status) {

  if (status !== google.maps.DirectionsStatus.OK) {
    return setStatus("No route found to " + cafeName, Status.WARNING);
  }

  var route = result.routes[0].legs[0];
  var eta = Math.floor(route.duration.value / 60);

  var list = route.steps.map(function(step) {
    var icon = step.maneuver ? "<div class='adp-maneuver adp-" + step.maneuver + "'>&nbsp;</div>" : "";
    var dist = "<i>" + Math.round(step.distance.value / 50) * 50 + " m</i>";
    return icon + step.instructions + " " + dist;
  });

  list.push("☕ omnomnom");

  setStatus(cafeName + " <i>" + eta + " minutes</i>", Status.OK);
  document.getElementById("instructions").innerHTML = "<ul><li>" + list.join("</li><li>") + "</li></ul>";
}

google.maps.event.addDomListener(window, "load", init);
