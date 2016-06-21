(function(window, google, mapster, $, farm) {

    var marketId = []; //returned from the API
    var allLatlng = []; //returned from the API
    var allMarkers = []; //returned from the API
    var marketName = []; //returned from the API
    var date; //Returned from Date form
    var pos;
    var userCords;
    var postal; //the code that we will be doing the search with 

    var element = document.getElementById('map');
    var options = mapster.MAP_DEFAULT_OPTIONS

    var map = new google.maps.Map(element, options);
    var service = new google.maps.places.PlacesService(map);

    var request = {
        location: location,
        radius: '5000',
        types: ['']
    };

    var geocoder = new google.maps.Geocoder();

    var infowindow = new google.maps.InfoWindow();
    var input = document.getElementById('pac-input');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);


    $('#search').submit(function() {
        // var search = $('#userSearch').val().trim();
        geocodeAddress(geocoder, map);
        // postal = geocodeAddress(geocoder, map);
        console.log(postal);
        // console.log(postal);
        //AMS Farmers Market Directory API URL 
        var url = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + postal;
        date = $('#date').val();
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
        }).done(function(f) {
            var x = 0; //A counter for iterating through the arrays
            var i = 0;
            for (; i < marketId.length; i++) {
                $.ajax({
                    type: 'GET',
                    contentType: 'application/json; charset=utf-8',
                    //another AJAX call using the market ID's from the first AJAX call 
                    //The Farmers Directory API does not have the farmers market lat lng openly available 
                    url: 'http://search.ams.usda.gov/farmersmarkets/v1/data.svc/mktDetail?id=' + marketId[i],
                    dataType: 'jsonp',
                    success: function(data) {
                        for (var k in data) {
                            //The lat lng is embedded in the google linke found in the json object
                            //The lat lng must be parsed from the link provided
                            var results = data[k].GoogleLink;
                            var address = data[k].Address;
                            var latLong = decodeURIComponent(results.substring(results.indexOf("=") + 1, results.lastIndexOf("(")));
                            var split = latLong.split(',');
                            //Latitude and Longitude is stored here: 
                            var latitude = parseFloat(split[0]);
                            var longitude = parseFloat(split[1]);
                            //this is used for the google API request
                            myLatlng = new google.maps.LatLng(latitude, longitude);
                            allMarkers = new google.maps.Marker({
                                position: myLatlng,
                                map: map,
                                title: marketName[x],
                                icon: 'assets/img/mapicons/farmstand.png'
                            });
                            //Where all the onclick should go for the modals
                            google.maps.event.addListener(allMarkers, 'click', function() {
                                infowindow.setContent(address);
                                infowindow.open(map, this);
                            })

                            x++;
                        }
                    },
                    dataType: 'jsonp',
                })

            }
        });
        console.log('WHy is this happening first?')
        console.log(marketId);
        console.log(allLatlng);
        console.log(allMarkers);

        return false;
    });



    function geocodeAddress(geocoder, resultsMap) {
        var address = document.getElementById('userSearch').value;
        geocoder.geocode({ 'address': address }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                resultsMap.setCenter(results[0].geometry.location);
                resultsMap.setZoom(11);
                geocoder.geocode({ 'location': results[0].geometry.location }, function(zip, status) {
                    for (var x = 0; x < zip.length; ++x) {
                        if (zip[x].types[0] == "postal_code") {
                            postal = zip[x].address_components[0].long_name;
                        }
                    }
                })
            } else {
                bootbox.alert({
                    title: 'Geocode was not successful for the following reason: ',
                    message: status
                });
            }
        });
        console.log(postal)
        return postal;
        // return postal;
    }

    $('#date').datepicker({
        format: "dd/mm/yyyy"
    });



}(window, google, window.Mapster, window.$));
