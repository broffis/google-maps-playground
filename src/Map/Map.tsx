import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import "./map.css";

type GoogleLatLng = google.maps.LatLng;
type GoogleMapTypeId = google.maps.MapTypeId;
type GoogleMap = google.maps.Map;
type GoogleMapsMarker = google.maps.Marker;

interface IMap {
  mapType: GoogleMapTypeId;
  mapTypeControl?: boolean;
}

interface IMarker {
  address: string;
  latitude: number;
  longitude: number;
}

export const Map: FunctionComponent<IMap> = ({
  mapType,
  mapTypeControl = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GoogleMap>();
  const [marker, setMarker] = useState<IMarker>();

  const startMap = (): void => {
    if (!map) {
      // TODO
      defaultMapStart();
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(startMap, [map]);

  const defaultMapStart = (): void => {
    const defaultAddress = new google.maps.LatLng(35.22, -80.843);
    // TODO: initmap
    initMap(10, defaultAddress);
  };

  const initEventListener = (): void => {
    if (map) {
      google.maps.event.addListener(map, "click", (e) => {
        coordinateToAddress(e.latLng);
      });
    }
  };

  useEffect(initEventListener, [map]);

  const coordinateToAddress = async (
    coordinates: GoogleLatLng
  ): Promise<void> => {
    const geocoder = new google.maps.Geocoder();
    await geocoder.geocode(
      {
        location: coordinates,
      },
      (results, status) => {
        if (status === "OK") {
          setMarker({
            address: results[0].formatted_address,
            latitude: coordinates.lat(),
            longitude: coordinates.lng(),
          });
        }
      }
    );
  };

  const addSingleMarker = (): void => {
    if (marker) {
      addMarker(new google.maps.LatLng(marker.latitude, marker.longitude));
    }
  };

  const addMarker = (location: GoogleLatLng): void => {
    const mapMarker: GoogleMapsMarker = new google.maps.Marker({
      position: location,
      map: map,
      icon: getIconAttributes("#000000"),
    });
  };

  const getIconAttributes = (iconColor: string) => {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: iconColor,
      fillOpacity: 0.8,
      strokeColor: "pink",
      strokeWeight: 2,
      // anchor: new google.maps.Point(30, 50),
      scale: 4,
    };
  };

  useEffect(addSingleMarker, [marker, addSingleMarker]);

  const initMap = (zoomLevel: number, address: GoogleLatLng): void => {
    if (ref.current) {
      setMap(
        new google.maps.Map(ref.current, {
          zoom: zoomLevel,
          center: address,
          mapTypeControl,
          streetViewControl: false,
          zoomControl: true,
          mapTypeId: mapType,
        })
      );
    }
  };

  return (
    <div className="map-container">
      <div ref={ref} className="map-container__map"></div>
    </div>
  );
};
