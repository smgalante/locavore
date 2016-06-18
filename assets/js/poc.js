(function(window, google, mapster, $) {

    var marketId = []; //returned from the API
    var allLatlng = []; //returned from the API
    var allMarkers = []; //returned from the API
    var marketName = []; //returned from the API
    var pos;
    var userCords;

    var element = document.getElementById('map');
    var options = mapster.MAP_DEFAULT_OPTIONS

    var map = new google.maps.Map(element, options);
    // var location = new google.maps.LatLng(40.4794355, -74.4196301);
    var service = new google.maps.places.PlacesService(map);

    var request = {
        location: location,
        radius: '5000',
        types: ['farmers market']
    };

    var infowindow = new google.maps.InfoWindow();
    var input = document.getElementById('pac-input');
    var autocomplete = new google.maps.places.Autocomplete(input);
  	autocomplete.bindTo('bounds', map);


    $('#search').submit(function() {
        var search = $('#userSearch').val();
        //AMS Farmers Market Directory API URL 
        var url = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + search;
        $.ajax({
            type: "GET",
            contentType: "application/json; charset=utf-8",
            url: url,
            dataType: 'jsonp',
            //This function is called when the ajax call is successful
            success: function(data) {
                var i = 0;
                for (; i < data.results.length; i++) {
                	//pushing market name and ID to the arrays decalred above
                    marketId.push(data.results[i].id);
                    marketName.push(data.results[i].marketname);
                }
            }
        }).done(function(f){
        	var x=0; //A counter for iterating through the arrays
        	var i=0;
        	for (; i<marketId.length; i++){
        		$.ajax({
        			type: 'GET',
        			contentType: 'application/json; charset=utf-8',
        			//another AJAX call using the market ID's from the first AJAX call 
        			//The Farmers Directory API does not have the farmers market lat lng openly available 
        			url: 'http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=' + marketId[i],
        			dataType: 'jsonp',
        			success: function(data){
        				for(var k in data){
        					//The lat lng is embedded in the google linke found in the json object
        					//The lat lng must be parsed from the link provided
        					var results = data[k].GoogleLink;
        					var address = data[k].Address;
        					var latLong = decodeURIComponent(results.substring(results.indexOf("=")+1, results.lastIndexOf("(")));
        					var split = latLong.split(',');
        					//Latitude and Longitude is stored here: 
        					var latitude = parseFloat(split[0]);
							var longitude = parseFloat(split[1]);
							//this is used for the google API request
							myLatlng = new google.maps.LatLng(latitude,longitude);
							allMarkers = new google.maps.Marker({
								position: myLatlng,
								map: map,
								title: marketName[x],
							});	
							//Where all the onclick should go for the modals
							google.maps.event.addListener(allMarkers, 'click', function(){
									infowindow.setContent(address);
									infowindow.open(map, this);
							}) 
							console.log(i);	
							x++;        				}
        			},
        			dataType: 'jsonp',
        		})	
        	}
        }).done(function(f){
        	console.log(f);
        });
        return false;
    });

    // function createMarker(place) {
    //     var placeLoc = place.geometry.location;
    //     var marker = new google.maps.Marker({
    //         map: map,
    //         position: place.geometry.location
    //     });

    //     google.maps.event.addListener(marker, 'click', function() {
    //         infowindow.setContent(place.name);
    //         infowindow.open(map, this);
    //         $('#picture').html(place.image)
    //     });
    // }

    // service.nearbySearch(request, function(results, status) {
    //     if (status == google.maps.places.PlacesServiceStatus.OK) {
    //         for (var i = 0; i < results.length; i++) {
    //             createMarker(results[i]);
    //             console.log(results[i])
    //         }
    //     }
    // });



}(window, google, window.Mapster, window.$));
