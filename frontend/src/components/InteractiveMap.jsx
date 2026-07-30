import { FiAlertTriangle, FiCheckCircle, FiExternalLink, FiMapPin, FiNavigation } from "react-icons/fi";

const InteractiveMap = ({
  latitude,
  longitude,
  address,
  locationName,
  isInsideGeofence = true,
  height = "h-64",
}) => {
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;
  const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className={`relative ${height} w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner`}>
        {latitude && longitude ? (
          <iframe
            title="Location Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={mapUrl}
            className="h-full w-full filter contrast-125 opacity-90"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            No GPS Coordinates Available
          </div>
        )}

        {/* Floating Overlay Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/90 px-3 py-1.5 text-xs font-mono font-semibold text-indigo-300 backdrop-blur-md border border-slate-700 shadow-md">
            <FiNavigation className="text-indigo-400" />
            Lat: {latitude?.toFixed(4)}, Lon: {longitude?.toFixed(4)}
          </div>

          {/* Geofence Warning or Verified Badge */}
          {isInsideGeofence ? (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/90 px-3 py-1 text-[11px] font-bold text-slate-950 shadow-md">
              <FiCheckCircle /> Inside Permitted Geofence Zone
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/90 px-3 py-1 text-[11px] font-bold text-slate-950 shadow-md animate-pulse">
              <FiAlertTriangle /> Outside Permitted Attendance Radius
            </div>
          )}
        </div>

        {/* Floating Google Maps Button */}
        {latitude && longitude && (
          <a
            href={googleMapsExternalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/40 backdrop-blur-md transition hover:bg-indigo-500 hover:scale-105"
          >
            Open in Google Maps <FiExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Address Bar */}
      <div className="flex items-start gap-2 rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs">
        <FiMapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">{locationName || "Check-In Location"}: </span>
          <span className="text-slate-300">{address || "Address details verified via GPS reverse geocoding."}</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
