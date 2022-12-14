import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import "./map.css";

type GoogleLatLng = google.maps.LatLng;
type GoogleMapTypeId = google.maps.MapTypeId;
type GoogleMap = google.maps.Map;
type GoogleMarker = google.maps.Marker;
type GooglePolyLine = google.maps.Polyline;
type GoogleEventListener = google.maps.MapsEventListener;

interface IMap {
  mapType: GoogleMapTypeId;
  mapTypeControl?: boolean;
  setDistanceKm: Dispatch<SetStateAction<number>>;
}

interface IMarker {
  address: string;
  latitude: number;
  longitude: number;
}

export const Map: FunctionComponent<IMap> = ({
  mapType,
  mapTypeControl = false,
  setDistanceKm,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GoogleMap>();
  const [marker, setMarker] = useState<IMarker>();
  const [homeMarker, setHomeMarker] = useState<GoogleMarker>();
  const [googleMarkers, setGoogleMarkers] = useState<GoogleMarker[]>([]);
  const [lastLine, setLastLine] = useState<GooglePolyLine>();
  const [listenerIdArray, setListenerIdArray] = useState<GoogleEventListener[]>(
    []
  );

  const startMap = (): void => {
    const homeLocation = new google.maps.LatLng(35.22, -80.843);

    if (!map) {
      // TODO

      defaultMapStart(homeLocation);
    } else {
      const homeMarkerFromInit = addHomeMarker(homeLocation);
      setHomeMarker(homeMarkerFromInit);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(startMap, [map]);

  const defaultMapStart = (defaultLocation: GoogleLatLng): void => {
    initMap(10, defaultLocation);
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

  useEffect(() => {
    // Remove all event listeners
    listenerIdArray.forEach((listenerId) => {
      google.maps.event.removeListener(listenerId);
    });

    setListenerIdArray([]);
    setGoogleMarkers([]);
    // Add event listeners again
    googleMarkers.forEach((googleMarker) => {
      const markerPosition = googleMarker.getPosition();
      if (markerPosition) {
        addMarker(markerPosition);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastLine]);

  const addMarker = (location: GoogleLatLng): void => {
    const mapMarker: GoogleMarker = new google.maps.Marker({
      position: location,
      map: map,
      icon: getIconAttributes("#000000"),
    });

    setGoogleMarkers([...googleMarkers, mapMarker]);

    const listenerId = mapMarker.addListener("click", () => {
      const homePos = homeMarker?.getPosition();
      const markerPos = mapMarker.getPosition();

      if (homePos && markerPos) {
        const distanceInMeters =
          google.maps.geometry.spherical.computeDistanceBetween(
            homePos,
            markerPos
          );

        setDistanceKm(Math.ceil(distanceInMeters / 1000));

        if (lastLine) {
          lastLine.setMap(null);
        }

        const line = new google.maps.Polyline({
          path: [
            { lat: homePos.lat(), lng: homePos.lng() },
            { lat: markerPos.lat(), lng: markerPos.lng() },
          ],
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
              },
            },
          ],
          map,
        });

        setLastLine(line);
      }
    });

    setListenerIdArray([...listenerIdArray, listenerId]);
  };

  const addHomeMarker = (location: GoogleLatLng): GoogleMarker => {
    const homeMarkerConst: GoogleMarker = new google.maps.Marker({
      position: location,
      map: map,
      icon: {
        url: window.location.origin + "/assets/images/homeAddressMarker.png",
        anchor: new google.maps.Point(25, 25),
      },
    });

    homeMarkerConst.addListener("click", () => {
      map?.panTo(location);
      map?.setZoom(10);
    });

    return homeMarkerConst;
  };

  const getIconAttributes = (iconColor: string) => {
    return {
      // path: google.maps.SymbolPath.CIRCLE,
      path: "M11.0639 15.3003L26.3642 2.47559e-05L41.6646 15.3003L26.3638 51.3639L11.0639 15.3003 M22,17.5a4.5,4.5 0 1,0 9,0a4.5,4.5 0 1,0 -9,0Z",
      fillColor: iconColor,
      fillOpacity: 0.8,
      strokeColor: "pink",
      strokeWeight: 2,
      anchor: new google.maps.Point(27, 52),
      // scale: 1,
    };
  };

  useEffect(() => {
    if (marker) {
      addMarker(new google.maps.LatLng(marker.latitude, marker.longitude));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marker]);

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
