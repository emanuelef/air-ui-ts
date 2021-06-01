// @ts-nocheck

import React, { useState, useEffect } from 'react';
import DeckGL from '@deck.gl/react';
import { LineLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';
import mapboxgl from "mapbox-gl";
import axios from 'axios';
import { DatePicker, Space } from 'antd';
import moment from "moment";
import { Spin } from 'antd';

const { RangePicker } = DatePicker;

// https://github.com/visgl/react-map-gl/issues/1266
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.380987,
  latitude: 37.62235,
  //longitude: -0.341004,
  //latitude: 51.477487,
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

let initialStart = moment(new Date())
  .utc()
  .startOf("day")
  .unix();
let initialEnd = moment(new Date())
  .utc()
  .endOf("day")
  .unix();

const INITIAL_START = initialStart;
const INITIAL_END = initialEnd;

const LineTracePassages = () => {
  const [passages, setPassages] = useState([] as any);
  const [dateRange, setDateRange] = useState([INITIAL_START, INITIAL_END] as any);
  const [loading, setLoading] = useState(false);

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

  // https://now-mongo-api-new-45jcfwqs5-emanuelef.vercel.app
  // http://localhost:3000

  const fetchData = async () => {
    setLoading(true)
    let result = []
    try {
      result = await axios(
        `https://now-mongo-api-emanuelef.vercel.app/api/passagesPosition.js?start=${dateRange[0]}&end=${dateRange[1]}&interpolation=1`,
      );
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false)
      console.log(result.data.length);
      processDataFlights(result.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const rangeDateChange = (date, dateString) => {
    console.log(date[0].unix(), date[1].unix())
    console.log(dateString)
    setDateRange([date[0].unix(), date[1].unix()])
  }

  const onChange = (date, dateString) => {
    let start = moment(date)
      .utc()
      .startOf("day")
      .unix();
    let end = moment(date)
      .utc()
      .endOf("day")
      .unix();
    setDateRange([start, end])
  }

  /*
        <RangePicker
        defaultPickerValue={[moment.unix(INITIAL_START), moment.unix(INITIAL_END)]}
        initialValue={[moment.unix(INITIAL_START), moment.unix(INITIAL_END)]}
        onChange={rangeDateChange} />
        */

  return <>
    <Space direction="horizontal" size={12}>
      <DatePicker onChange={onChange}
        defaultPickerValue={moment.unix(INITIAL_START)}
        initialValue={moment.unix(INITIAL_START)}
      />
      <Spin
        spinning={loading}
      />
    </Space>
    <DeckGL width={920} height={580} style={{ left: "200px", top: "164px" }}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  </>
}

export default LineTracePassages