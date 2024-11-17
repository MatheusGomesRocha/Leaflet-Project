import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

interface Coordinates {
  lat: number;
  lng: number;
}

const MapComponent: React.FC = () => {
  const [address, setAddress] = useState<string>("São Paulo, SP, Brasil");
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: -23.550520, lng: -46.633308 });
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleSelect = async (value: string) => {
    setAddress(value);
    try {
      const results = await geocodeByAddress(value);
      const latLng = await getLatLng(results[0]);
      setCoordinates(latLng);
    } catch (error) {
      console.error("Erro ao obter as coordenadas:", error);
    }
  };

  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const defaultIcon = L.icon({
        iconUrl: '/images/pin.png',
        iconRetinaUrl: '/images/pin.png',
        shadowUrl: '/images/shadow.png',
        iconSize: [40, 40],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.Marker.prototype.options.icon = defaultIcon;

      mapRef.current = L.map(mapContainerRef.current).setView([coordinates.lat, coordinates.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      markerRef.current = L.marker([coordinates.lat, coordinates.lng])
        .addTo(mapRef.current)
        .bindPopup(`Aqui é ${address}!`);
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // Empty dependency array for initial mount only

  // Update marker position when coordinates change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      markerRef.current.bindPopup(`Aqui é ${address}!`);
      mapRef.current.setView([coordinates.lat, coordinates.lng], 13);
    }
  }, [coordinates, address]);

  return (
    <div className="flex flex-col h-[100vh] items-center bg-[#121212] justify-center">
      <div className="max-w-[500px] w-[100%] mx-auto mt-10 p-6 bg-[#1f1f1f] shadow-lg rounded-lg">
        <h2 data-testid="text-location" className="text-2xl font-semibold text-gray-800 mb-4 text-center text-[#fff]">
          Search Location
        </h2>
        <PlacesAutocomplete 
          value={address} 
          onChange={setAddress} 
          onSelect={handleSelect}
        >
          {({ getInputProps, suggestions, getSuggestionItemProps }) => (
            <div className="relative">
              <input
                data-testid="input-location"
                {...getInputProps({ 
                  placeholder: "Type a location...",
                  className: "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6200ea]"
                })}
              />
              <div className="absolute w-full bg-[#1f1f1f] text-white rounded-lg mt-1 z-10">
                {suggestions.map((suggestion) => {
                  const className = `p-2 ${
                    suggestion.active
                      ? "bg-[#6200ea] cursor-pointer"
                      : "bg-[#1f1f1f] cursor-pointer"
                  } hover:bg-[#6200ea]`;

                  return (
                    <div
                      key={suggestion.placeId}
                      {...getSuggestionItemProps(suggestion, { className })}
                    >
                      {suggestion.description}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PlacesAutocomplete>
      </div>

      <div 
        ref={mapContainerRef} 
        data-testid="map-container" 
        className="h-[500px] w-[90%] mt-5 z-0" 
      />
    </div>
  );
};

export default MapComponent;