(function(window, google, mapster, $) {

    var marketId = []; //returned from the API
    var allLatlng = []; //returned from the API
    var allMarkers = []; //returned from the API
    var marketName = []; //returned from the API
    var pos;
    var userCords;
    var tempMarkerHolder = [];

    var element = document.getElementById('map');
    var options = mapster.MAP_DEFAULT_OPTIONS

    var map = new google.maps.Map(element, options);
    var location = new google.maps.LatLng(40.4794355, -74.4196301);
    var service = new google.maps.places.PlacesService(map);

    var request = {
        location: location,
        radius: '5000',
        types: ['farmers market']
    };

    var infowindow = new google.maps.InfoWindow();
   //  var input = document.getElementById('pac-input');
   //  var autocomplete = new google.maps.places.Autocomplete(input);
  	// autocomplete.bindTo('bounds', map);


    $('#search').submit(function() {
        var search = $('#userSearch').val();
        var url = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + search;
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: url,
            dataType: 'jsonp',
            success: function(data) {
                var i = 0;
                for (; i < data.results.length; i++) {
                    marketId.push(data.results[i].id);
                    marketName.push(data.results[i].marketname);
                }
            }
        }).done(function(f){
        	var i=0;
        	for (; i<marketId.length; i++){
        		$.ajax({
        			type: 'GET',
        			contentType: 'application/json; charset=utf-8',
        			url: 'http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=' + marketId[i],
        			dataType: 'jsonp',
        			success: function(data){
        				for(var k in data){
        					var results = data[k].GoogleLink;
        					var latLong = decodeURIComponent(results.substring(results.indexOf("=")+1, results.lastIndexOf("(")));
        					var split = latLong.split(',');
        					var latitude = parseFloat(split[0]);
							var longitude = parseFloat(split[1]);
							myLatlng = new google.maps.LatLng(latitude,longitude);
							allMarkers = new google.maps.Marker({
								position: myLatlng,
								map: map,
								title: marketName[i],
							})
        				}
        			},
        			dataType: 'jsonp',
        		});
        	}
        });

        return false;
    });

    function createMarker(place) {
        var placeLoc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(place.name);
            infowindow.open(map, this);
            $('#picture').html(place.image)
        });
    }

    service.nearbySearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
                console.log(results[i])
            }
        }
    });



}(window, google, window.Mapster, window.$));
