import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import { toast } from 'sonner';

// Component to handle Map Search
function SearchField({ setPosition }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      showMarker: false,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: 'Enter address, city, zip code...',
    });

    map.addControl(searchControl);

    // Listen to the search result
    map.on('geosearch/showlocation', (result) => {
      const latlng = { lat: result.location.y, lng: result.location.x };
      setPosition(latlng);
    });

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation');
    };
  }, [map, setPosition]);

  return null;
}

// Automatically hooks into HTML5 Geolocation API
function AutoLocate({ setPosition }) {
  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16);
      toast.success('GPS coordinates secured. Target pinpointed.');
    },
    locationerror(e) {
      toast.error('Location denied or unavailable. Please use the search bar.');
    }
  });

  useEffect(() => {
    // Triggers the browser permission popup automatically on mount
    map.locate();
  }, [map]);

  return null;
}

// Component to fly map to a new position (e.g., from geotagged image)
function FlyToPosition({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 16, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapPicker({ onLocationSelect, externalPosition }) {
  // Default position: New Delhi
  const defaultCenter = [28.6139, 77.2090];
  const [position, setPosition] = useState(null);

  const handlePositionChange = (latlng) => {
    setPosition(latlng);
    onLocationSelect(latlng.lat, latlng.lng);
  };

  // When externalPosition changes (e.g., from geotagged image), update the marker
  useEffect(() => {
    if (externalPosition && externalPosition.lat && externalPosition.lng) {
      setPosition({ lat: externalPosition.lat, lng: externalPosition.lng });
    }
  }, [externalPosition]);

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
      <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoLocate setPosition={handlePositionChange} />
        <SearchField setPosition={handlePositionChange} />
        <LocationMarker position={position} setPosition={handlePositionChange} />
        <FlyToPosition position={externalPosition} />
      </MapContainer>
    </div>
  );
}

