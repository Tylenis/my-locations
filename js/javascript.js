const LOCATION_DATA = [
    {title: 'Švyturio Arena', location: {lat: 55.68745448842839, lng: 21.15200260962421}},
    {title: 'Clock and Watch Museum', location: {lat: 55.712415452967925, lng: 21.134070239354646}},
    {title: 'Smiltynė Beach', location: {lat: 55.70393548282197, lng: 21.099023948507458}},
    {title: 'Sea Museum and Dolphinarium', location: {lat: 55.71792609512003, lng: 21.10114405105476}},
    {title: '"Friedricho pasažo Vyninė" Restaurant', location: {lat: 55.70679476024099, lng: 21.137315806407006}},
    {title: 'Anikė Square', location: {lat: 55.70797200579217, lng: 21.13181280590801}},
    {title: '"Meridianas Tall Ship" restaurant', location: {lat: 55.71020684190002, lng: 21.134616721326314}}
];

const MAP_CENTER = {lat: 55.703297, lng: 21.144279};
const MAP_STYLES = {
    night: [ 
        { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] },
        { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] },
        { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] },
        { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] },
        { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] },
        { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] },
        { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] },
        { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] },
        { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] },
        { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] },
        { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] },
        { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] },
        { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] },
        { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] },
        { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] },
        { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] },
        { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] },
        { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ],
    day: []
}

const CLIENT_ID = '4ECKO5WEEW3HD03K0YOHG2HSPPRGJC1MZFFKH0N2TD5YY513';
const CLIENT_SECRET = 'QNBN5OSNQY4HAFX2IVDVESWFGRBLXX1KXQSXZANWXDB4I0AO';

const FOURSQUARE_API_URL = 'https://api.foursquare.com/v2/venues/';

const AJAX_SERVICES = {
    loadImage: async function(venueId){
        let url = `${FOURSQUARE_API_URL}${venueId}/photos?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&limit=1&v=20180702`;
        let response;
        await fetch(url).then(
            data => response = data.json()
        ).catch(
            error => response = error
        )
        return response;
    },
    loadAddress: async function(infowindow){
        let lat = infowindow.marker.position.lat();
        let lng = infowindow.marker.position.lng();
        let response;
        let url = `${FOURSQUARE_API_URL}search?ll=${lat},${lng}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&limit=1&v=20180702`;
        await fetch(url, {headers: {'Accept-Language': 'en',}}).then(
            data => response=data.json()
        ).catch(
            error => response = error
        )
        return response;
    }
}

class MapObj {
    constructor(map){
        this.map = map;
        this.markers = [];
        this.infowindow = new google.maps.InfoWindow();
    }

    initMarkers(locations){
        // Create list of markers.
        locations().forEach(location => {
            if(location.show()){
                var marker = new google.maps.Marker({
                    position: location.location,
                    title: location.title
                });
                this.markers.push(marker);
            }
        });
    }

    showMarkers(){
        // Add markers to map and center map accordingly.
        let bounds = new google.maps.LatLngBounds();
        this.markers.forEach(marker => {
            marker.setMap(this.map);
            bounds.extend(marker.position);
            marker.addListener('click', () => {
                this.openInfoWindow(marker);
            });
        })
        if(this.markers.length === 1){
            let marker_position = this.markers[0].position;
            this.map.setCenter(marker_position);
            this.map.setZoom(16);
        } else if(this.markers.length === 0){
            this.map.setCenter(MAP_CENTER)
            this.map.setZoom(14);
        } else{
            this.map.fitBounds(bounds);
        }
    }

    removeMarkers(){
        // Delete markers.
        for(var i = 0; i<this.markers.length; i++){
            this.markers[i].setMap(null);
        }
        this.markers = [];
    }

    setMapMode(value){
        // Set map style.
        let styledMapType;
        if(value){
            styledMapType = new google.maps.StyledMapType(MAP_STYLES.night);
        } else{
            styledMapType = new google.maps.StyledMapType(MAP_STYLES.day);
        }
        this.map.mapTypes.set('styled_map', styledMapType);
        this.map.setMapTypeId('styled_map');

    }

