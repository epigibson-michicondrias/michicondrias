import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

// A custom pulsing icon for the pet
const createPetIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-pet-marker',
        html: `
      <div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 15px ${color}, 0 0 30px ${color};
        animation: markerPulse 2s infinite ease-out;
      ">
      </div>
      <style>
        @keyframes markerPulse {
          0% { box-shadow: 0 0 0 0 ${color}B3; }
          70% { box-shadow: 0 0 0 20px ${color}00; }
          100% { box-shadow: 0 0 0 0 ${color}00; }
        }
      </style>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true });
    }, [center, map]);
    return null;
}

interface MapComponentProps {
    lat: number;
    lng: number;
    name: string;
}

export default function MapComponent({ lat, lng, name }: MapComponentProps) {
    const position: [number, number] = [lat, lng];

    return (
        <MapContainer
            center={position}
            zoom={17}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"
            />
            <MapUpdater center={position} />
            <Marker position={position} icon={createPetIcon('#10b981')}>
                <Popup>
                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{name}</div>
                    <div style={{ color: '#64748b' }}>GPS Activo</div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}
