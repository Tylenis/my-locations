var location_data = [
    {title: 'Švyturio Arena', location: {lat: 55.68745448842839, lng: 21.15200260962421}},
    {title: 'Clock and Watch Museum', location: {lat: 55.712415452967925, lng: 21.134070239354646}},
    {title: 'Smiltynė Beach', location: {lat: 55.70393548282197, lng: 21.099023948507458}},
    {title: 'Sea Museum and Dolphinarium', location: {lat: 55.71792609512003, lng: 21.10114405105476}},
    {title: '"Friedricho pasažo Vyninė" Restaurant', location: {lat: 55.70679476024099, lng: 21.137315806407006}},
    {title: 'Anikė Square', location: {lat: 55.70797200579217, lng: 21.13181280590801}},
    {title: '"Meridianas Tall Ship" restaurant', location: {lat: 55.71020684190002, lng: 21.134616721326314}}
];

var map_center = {lat: 55.703297, lng: 21.144279};

var AppViewModel = function(map){
    var self = this;
    self.map = map;
    self.markers = [];
    self.locations = ko.observableArray([]);

    self.init = function(){
        // Initialize app.
        self.populateLocations();
        self.initMarkers();
        self.showMarkers();
        document.getElementById('filter').addEventListener("input", self.filter);
    };

    self.populateLocations = function(){
        // Populate self.locations observable array.
        location_data.forEach(function(item){
            item.show = ko.observable(true);
            self.locations.push(item);
        });
    };

    self.initMarkers = function(){
        // Create list of markers.
        self.locations().forEach(function(location){
            if(location.show()){
                var marker = new google.maps.Marker({position: location.location});
                self.markers.push(marker);
            }
        });
    };

    self.showMarkers = function(){
        // Add markers to map and center map accordingly.
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0; i<self.markers.length; i++){
            self.markers[i].setMap(self.map);
            bounds.extend(self.markers[i].position);
        }
        if(self.markers.length === 1){
            var marker_position = self.markers[0].position;
            self.map.setCenter(marker_position);
            self.map.setZoom(16);
        } else if(self.markers.length === 0){
            self.map.setCenter(map_center)
            self.map.setZoom(14);
        } else{
            self.map.fitBounds(bounds);
        }
    };

    self.removeMarkers = function(){
        // Delete markers.
        for(var i = 0; i<self.markers.length; i++){
            self.markers[i].setMap(null);
        }
        self.markers = [];
    };

    self.filter = function(){
        // Filter out list and markers.
        var expression = new RegExp(this.value, 'i');
        self.locations().forEach(function(item){
            if(expression.test(item.title)){
                item.show(true);
            } else{
                item.show(false);
            }
        });
        self.removeMarkers();
        self.initMarkers();
        self.showMarkers();
    };

    self.init();
}

function googleSuccess(){
    // Create a new map.
    var map = new google.maps.Map(document.getElementById('map'),{
        center: map_center,
        zoom: 14,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER
        },
    });

    ko.applyBindings(new AppViewModel(map));
};

function googleError(){
    var text = '<h3 id="error-msg">Sorry, we couldn\'t load the map.</h3>';
    var parent = document.getElementById('map');
    parent.innerHTML = text;
};