const LOCATION_DATA = [
    {title: 'Švyturio Arena', location: {lat: 55.68745448842839, lng: 21.15200260962421}},
    {title: 'Clock and Watch Museum', location: {lat: 55.712415452967925, lng: 21.134070239354646}},
    {title: 'Smiltynė Beach', location: {lat: 55.70393548282197, lng: 21.099023948507458}},
    {title: 'Sea Museum and Dolphinarium', location: {lat: 55.71792609512003, lng: 21.10114405105476}},
    {title: '"Friedricho pasažo Vyninė" Restaurant', location: {lat: 55.70679476024099, lng: 21.137315806407006}},
    {title: 'Anikė Square', location: {lat: 55.70797200579217, lng: 21.13181280590801}},
    {title: '"Meridianas Tall Ship" restaurant', location: {lat: 55.71020684190002, lng: 21.134616721326314}}
];

const CLIENT_ID = '4ECKO5WEEW3HD03K0YOHG2HSPPRGJC1MZFFKH0N2TD5YY513';
const CLIENT_SECRET = 'QNBN5OSNQY4HAFX2IVDVESWFGRBLXX1KXQSXZANWXDB4I0AO';
const FOURSQUARE_API_URL = 'https://api.foursquare.com/v2/venues/';

const MAP_CENTER = {lat: 55.703297, lng: 21.144279};

var AppViewModel = function(map){
    let self = this;
    self.map = map;
    self.markers = [];
    self.locations = ko.observableArray([]);

    let infowindow = new google.maps.InfoWindow();

    self.init = function(){
        // Initialize app.
        self.populateLocations();
        self.initMarkers();
        self.showMarkers();
        document.getElementById('filter').addEventListener("input", self.filter);
    };

    self.populateLocations = function(){
        // Populate self.locations observable array.
        LOCATION_DATA.forEach(function(item){
            item.show = ko.observable(true);
            self.locations.push(item);
        });
    };

    self.initMarkers = function(){
        // Create list of markers.
        self.locations().forEach(function(location){
            if(location.show()){
                var marker = new google.maps.Marker({
                    position: location.location,
                    title: location.title
                });
                self.markers.push(marker);
            }
        });
    };

    self.loadImage = function(venueid){
        // Create and return jqXHR object to get image url from FourSquare API.
        let request = $.ajax({
            url: FOURSQUARE_API_URL + venueid + '/photos',
            data: {
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'limit': 1,
                'v': '20180623'
            }
        });
        return request;
    };

    self.loadAddress = function(){
        // Create and return jqXHR object to get address information from FourSquare API.
        let lat = infowindow.marker.position.lat();
        let lng = infowindow.marker.position.lng();

       let request = $.ajax({
            url: FOURSQUARE_API_URL + 'search',
            data: {
                'll': lat+','+lng,
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'limit': 1,
                'v': '20180623'
            },
            headers: {
                'Accept-Language': 'en',
            }
        });
        return request;
    };

    self.showMarkers = function(){
        // Add markers to map and center map accordingly.
        let bounds = new google.maps.LatLngBounds();
        for(var i = 0; i<self.markers.length; i++){
            self.markers[i].setMap(self.map);
            bounds.extend(self.markers[i].position);
            self.markers[i].addListener('click', function(){
                self.openInfoWindow(this);
            });
        }
        if(self.markers.length === 1){
            let marker_position = self.markers[0].position;
            self.map.setCenter(marker_position);
            self.map.setZoom(16);
        } else if(self.markers.length === 0){
            self.map.setCenter(MAP_CENTER)
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

    self.onItemClick = function(data){
        // Open infowindow on list item click. 
        for(let i = 0; i<self.markers.length; i++){
            if(self.markers[i].title==data.title){
                let marker = self.markers[i];
                self.openInfoWindow(marker);
            }
        }
    };

    self.startAnimation = function(data){
        // Start marker animation on list item mouseenter event.
        for(let i = 0; i<self.markers.length; i++){
            if(self.markers[i].title==data.title){
                let marker = self.markers[i];
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }
    };

    self.endAnimation = function(data){
        // End marker animation on list item mouseenter event.
        for(let i = 0; i<self.markers.length; i++){
            if(self.markers[i].title==data.title){
                let marker = self.markers[i];
                marker.setAnimation(null);
            }
        }
    };

    self.openInfoWindow = function(marker){
        // Open infowindow and populate it.
        let spinner = `
            <div class="spinner-container">    
                <i class="fas fa-spinner fa-spin fa-3x"></i>
            </div>`;

        let template = `
            <div class="infowindow">
                <div class="img-container">
                    ${spinner}
                </div>
                <h5 class="info-title">${marker.title}</h5>
                <div class="address">
                </div>
            </div>`;
        
        if(infowindow.marker != marker){
            infowindow.marker = marker;
            infowindow.setContent(template);
            infowindow.open(self.map, marker);

            self.loadAddress()
                .done(function(data){
                    let venue = data.response.venues[0];
                    let venueAddress = venue.location.formattedAddress.join(', ');
                    let addressElement = `<p>${venueAddress}</p>`;
                    // self.loadImage(venueId);
                    $('.address').html(addressElement);
                })
                .fail(function(error){
                    let addressElement = `<p>Sorry, couldn't get the address</p>`;
                    $('.address').html(addressElement);
                })
                .always(function(data){
                    let venue = data.response.venues[0];
                    let venueId = venue.id;
                    self.loadImage(venueId)
                        .done(function(data){
                            let photoObj = data.response.photos.items[0]
                            let photoUrl = photoObj.prefix +'320x192'+ photoObj.suffix
                            let imgElement = `<img src="${photoUrl}">`;
                            $('.spinner-container').remove();
                            $('.img-container').html(imgElement);
                        })
                        .fail(function(error){
                            $('.spinner-container').remove();
                            $('.img-container').html(`<p class="img-error">Sorry, couldn't get the photo.</p>`);
                        });
                });

            infowindow.addListener('closeclick', function(){
                infowindow.marker = null;
            });
        }
    };

    self.filter = function(){
        // Filter out list and markers.
        let expression = new RegExp(this.value, 'i');
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
    let map = new google.maps.Map(document.getElementById('map'),{
        center: MAP_CENTER,
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
    let text = '<h3 id="error-msg">Sorry, we couldn\'t load the map.</h3>';
    let parent = document.getElementById('map');
    parent.innerHTML = text;
};
