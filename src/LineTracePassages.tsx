// @ts-nocheck

import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { LineLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';
import axios from 'axios';
import { DatePicker, Space } from 'antd';
import moment from "moment";

const { RangePicker } = DatePicker;


const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiZW0tZnVtYSIsImEiOiJjazg5ems2ZW0wMHFmM2tvM2U5amx0cGtwIn0.YGYpuq5dr7gd87wGUEiNUQ";

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

const getColor = (d: any) => {
  const z = d.start[2];
  const r = z / 2000;

  return [255 * (1 - r * 2), 255 * r, 128 * r, 125];
}

const getSourcePosition = (d: any) => {
  return d.start;
}

const getTargetPosition = (d: any) => {
  return d.end;
}

const INITIAL_START = 1566317600;
const INITIAL_END = 1566361999;

const LineTracePassages = () => {
  const [passages, setPassages] = useState([] as any);
  const [dateRange, setDateRange] = useState([INITIAL_START, INITIAL_END] as any);

  const layers = [
    new LineLayer({
      id: "flight-paths",
      coverage: 1,
      data: passages,
      fp64: true,
      getSourcePosition,
      getTargetPosition,
      getColor,
      getWidth: 4,
      pickable: true,
    })
  ];

  const processDataFlights = (flights: any[]) => {
    let vectors: { start: any[]; end: any[]; timestamp: any; }[] = [];
    flights.forEach(flight => {
      let lastPos: { lon: any; lat: any; alt: any; };
      flight.forEach((element: { lon: any; lat: any; alt: any; timestamp: any; }) => {
        if (lastPos) {
          let start = [lastPos.lon, lastPos.lat, lastPos.alt];
          let end = [element.lon, element.lat, element.alt];
          let timestamp = element.timestamp;
          vectors.push({ start, end, timestamp });
        }
        lastPos = element;
      });
    });
    setPassages(vectors);
  }

  const fetchData = async () => {
    const result = await axios(
      `https://now-mongo-api-mudhdoba1-emanuelef.vercel.app/api/passagesPosition.js?start=${dateRange[0]}&end=${dateRange[1]}&interpolation=1`,
    );
    console.log(result.data.length);
    processDataFlights(result.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const dateChange = (date, dateString) => {
    console.log(date[0].unix(), date[1].unix())
    console.log(dateString)
    setDateRange([date[0].unix(), date[1].unix()])
    fetchData()
  }

  return <>
    <Space direction="vertical" size={12}>
      <RangePicker
        defaultPickerValue={[moment.unix(INITIAL_START), moment.unix(INITIAL_END)]}
        initialValue={[moment.unix(INITIAL_START), moment.unix(INITIAL_END)]}
        onChange={dateChange} />
    </Space>
    <DeckGL width={920} height={580} style={{ left: "200px", top: "164px" }}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  </>
}

export default LineTracePassages