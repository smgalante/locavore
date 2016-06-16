
(function(window, google, mapster){

  mapster.MAP_DEFAULT_OPTIONS = {
    center: {
      lat: 40, 
      lng: -74
    },
    disableDefaultUI: true,
    zoom: 8,
    scrollwheel: true,
    styles: [{
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]  // Turn off points of interest.
    }, 
    {
      featureType: 'transit.station',
      stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
    }],
    disableDoubleClickZoom: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.DEFAULT,
    }
  };

})(window, google, window.Mapster);