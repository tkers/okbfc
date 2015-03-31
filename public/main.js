var placesService, directionsService;
var destinationName;
var cafeName;

function locateMe() {

  navigator.geolocation.getCurrentPosition(function (position) {
    searchForCoffee(position.coords.latitude, position.coords.longitude);
  }, function (err) {
    searchForCoffee(52.0833, 5.1167);
    document.getElementById("instructions").innerHTML = "<div class='title warn'>Unable to locate you</div>";
  });
}

function searchForCoffee(lat, lng) {

  myLocation = new google.maps.LatLng(lat, lng);

  var map = new google.maps.Map(document.getElementById("map-canvas"), {
    center: myLocation,
    zoom: 10
  });

  placesService = new google.maps.places.PlacesService(map);
  directionsService = new google.maps.DirectionsService(map);

  var searchRequest = {
    location: myLocation,
    radius: 1000,
    types: ["cafe"],
    keyword: "espresso",
    openNow: true
  };

  placesService.nearbySearch(searchRequest, foundCoffee);
}

function foundCoffee(results, status) {

  if (status == google.maps.places.PlacesServiceStatus.OK) {

    destinationName = results[0].name;

    var routeRequest = {
      origin: myLocation,
      destination: results[0].geometry.location,
      travelMode: google.maps.TravelMode.WALKING
    };

    directionsService.route(routeRequest, foundRoute);
  }
  else {
    document.getElementById("instructions").innerHTML = "<div class='title warn'>No coffee found nearby</div>";
  }
}


function foundRoute(results, status) {

  if (status == google.maps.DirectionsStatus.OK) {
    var route = results.routes[0].legs[0];
    var eta = Math.floor(route.duration.value / 60);

    var list = [];

    for (var i = 0; i < route.steps.length; i++) {
      var step = route.steps[i];
      var dist = "<i>" + step.distance.value + " m</i>";
      list.push(step.instructions + " " + dist);
    }

    document.getElementById("instructions").innerHTML = "<div class='title'>" + destinationName + " (" + eta + " minutes)</div>" + "<ul><li>" + list.join("</li><li>") + "</li></ul>";
  }
  else {
    document.getElementById("instructions").innerHTML = "<div class='title warn'>No route found to " + destinationName + "</div>";
  }
}

google.maps.event.addDomListener(window, "load", locateMe);
