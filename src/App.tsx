import React, { useEffect, useState } from "react";
import "./App.css";
import { Map } from "./Map/Map";
import { loadMapApi } from "./utils/GoogleMapsUtils";

function App() {
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [distanceKm, setDistanceKm] = useState<number>(-1);

  useEffect(() => {
    const googleMapScript = loadMapApi();
    googleMapScript.addEventListener("load", () => {
      setScriptLoaded(true);
    });
  }, []);

  const renderDistanceSentence = () => {
    return (
      <div className="distance-info">
        {`Distance between selected marker and home is ${distanceKm} km`}
      </div>
    );
  };
  return (
    <div className="App">
      {scriptLoaded && (
        <Map
          mapType={google.maps.MapTypeId.ROADMAP}
          mapTypeControl={true}
          setDistanceKm={setDistanceKm}
        />
      )}
      {distanceKm > -1 && renderDistanceSentence()}
    </div>
  );
}

export default App;
