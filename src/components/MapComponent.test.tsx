import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapComponent from './MapComponent';
import '@testing-library/jest-dom';

// Imita o módulo do Leaflet (Mapa)
vi.mock('leaflet', () => {
  const mockMap = {
    setView: vi.fn(),
    remove: vi.fn(),
    addTo: vi.fn(),
  };
  
  const mockMarker = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
  };

  const mockTileLayer = {
    addTo: vi.fn().mockReturnThis(),
  };

  return {
    default: {
      map: vi.fn(() => mockMap),
      tileLayer: vi.fn(() => mockTileLayer),
      marker: vi.fn(() => mockMarker),
      icon: vi.fn(),
      Marker: {
        prototype: {
          options: {}
        }
      }
    }
  };
});

// Aqui vai imitiar a biblioteca do Autocomplete, para não precisar usar a API diretamente no site
vi.mock('react-places-autocomplete', () => {
  const MockPlacesAutocomplete = ({ children, value, onChange, onSelect }) => {
    const fakeProps = {
      getInputProps: (props) => ({
        ...props,
        value,
        onChange: (e) => onChange(e.target.value),
      }),
      suggestions: [
        {
          placeId: '1',
          description: 'São Paulo, SP, Brasil',
          active: false,
        },
        {
          placeId: '2',
          description: 'Rio de Janeiro, RJ, Brasil',
          active: true,
        },
      ],
      getSuggestionItemProps: (suggestion, props) => ({
        ...props,
        key: suggestion.placeId,
        onClick: () => onSelect(suggestion.description),
      }),
    };
    return children(fakeProps);
  };

  return {
    default: MockPlacesAutocomplete,
    geocodeByAddress: vi.fn().mockResolvedValue([
      { 
        geometry: { 
          location: { 
            lat: () => 40.7128, 
            lng: () => -74.0060 
          } 
        } 
      }
    ]),
    getLatLng: vi.fn().mockResolvedValue({ lat: 40.7128, lng: -74.0060 }),
  };
});

// Inicializa os testes
describe('MapComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Deve renderizar o estado inicial correto', () => {
    render(<MapComponent />);
    
    expect(screen.getByTestId('text-location')).toHaveTextContent('Search Location');   // Se o texto (<h2></h2>) possui o conteúdo de texto Search Location
    expect(screen.getByTestId('map-container')).toBeInTheDocument();                    // Se o container do mapa existe no documento
    expect(screen.getByTestId('input-location')).toHaveValue('São Paulo, SP, Brasil');  // Se o input tem como valor São Paulo (valor padrão)
  });

  it('Deve lidar com a alteração do Input corretamente', async () => {
    const user = userEvent.setup ? userEvent.setup() : userEvent;
    render(<MapComponent />);

    // Pega o valor do input
    const input = screen.getByTestId('input-location');

    // Limpa o Campo 
    // Aqui foi preciso limpar o campo, porque a funcção user.type estava pegando o valor do input (input-location) e juntando com o valor esperado (São Paulo, SP, Brasil)
    // ou seja, estava pegando 'São Paulo, SP, BrasilSão Paulo, SP, Brasil', agora com o campo limpo, ele pega apenas o valor 1 vez e retorna com o teste feito corretamente
    await user.clear(input);

    await user.type(input, 'São Paulo, SP, Brasil');

    // Verifica se ele o valor São Pualo foi o selecionado
    expect(input).toHaveValue('São Paulo, SP, Brasil');
  });

  it('Deve mostrar as sugestões e o que foi escolhido', async () => {
    const user = userEvent.setup ? userEvent.setup() : userEvent;
    render(<MapComponent />);
    
    // Pega o valor do input e espera o usuário clicar
    const input = screen.getByTestId('input-location');
    await user.click(input);

    // Espera o sistema carregar, e verifica se as opções São Paulo e Rio de Janeiro estão presentes
    await waitFor(() => {
      expect(screen.getByText('São Paulo, SP, Brasil')).toBeInTheDocument();
      expect(screen.getByText('Rio de Janeiro, RJ, Brasil')).toBeInTheDocument();
    });

    // Espera o usuário clicar em São Paulo
    await user.click(screen.getByText('São Paulo, SP, Brasil'));

    // Utilizando a API do Geocoding, verifica se ela é compatível com a de São Paulo
    const { geocodeByAddress, getLatLng } = await import('react-places-autocomplete');
    expect(geocodeByAddress).toHaveBeenCalledWith('São Paulo, SP, Brasil');
    expect(getLatLng).toHaveBeenCalled();
  });

  it('Deve lidar com os erros do Geocoding', async () => {
    const mockError = new Error('Geocoding failed');
    const { geocodeByAddress } = await import('react-places-autocomplete');
    vi.mocked(geocodeByAddress).mockRejectedValueOnce(mockError);

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const user = userEvent.setup ? userEvent.setup() : userEvent;
    render(<MapComponent />);
    
    const input = screen.getByTestId('input-location');
    await user.click(input);
    await user.click(screen.getByText('São Paulo, SP, Brasil'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao obter as coordenadas:', mockError);
    });
    
    consoleSpy.mockRestore();
  });
});