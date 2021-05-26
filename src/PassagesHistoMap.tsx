import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { StaticMap } from 'react-map-gl';
import axios from 'axios';

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -0.341004,
  latitude: 51.477487,
  //latitude: 40.641312,
  //longitude: -73.778137,
  zoom: 10,
  minZoom: 7,
  maxZoom: 18,
  pitch: 40.5,
  bearing: -27.396674584323023
};

const alpha = 90;

const colorRange = [
  [1, 152, 189, alpha],
  [73, 227, 206, alpha],
  [216, 254, 181, alpha],
  [254, 237, 177, alpha],
  [254, 173, 84, alpha],
  [209, 55, 78, alpha]
];

const elevationScale = 3;

const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51]
};


const PassagesHistoMap = () => {
  const [passages, setPassages] = useState([] as any);

  const layers = [
    new HexagonLayer({
      id: "heatmap",
      //colorRange,
      coverage: 1,
      data: passages,
      elevationRange: [0, 800],
      elevationScale,
      extruded: true,
      getPosition: d => d,
      //onHover: this.props.onHover,
      opacity: 1,
      //pickable: Boolean(this.props.onHover),
      radius: 150,
      upperPercentile: 100,
      material
    })
  ];

  const processDataFlights = (flights: any[]) => {
    const positions = flights.map((el: { positions: any; }) => el.positions);
    const renderData = positions.flat().map((el: any[]) => [el[1], el[0]]);
    setPassages(renderData);
  }

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        'https://now-mongo-api-mudhdoba1-emanuelef.vercel.app/api/allFlights.js?start=1566317600&end=1566361999&interpolation=1',
      );
      console.log(result.data.length);
      processDataFlights(result.data);
    };
    fetchData();
  }, []);

  return <DeckGL width={920} height={580} style={{ left: "200px", top: "64px" }}
    initialViewState={INITIAL_VIEW_STATE}
    controller={true}
    layers={layers}
  >
    <StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} />
  </DeckGL>
}

export default PassagesHistoMap