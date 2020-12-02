class Marker {
    constructor() {
        this.image = 'img/map-marker.svg';
        this.imageAlphaOnly = true;
        this.color = '#FEA512';
        this.location = { lat: 45.6918636, lng: -124.0965785 };
        this.hotspot = true;
        this.infobox = "heres some info";
    }

    init() {
        this.markerSettings();
    }

    markerSettings() {
        this.markerSettings = {
            image: this.image,
            imageAlphaOnly: this.imageAlphaOnly,
            color: this.color,
            location: this.location,
            hotspot: this.hotspot
        }

    }
    createSidebarLink() {
        // create a clickable link for the marker in the sidebar
    }
}
