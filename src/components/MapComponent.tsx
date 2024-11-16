import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';

// import iconUrl from 'leaflet/dist/images/marker-icon.png';
// import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
// import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
interface Coordinates {
  lat: number | null;
  lng: number | null;
}

const MapComponent: React.FC = () => {
  const [address, setAddress] = useState<string>("São Paulo, SP, Brasil");
  const [coordinates, setCoordinates] = useState<Coordinates>({ lat: -23.550520, lng: -46.633308 });

  const mapRef = useRef<HTMLDivElement>(null);

  const handleSelect = async (value: string) => {
    setAddress(value);
    try {
      const results = await geocodeByAddress(value);
      const latLng = await getLatLng(results[0]);
      setCoordinates(latLng);
      console.log(latLng);
    } catch (error) {
      console.error("Erro ao obter as coordenadas:", error);
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Configura o ícone padrão do marcador
    const defaultIcon = L.icon({
      iconUrl: '/images/pin.png',
      iconRetinaUrl: '/images/pin.png',
      shadowUrl: '/images/shadow.png',
      iconSize: [40, 40],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Define o ícone padrão
    L.Marker.prototype.options.icon = defaultIcon;

    // Inicializa o mapa com posição inicial e zoom
    const map = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 13);

    // Adiciona uma camada de tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Adiciona um marcador e popup
    const marker = L.marker([coordinates.lat, coordinates.lng]).addTo(map);
    marker.bindPopup('Aqui é '+address+'!');

    // Limpa o mapa ao desmontar o componente
    return () => {
      map.remove();
    };
  }, [coordinates]);

  return (
    <div className="flex flex-col h-[100vh] items-center bg-[#121212] justify-center">
      <div className="max-w-[500px] w-[100%] mx-auto mt-10 p-6 bg-[#1f1f1f] shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center text-[#e0e0e0]">Search Location</h2>
        <PlacesAutocomplete value={address} onChange={setAddress} onSelect={handleSelect}>
          {({ getInputProps, suggestions, getSuggestionItemProps }) => (
            <div className="relative">
              <input
                {...getInputProps({ placeholder: "Type a location..." })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6200ea]"
              />
              <div className="absolute w-full bg-[#1f1f1f] text-white rounded-lg mt-1 z-10">
                {suggestions.map((suggestion) => {
                  const activeClass = suggestion.active
                    ? "bg-[#6200ea] cursor-pointer"
                    : "bg-[#1f1f1f] cursor-pointer";
                  return (
                    <div
                      key={suggestion.placeId}
                      {...getSuggestionItemProps(suggestion, {
                        className: `p-2 ${activeClass} hover:bg-[#6200ea]`,
                      })}
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

      <div ref={mapRef} data-testid="map-container" className="h-[500px] w-[90%] mt-5 z-0" />
    </div>

  );
};

export default MapComponent;