import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// import iconUrl from 'leaflet/dist/images/marker-icon.png';
// import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
// import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);

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
    const map = L.map(mapRef.current).setView([51.505, -0.09], 13);

    // Adiciona uma camada de tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Adiciona um marcador e popup
    const marker = L.marker([51.505, -0.09]).addTo(map);
    marker.bindPopup('Aqui é Londres! <br> Exemplo de Popup.');

    // Limpa o mapa ao desmontar o componente
    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapRef} data-testid="map-container" style={{ height: '500px', width: '100%' }} />;
};

export default MapComponent;