    getActiveMarker(data){
        // Get active marker.
        let marker;
        for(let i = 0; i<this.markers.length; i++){
            if(this.markers[i].title==data.title){
                marker = this.markers[i];
            }
        }
        return marker;
    }

    animationStart(data){
        // Set marker animation.
        let marker = this.getActiveMarker(data);
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    animationEnd(data){
        // Remove marker animation.
        let marker = this.getActiveMarker(data);
        marker.setAnimation(null);
    }

    async openInfoWindow(marker){
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
        
        if(this.infowindow.marker != marker){
            let venueId;
            this.infowindow.marker = marker;
            this.infowindow.setContent(template);
            this.infowindow.open(this.map, marker);

            let addressData = await AJAX_SERVICES.loadAddress(this.infowindow);
            if( addressData.meta.code==200 ){
                let venue = addressData.response.venues[0];
                venueId = venue.id;
                let venueAddress = venue.location.formattedAddress.join(', ');
                let addressElement = `<p>${venueAddress}</p>`;
                $('.address').html(addressElement);
            } else {
                let addressElement = `<p>Sorry, couldn't get the address</p>`;
                $('.address').html(addressElement);
            }
            let imageData = await AJAX_SERVICES.loadImage(venueId);
            if(imageData.meta.code == 200){
                let photoObj = imageData.response.photos.items[0];
                let photoUrl = photoObj.prefix +'320x192'+ photoObj.suffix;
                let imgElement = `<img src="${photoUrl}">`;
                $('.spinner-container').remove();
                $('.img-container').html(imgElement);
            } else {
                $('.spinner-container').remove();
                $('.img-container').html(`<p class="img-error">Sorry, couldn't get the photo.</p>`);
            }

            this.infowindow.addListener('closeclick', () => {
                this.infowindow.marker = null;
            });
        }
    }
}

let AppViewModel = function(map){
    let self = this;
    self.map = map;

    self.locations = ko.observableArray([]);
    self.checked = ko.observable(false);

    self.init = () => {
        // Initialize app.
        self.populateLocations();
        self.map.initMarkers(self.locations);
        self.map.showMarkers();
        document.getElementById('filter').addEventListener("input", self.filter);
        self.checked.subscribe(value => {
            self.map.setMapMode(value);
        });
    };

    self.populateLocations = () => {
        // Populate self.locations observable array.
        LOCATION_DATA.forEach(item => {
            item.show = ko.observable(true);
            self.locations.push(item);
        });
    };
    
    self.onItemClick = data => {
        // Handle locations list item click event. 
        let marker = self.map.getActiveMarker(data);
        self.map.openInfoWindow(marker);
    };

    self.startAnimation = data => {
        // Handle mouseenter event.
        self.map.animationStart(data);
    };

    self.endAnimation = data => {
        // Handle mouseout event.
        self.map.animationEnd(data);
    };

    self.filter = function(){
        // Filter out list and markers.
        let expression = new RegExp(this.value, 'i');
        self.locations().forEach(item => {
            if(expression.test(item.title)){
                item.show(true);
            } else{
                item.show(false);
            }
        });
        self.map.removeMarkers();
        self.map.initMarkers(self.locations);
        self.map.showMarkers();
    };

    self.init();
}

function googleSuccess(){
    // Create a new map.
    let googleMap = new google.maps.Map(document.getElementById('map'),{
        center: MAP_CENTER,
        zoom: 14,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.TOP_CENTER
        },
    });
    let Map = new MapObj(googleMap);
    ko.applyBindings(new AppViewModel(Map));
};

function googleError(){
    let text = '<h3 id="error-msg">Sorry, we couldn\'t load the map.</h3>';
    let parent = document.getElementById('map');
    parent.innerHTML = text;
};
