import React from 'react';
import MapComponent from './components/MapComponent';

const App: React.FC = () => {
  return (
    <div className="App" data-testid="map-container">
      <h1>Mapa com Leaflet no React</h1>
      <MapComponent />
    </div>
  );
};

export default App;