import { useCallback, useState } from "react";

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = "Geolocation is not supported by your browser";
        setError(err);
        reject(new Error(err));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data.display_name) {
              locationName = data.display_name;
            }
          } catch {
            locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }

          const loc = { latitude, longitude, location_name: locationName };
          setLocation(loc);
          setLoading(false);
          resolve(loc);
        },
        (err) => {
          const message =
            err.code === 1
              ? "Location permission denied. Please enable GPS access."
              : "Unable to retrieve your location. Please try again.";
          setError(message);
          setLoading(false);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  return { location, loading, error, getLocation };
};
