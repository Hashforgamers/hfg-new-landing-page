import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon URLs
delete (L.Icon.Default.prototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Gaming locations data
const locations = [
  {
    id: 1,
    name: 'Matrix gaming',
    address:
      'Hinjawadi Phase 1 Rd, Mukai Nagar, Phase 1, Rajiv Gandhi Infotech Park, Hinjawadi, Pune, Maharashtra 411057',
    latitude: 18.5913,
    longitude: 73.738,
    features: ['High-Speed Internet', '22 Gaming Stations', 'Startup Zone'],
  },
  {
    id: 2,
    name: 'Levels Gaming lounge',
    address:
      'Floor 2, Bhole Building, Laxmi Bhawan Square, Dharampeth, Nagpur 440010',
    latitude: 21.1458,
    longitude: 79.0882,
    features: ['Central Location', '20 Gaming Stations', 'Student-Friendly'],
  },
  {
    id: 3,
    name: 'Levels Gaming Club',
    address:
      'Levels Gaming Club, 2nd Floor, Plot No 306, Above Delhivery Office, Jaripatka, Nagpur',
    latitude: 21.1736,
    longitude: 79.1207,
    features: ['Spacious Setup', '18 Gaming Stations', 'Nagpur Central Hub'],
  },
  {
    id: 4,
    name: 'MAFIA GAMING CAFE ',
    address:
      'Shop No-2, Teerth Plaza Building, Near L.R. Tiwari College, Kanakia Road, Mira Road, Mumbai 401107',
    latitude: 19.2936,
    longitude: 72.8617,
    features: ['Near College', '19 Gaming Stations', 'LAN + Console Room'],
  },
  {
    id: 5,
    name: 'PlayStation Paradise',
    address:
      'Shop No 20, PlayStation Paradise, Behind Fire Brigade, NSP Vasai Link Road, Agrawal Nagari, Vasant Nagri, Nalasopara (E), 401208',
    latitude: 19.4256,
    longitude: 72.8339,
    features: ['West Zone Hub', '17 Gaming Stations', 'Budget Friendly'],
  },
  {
    id: 6,
    name: 'GAMEBOX',
    address:
      'Gamebox Gaming Cafe, Near Kapsons Outlet, Bhupindra Road, Patiala, Punjab 147001',
    latitude: 30.3398,
    longitude: 76.3869,
    features: ['North Zone Entry', '15 Gaming Stations', 'Casual Arena'],
  },
  {
    id: 7,
    name: 'Levels Gaming Club',
    address:
      'Plot No 94, Anand Nagar Square, Opp Shardanagar, Nanded 431602. Landmark: Old Bullet Showroom',
    latitude: 19.1451,
    longitude: 77.3004,
    features: ['East Zone Entry', '16 Gaming Stations', 'Landmark: Old Bullet Showroom'],
  },
  {
    id: 8,
    name: 'Levels Gaming Lounge',
    address:
      'Floor 1, Beside Puma Showroom, Near Telephone Exchange Square, Central Avenue, Bagadganj, Nagpur',
    latitude: 21.1457,
    longitude: 79.1185,
    features: ['Prime Location', 'Modern Setup', 'Near Telephone Exchange Square'],
  },
  {
    id: 9,
    name: 'Retro Gaming',
    address:
      'Shop 9, Mahadev Shree Building, Jain Hospital, Opp. Garden City Building, Indralok Phase 2, Queens Park, Bhayander East, Mira Bhayandar, Mumbai, Maharashtra 401105',
    latitude: 19.3074,
    longitude: 72.8702,
    features: ['Mira Bhayandar Spot', '14 Gaming Stations', 'Near Jain Hospital'],
  },
];

// Component to change the map view center and zoom
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function ViewLocationModal({ isOpen, onClose }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [center, setCenter] = useState([19.076, 72.8777]); // Default center (Mumbai)
  const [zoom, setZoom] = useState(11);

  // Meta Pixel event: track when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', 'ViewLocationModalOpen');
      console.log('✅ Meta Pixel: ViewLocationModalOpen event sent');
    }
  }, [isOpen]);

  // Wrap onClose to track modal close event
  const handleClose = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', 'ViewLocationModalClose');
      console.log('✅ Meta Pixel: ViewLocationModalClose event sent');
    }
    onClose();
  };

  // Handle location selection and fire event with location details
  const handleLocationSelect = (location) => {
    setSelectedLocation(location.id);
    setCenter([location.latitude, location.longitude]);
    setZoom(14);

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', 'LocationSelected', {
        locationId: location.id,
        locationName: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      console.log(`✅ Meta Pixel: LocationSelected event sent for ${location.name}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black/80 rounded-2xl w-full max-w-6xl overflow-hidden border border-[#64BD55]/50 shadow-lg"
          >
            <div className="p-6 flex justify-between items-center border-b border-[#64BD55]/20">
              <h2 className="text-2xl text-white">Our Gaming Locations</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="text-gray-400 hover:text-white"
                aria-label="Close Locations Modal"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="flex flex-col md:flex-row h-[600px]">
              {/* Locations list */}
              <div className="w-full md:w-1/3 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {locations.map((location) => (
                    <motion.div
                      key={location.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedLocation === location.id
                          ? 'bg-[#64BD55]/10 border-[#00d115dc]'
                          : 'bg-white/5 border-transparent'
                      } border`}
                      onClick={() => handleLocationSelect(location)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleLocationSelect(location);
                        }
                      }}
                    >
                      <h3 className="text-lg text-white mb-2">{location.name}</h3>
                      <p className="text-gray-400 text-sm mb-3">{location.address}</p>
                      <div className="flex flex-wrap gap-2">
                        {location.features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded-full bg-[#64BD55]/20 text-[#44d35ca0]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="flex-1 relative">
                <MapContainer
                  center={center}
                  zoom={zoom}
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                >
                  <ChangeView center={center} zoom={zoom} />
                  <TileLayer
                    attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.map((location) => (
                    <Marker
                      key={location.id}
                      position={[location.latitude, location.longitude]}
                      eventHandlers={{
                        click: () => handleLocationSelect(location),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold">{location.name}</h3>
                          <p className="text-sm">{location.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
