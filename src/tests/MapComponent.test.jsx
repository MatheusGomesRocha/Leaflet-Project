import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import MapComponent from '../components/MapComponent';

describe('1 - Analyzing if the MapComponent has been rendered', () => {
    it('It will be valid if the MapComponent was rendered', () => {
        render(<MapComponent />);
        const Map = screen.getByTestId('map-container');
        expect(Map).toBeInTheDocument();
    })
})