import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";

const RoutingPath = ({ from, to }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!from || !to || !map) return;

    if (routingRef.current) {
      map.removeControl(routingRef.current);
    }

    routingRef.current = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
    }).addTo(map);

    return () => {
      if (routingRef.current) map.removeControl(routingRef.current);
    };
  }, [from, to, map]);

  return null;
};
