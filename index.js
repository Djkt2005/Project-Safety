let map;
let markers = [];
let activeInfoWindow = null;
let markingEnabled = false;

function initMap() {
    // Set default location - you can change these coordinates
    const defaultLocation = { lat: 28.679079, lng: 77.069710 }; // San Francisco
    
    // Create map with dark mode styling
    map = new google.maps.Map(document.getElementById("google-map"), {
        center: defaultLocation,
        zoom: 13,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
                featureType: "administrative.locality",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#263c3f" }],
            },
            {
                featureType: "poi.park",
                elementType: "labels.text.fill",
                stylers: [{ color: "#6b9a76" }],
            },
            {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#38414e" }],
            },
            {
                featureType: "road",
                elementType: "geometry.stroke",
                stylers: [{ color: "#212a37" }],
            },
            {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca5b3" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry",
                stylers: [{ color: "#746855" }],
            },
            {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [{ color: "#1f2835" }],
            },
            {
                featureType: "road.highway",
                elementType: "labels.text.fill",
                stylers: [{ color: "#f3d19c" }],
            },
            {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#2f3948" }],
            },
            {
                featureType: "transit.station",
                elementType: "labels.text.fill",
                stylers: [{ color: "#d59563" }],
            },
            {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#17263c" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.fill",
                stylers: [{ color: "#515c6d" }],
            },
            {
                featureType: "water",
                elementType: "labels.text.stroke",
                stylers: [{ color: "#17263c" }],
            },
        ],
    });
    
    // Initialize click events for marking locations
    setupMapEvents();
    
    // Initialize control buttons
    setupControlButtons();
    
    // SOS button functionality
    document.querySelector('.sos-button').addEventListener('click', function() {
        alert('Emergency alert triggered!');
        // Here you would add your emergency alert functionality
    });
}

function setupMapEvents() {
    // Add click event to map for marking locations
    map.addListener('click', function(event) {
        if (markingEnabled) {
            // Display location info panel
            const locationInfo = document.getElementById('location-info');
            locationInfo.classList.add('active');
            
            // Update selected coordinates
            const selectedLatLng = document.getElementById('selected-lat-lng');
            selectedLatLng.textContent = `Latitude: ${event.latLng.lat().toFixed(6)}, Longitude: ${event.latLng.lng().toFixed(6)}`;
            
            // Store temporary marker
            placeMarker(event.latLng);
        }
    });
}

function setupControlButtons() {
    // Mark location button
    document.getElementById('mark-location').addEventListener('click', function() {
        markingEnabled = !markingEnabled;
        this.classList.toggle('active');
        this.innerHTML = markingEnabled ? 
            '<i class="fa-solid fa-map-pin"></i> Click on Map' : 
            '<i class="fa-solid fa-map-pin"></i> Mark Location';
        
        // Change cursor to indicate marking mode
        map.setOptions({
            draggableCursor: markingEnabled ? 'crosshair' : 'grab'
        });
    });
    
    // Clear markers button
    document.getElementById('clear-markers').addEventListener('click', function() {
        clearMarkers();
        document.getElementById('saved-locations').innerHTML = '';
        const locationInfo = document.getElementById('location-info');
        locationInfo.classList.remove('active');
    });
    
    // Save location button
    document.getElementById('save-location').addEventListener('click', function() {
        const locationName = document.getElementById('location-name').value;
        if (locationName && markers.length > 0) {
            const latestMarker = markers[markers.length - 1];
            const position = latestMarker.getPosition();
            
            // Set title and info window to marker
            latestMarker.setTitle(locationName);
            
            const infoWindow = new google.maps.InfoWindow({
                content: `<div style="color: #333;"><strong>${locationName}</strong><br>
                         Lat: ${position.lat().toFixed(6)}<br>
                         Lng: ${position.lng().toFixed(6)}</div>`
            });
            
            latestMarker.addListener('click', function() {
                if (activeInfoWindow) {
                    activeInfoWindow.close();
                }
                infoWindow.open(map, latestMarker);
                activeInfoWindow = infoWindow;
            });
            
            // Add to saved locations list
            const savedLocationsDiv = document.getElementById('saved-locations');
            const locationElement = document.createElement('div');
            locationElement.style.padding = '8px';
            locationElement.style.backgroundColor = '#2a2a2a';
            locationElement.style.marginTop = '8px';
            locationElement.style.borderRadius = '4px';
            locationElement.style.cursor = 'pointer';
            locationElement.innerHTML = `<strong>${locationName}</strong>`;
            
            locationElement.addEventListener('click', function() {
                map.panTo(position);
                map.setZoom(15);
                infoWindow.open(map, latestMarker);
                if (activeInfoWindow) {
                    activeInfoWindow.close();
                }
                activeInfoWindow = infoWindow;
            });
            
            savedLocationsDiv.appendChild(locationElement);
            
            // Reset marker mode and form
            markingEnabled = false;
            document.getElementById('mark-location').classList.remove('active');
            document.getElementById('mark-location').innerHTML = '<i class="fa-solid fa-map-pin"></i> Mark Location';
            document.getElementById('location-name').value = '';
            document.getElementById('location-info').classList.remove('active');
            
            map.setOptions({
                draggableCursor: 'grab'
            });
        } else {
            alert('Please enter a name for this location');
        }
    });
}

function placeMarker(location) {
    // Clear the last temporary marker if we're in marking mode
    if (markingEnabled && markers.length > 0) {
        markers[markers.length-1].setMap(null);
        markers.pop();
    }
    
    // Create a new marker
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        animation: google.maps.Animation.DROP
    });
    
    // Store marker in array
    markers.push(marker);
    
    // Slightly pan the map to show location info panel
    map.panTo(location);
}

function clearMarkers() {
    // Remove all markers from the map
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    
    // Clear markers array
    markers = [];
    
    if (activeInfoWindow) {
        activeInfoWindow.close();
        activeInfoWindow = null;
    }
}