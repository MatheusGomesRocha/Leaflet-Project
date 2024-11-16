import React from 'react';
import MapComponent from './components/MapComponent';

const App: React.FC = () => {
  return (
    <div className="App" data-testid="map-container">
      <MapComponent />
    </div>
  );
};

export default App;