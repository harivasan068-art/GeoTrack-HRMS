import { FiAlertTriangle, FiCheckCircle, FiExternalLink, FiMapPin, FiNavigation } from "react-icons/fi";

const InteractiveMap = ({
  latitude,
  longitude,
  address,
  locationName,
  isInsideGeofence = true,
  height = "h-64",
}) => {
  const numLat = latitude != null && latitude !== "" ? Number(latitude) : null;
  const numLon = longitude != null && longitude !== "" ? Number(longitude) : null;
  const isValidCoords = numLat != null && !isNaN(numLat) && numLon != null && !isNaN(numLon);

  const mapUrl = isValidCoords
    ? `https://maps.google.com/maps?q=${numLat},${numLon}&z=16&output=embed`
    : "";
  const googleMapsExternalUrl = isValidCoords
    ? `https://www.google.com/maps/search/?api=1&query=${numLat},${numLon}`
    : "#";

  return (
    <div className="space-y-3 font-sans">
      {/* Map Container */}
      <div className={`relative ${height} w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-inner`}>
        {isValidCoords ? (
          <iframe
            title="Location Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={mapUrl}
            className="h-full w-full filter contrast-125 opacity-95"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-500 font-medium">
            No GPS Coordinates Available
          </div>
        )}

        {/* Floating Overlay Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 font-sans">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/90 px-3 py-1.5 text-xs font-mono font-bold text-orange-400 backdrop-blur-md border border-slate-700 shadow-md">
            <FiNavigation className="text-orange-400" />
            Lat: {isValidCoords ? numLat.toFixed(4) : "--"}, Lon: {isValidCoords ? numLon.toFixed(4) : "--"}
          </div>

          {/* Geofence Warning or Verified Badge */}
          {isInsideGeofence ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-md font-sans">
              <FiCheckCircle /> Inside Permitted Geofence Zone
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1 text-[11px] font-bold text-white shadow-md animate-pulse font-sans">
              <FiAlertTriangle /> Outside Permitted Attendance Radius
            </div>
          )}
        </div>

        {/* Floating Google Maps Button */}
        {isValidCoords && (
          <a
            href={googleMapsExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-orange-600/40 backdrop-blur-md transition hover:bg-orange-700 hover:scale-105 font-sans"
          >
            Open in Google Maps <FiExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Address Bar */}
      <div className="flex items-start gap-2 rounded-2xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 text-xs font-sans">
        <FiMapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white font-display">
            {typeof locationName === "string" ? locationName : String(locationName || "Check-In Location")}:{" "}
          </span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">
            {typeof address === "string" ? address : String(address || "Address details verified via GPS reverse geocoding.")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
