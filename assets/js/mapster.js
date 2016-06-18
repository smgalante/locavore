//THis is an IIEF that I want to store all our functions in, this may not work out for our project right now 
(function(window, google){
  var Mapster = (function(){
    function Mapster(elements, options){
      this.gMap = new google.maps.Map(elements, options);
      this.markers = [];
    }
    Mapster.prototype = {
      getLocation: function(callback){
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(function(position){
            callback.call(this, position);
          })
        }
      },
      
    }
    return Mapster;
  }());

  Mapster.create = function(elements, options){
    return new Mapster(elements, options);
  };

  window.Mapster = Mapster;

}(window, google));