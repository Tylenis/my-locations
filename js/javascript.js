var location_data = [
    {'name': 'Concert Hall', 'position': {'lat': 55.71520614624023, 'lng':21.11678695678711}},
    {'name': 'Smiltynė Beach', 'position': {'lat': 55.70393548282197, 'lng': 21.099023948507458}},
    {'name': 'Sea Museum and Dolphinarium', 'position': {'lat': 55.71792609512003, 'lng': 21.10114405105476}},
    {'name': 'Friedricho pasažo Vyninė', 'position': {'lat': 55.70679476024099, 'lng': 21.137315806407006}},
    {'name': 'Anikė square', 'position': {'lat': 55.70797200579217, 'lng': 21.13181280590801}},
    {'name': 'Meridianas Tall Ship', 'position': {'lat': 55.71020684190002, 'lng': 21.134616721326314}},
];

var AppViewModel = function(map){
    var self = this;
    self.map = map;
    self.locations = ko.observableArray(location_data);

    self.addMarkers = function(){
        self.locations().forEach(function(location){
            marker = new google.maps.Marker({position: location.position, map: self.map});
        })
    };

    self.init = function(){
        self.addMarkers();
    };

    self.init();
}

function callback(){
    // Constructor creates a new map.
    var map = new google.maps.Map(document.getElementById('map'),{
        center: {lat: 55.703297, lng: 21.144279},
        zoom: 14,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER
        },
    });
    ko.applyBindings(new AppViewModel(map));
}