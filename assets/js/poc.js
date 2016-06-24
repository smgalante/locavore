(function(window, google, mapster, $, Skycons) {
    $(window).load(function(){
        $('#welcomeModal').modal('show');
    })


    var crd; //user coordinates
    var FORECAST_URL = 'https://api.forecast.io/forecast/';
    var FORECAST_API = 'e5f3060a8bf3ccb2d4c8b46edd003429';

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        crd = pos.coords;

        // console.log('Your current position is:');
        // console.log(crd)
        // console.log('Latitude : ' + crd.latitude);
        // console.log('Longitude: ' + crd.longitude);
        // console.log('More or less ' + crd.accuracy + ' meters.');
    };

    function error(err) {
        // console.warn('ERROR(' + err.code + '): ' + err.message);
    };


    

    var marketId = []; //returned from the API
    var allLatlng = []; //returned from the API
    var allMarkers = []; //returned from the API
    var marketName = []; //returned from the API
    var date; //Returned from Date form
    var pos;
    var userCords;
    var postal; //the code that we will be doing the search with 
    // var days = ['Mon', 'Tues', 'Weds', 'Thurs', 'Fri', 'Sat', 'Sun'];

    

    var element = document.getElementById('map');
    var options = mapster.MAP_DEFAULT_OPTIONS

    var map = new google.maps.Map(element, options);
    var service = new google.maps.places.PlacesService(map);
    var geocoder = new google.maps.Geocoder();
    var skycons = new Skycons({ "color": "#4C9D2F" });
    skycons.add(document.getElementById('icon2'), Skycons.PARTLY_CLOUDY_DAY);
    skycons.play();

    if (crd) {
        map.setCenter({ lat: crd.latitude, lng: crd.longitude })
    }



    var request = {
        location: location,
        radius: '5000',
        types: ['']
    };

    // var temp = $('#temp')
    // var percipitation = $('#percipitation');
    // var humidity = $('#humidity');
    // var wind = $('#wind');
    // // $('#report').text(weatherData.daily.summary)
    var modal_title = $('.modal-title');
    var modal_address = $('#address');
    var modal_schedule = $('#schedule');
    var modal_produce = $('#produce');


    var infowindow = new google.maps.InfoWindow();
    var input = document.getElementById('pac-input');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    $('#currentLocation').on('click', function(){
        return false;
    })


    $('#search').submit(function() {
        geocodeAddress(geocoder, map, function(postal) {

            var url = "http://search.ams.usda.gov/farmersmarkets/v1/data.svc/zipSearch?zip=" + postal;

            if ($('#date').val()) {
                date = $('#date').val().trim();
            } else {
                date = moment().format('DD-MM-YYYY');
            }
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
                for (var i = 0; i < marketId.length; i++) {
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
                                var schedule = data[k].Schedule;
                                //figure out if it is open here:
                                var name = marketName[x];
                                var id = x
                                if (schedule.trim() == '<br> <br> <br>') {
                                    iconMarker = 'assets/img/mapicons/farmstand_blue.png'
                                } else {
                                    if (new RegExp(moment(date, 'DD-MM-YYYY').format('ddd').toString().toLowerCase()).test(schedule.toString().toLowerCase())) {
                                        iconMarker = 'assets/img/mapicons/farmstand.png';
                                    } else {
                                        iconMarker = 'assets/img/mapicons/farmstand_red.png'
                                    }
                                }

                                var produce = data[k].Products
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
                                    title: name,
                                    icon: iconMarker,
                                    text: name,
                                    optimized: false,
                                });
                                //Where all the onclick should go for the modals
                                var key = 'e5f3060a8bf3ccb2d4c8b46edd003429'
                                google.maps.event.addListener(allMarkers, 'click', function() {

                                    var weatherData;
                                    fetchWeather(latitude, longitude, function(weatherData) {
                                        if(date == moment().format('DD-MM-YYYY')){
                                            skycons.set(document.getElementById('icon2'), weatherData.currently.icon);
                                            skycons.play();
                                            $('#temp').html(weatherData.currently.temperature+ '&deg');
                                            $('#percipitation').text((weatherData.daily.data[0].precipProbability * 100) + '%');
                                            $('#humidity').text(Math.floor(weatherData.daily.data[0].humidity * 100) + '%');
                                            $('#wind').text(round(weatherData.currently.windSpeed) + ' kts', 1000);
                                            // $('#report').text(weatherData.daily.summary)
                                            modal_title.text(name);
                                            modal_address.text(address);
                                            modal_schedule.html(schedule);
                                            modal_produce.text(produce);
                                            $('#myModal').modal('show');

                                        } else {
                                            var i = moment(date.toString(), 'DD-MM-YYYY').format('d');
                                            var obj = weatherData.daily.data[i];                                                
                                            $('#temp').html('<h1>'+ obj.apparentTemperatureMin + '&deg' + ' - ' + obj.apparentTemperatureMax+ '&deg </h1>');
                                            $('#percipitation').text(obj.precipProbability + '%');
                                            $('#humidity').text(Math.floor(obj.humidity * 100) + '%');
                                            $('#wind').text(round(obj.windSpeed) + ' kts', 1000);
                                            $('#report').text(weatherData.daily.summary)
                                            modal_title.text(name);
                                            modal_address.text(address);
                                            modal_schedule.html(schedule);
                                            modal_produce.text(produce);
                                            $('#myModal').modal('show');
                                        }


                                        infowindow.setContent(address);
                                        infowindow.open(map, this);


                                    });

                                })

                                x++;
                            }
                        },
                        dataType: 'jsonp',
                    })

                }
            });

        });

        return false;
    });
    skycons.add(document.getElementById("icon1"), Skycons.CLEAR_DAY);
    skycons.play();

    function geocodeAddress(geocoder, resultsMap, callback) {
        var address = document.getElementById('userSearch').value;
        if(crd && address == ''){
            var latlng = {lat: crd.latitude, lng: crd.longitude};
            geocoder.geocode({'location': latlng}, function(results, status) {
                resultsMap.setCenter(results[0].geometry.location);
                resultsMap.setZoom(11);
                geocoder.geocode({'location': results[0].geometry.location }, function(zip, status){
                    for (var x = 0; x < zip.length; ++x){
                        if (zip[x].types[0] == "postal_code") {
                            postal = zip[x].address_components[0].long_name;
                        }
                    }
                    callback(postal);
                });
            })
        }else{

            geocoder.geocode({ 'address': address,  }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    resultsMap.setCenter(results[0].geometry.location);
                    resultsMap.setZoom(11);
                    geocoder.geocode({ 'location': results[0].geometry.location }, function(zip, status) {
                        for (var x = 0; x < zip.length; ++x) {
                            if (zip[x].types[0] == "postal_code") {
                                postal = zip[x].address_components[0].long_name;
                            }
                        }
                        callback(postal);
                    });
                } else {
                    bootbox.alert({
                        title: 'No correct results were found: ',
                        message: 'Please enter a valid address or zipcode'
                    });
                }
            });
        }
    }


    $('#date').datepicker({
        format: "dd-mm-yyyy",
        defaultViewDate: 'today',
        statDate: '0d',
        endDate: '+7d'
    });

    function fetchWeather(latitude, longitude, callback) {

        $.ajax({
            url: FORECAST_URL + FORECAST_API + '/' + latitude + ',' + longitude + "?units=auto",
            dataType: "jsonp",
            success: function(weather) {
                weatherData = weather;
                callback(weatherData);
            }
        });

    }

    function clock(){
        var time = moment().format('hh:mm:ss a');
        $('#currentTime').text(time);
        setTimeout(clock, 1000);
    }

    clock();

}(window, google, window.Mapster, window.$, Skycons));
