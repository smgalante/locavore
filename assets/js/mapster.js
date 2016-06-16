
(function(window, google){
  var Mapster = (function(){
    function Mapster(elements, options){
      this.gMap = new google.maps.Map(elements, options);
      this.markers = [];
    }
    Mapster.prototype = {
      zoom: function(level){
        if(level){
          this.gMap.setZoom(level);
        }else {
          return this.gMap.getZoom();
        }
      },
      addListener: function(event, callback){
        this.gMap.addListener(event, callback);      
      },
      _on: function(opts){
        var self = this;
        google.maps.event.addListener(opts.obj, opts.event, function(e){
          opts.callback.call(self, e);
        });
      },
      addMarker: function(opts){
        var marker;
        opts.position = {lat: opts.lat, lng: opts.lng },
        marker = this._createMarker(opts);
        this._addMarker(marker);
        if(opts.event){
          this._on({
            obj: marker,
            event: opts.event.name,
            callback: opts.event.callback,
          });
        }
        if(opts.content){
          this._on({
            obj: marker,
            event: 'click',
            callback: function(){
              var infoWindow = new google.maps.InfoWindow({
                content: opts.content,
              });

            infoWindow.open(this.gMap, marker);
            }
          })
        }
        return marker;
      },
      _addMarker: function(marker){
        this.markers.push(marker) 
      },
      _removeMarker: function(marker){
        var indexOf = this.markers.indexOf(marker);
        if(indexOf !== -1) {
          this.markers.splice(indexOf, 1);
        }
      },
      findMarkerByLat: function(){
        var i=0; 
        for(; i < this.markers.length; i++){
          var maker = this.marker[i];
          if (marker.position.lat() == lat){
            return marker
          }
        }
      },
      _createMarker: function(opts){
        opts.map = this.gMap;
        return new google.maps.Marker(opts)
      }
    };
    return Mapster;
  }());

  Mapster.create = function(elements, options){
    return new Mapster(elements, options);
  };

  window.Mapster = Mapster;

}(window, google));