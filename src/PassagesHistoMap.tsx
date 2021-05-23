import React, { FunctionComponent, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { LineLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiZW0tZnVtYSIsImEiOiJjazg5ems2ZW0wMHFmM2tvM2U5amx0cGtwIn0.YGYpuq5dr7gd87wGUEiNUQ";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

// Data to be used by the LineLayer
const data = [
  { sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781] }
];

const PassagesHistoMap = () => {
  const layers = [
    new LineLayer({ id: 'line-layer', data })
  ];
  return <DeckGL
    initialViewState={INITIAL_VIEW_STATE}
    controller={true}
    layers={layers}
  >
    <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
  </DeckGL>
}

export default PassagesHistoMap