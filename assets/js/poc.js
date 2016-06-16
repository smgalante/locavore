(function(window, google, mapster, $){
  //firebase connection 
  var firebase = new Firebase("https://arnoldleitestrcb.firebaseio.com/");

  //map options
  var options = mapster.MAP_DEFAULT_OPTIONS;
  //Setting the map to the div 
  var element = document.getElementById('map');
  //creating the map object
  var map = mapster.create(element, options);

  var marker = map.addMarker({
    lat: 40,
    lng: -74,
    draggable: true,
    // icon: 'https://lh6.googleusercontent.com/jKl8Ad4rBl499hBXFNh2k8lODStxrA9aLXuGMkSMNlRYuNG6ejUJ7rZ6l5rIMd5gIXiaAg=w1416-h658',
    content: 'Farmers Market',  
  });
  var request = {
    zip: '22203',
    radius: '500',
    query: 'restaurant'
  };
  function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      createMarker(results[i]);
    }
  }
}

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);


  function getResults(zip) {
      // or
      // function getResults(lat, lng) {
      $.ajax({
          type: "GET",
          contentType: "application/json; charset=utf-8",
          // submit a get request to the restful service zipSearch or locSearch.
          url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + zip,
          // or
          // url: "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/locSearch?lat=" + lat + "&lng=" + lng,
          dataType: 'jsonp',
          jsonpCallback: 'searchResultsHandler'
      }).done(function(e){
        for (var key in e) {
        console.log(e[key]);
        var results = e[key];
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            for (var key in result) {
                //only do an alert on the first search result
                if (i == 0) {
                    console.log(result[key]);
                }
            }
        }
    }
      });
  }  

  getResults(22203);


    // map._on('click', function(){console.log('click')});
    // // creates markers on click
    // map.addListener('click', function(e) {
    //   var image = 'https://lh6.googleusercontent.com/jKl8Ad4rBl499hBXFNh2k8lODStxrA9aLXuGMkSMNlRYuNG6ejUJ7rZ6l5rIMd5gIXiaAg=w1416-h658';
    //   var marker = new google.maps.Marker({
    //     position: {lat: e.latLng.lat(), lng: e.latLng.lng()},
    //     map: map,
    //     icon:'https://lh6.googleusercontent.com/jKl8Ad4rBl499hBXFNh2k8lODStxrA9aLXuGMkSMNlRYuNG6ejUJ7rZ6l5rIMd5gIXiaAg=w1416-h658',
    //   });
    //   marker.setMap(map);
    //   firebase.push({lat: e.latLng.lat(), lng: e.latLng.lng()});
    // });

    // firebase code for when the user adds something to firebase
    firebase.on("child_added", function(snapshot, prevChildKey) {
    // Get latitude and longitude from the cloud.
      var newPosition = snapshot.val();

      // Create a google.maps.LatLng object for the position of the marker.
      // A LatLng object literal (as above) could be used, but the heatmap
      // in the next step requires a google.maps.LatLng object.
      var latLng = new google.maps.LatLng(newPosition.lat, newPosition.lng);
      // Place a marker at that loc ation.
      var marker = map.addMarker({
        lat: latLng.lat(),
        lng: latLng.lng(),
        map: map,
        content: 'From FireBase! Farmers Market',
      });
    });
}(window, google, window.Mapster, $));
