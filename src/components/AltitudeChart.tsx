import { format } from "date-fns";
import React, { useMemo, useState } from "react";
import { AutoSizer } from "react-virtualized";
import {
  Crosshair,
  LineMarkSeriesPoint,
  LineSeries,
  XAxis,
  XYPlot,
} from "react-vis";
import "../../node_modules/react-vis/dist/style.css";
import { GpsRecord } from "../flightData";

type AltitudeChartProps = {
  gpsRecordArray: GpsRecord[];
  onNearestX?: ({ x }: { x: number | null }) => void;
};

export const AltitudeChart = ({
  gpsRecordArray,
  onNearestX,
}: AltitudeChartProps) => {
  const [altitudePoints, setAltitudePoints] = useState<
    (number | LineMarkSeriesPoint)[]
  >([]);
  const [speedPoints, setSpeedPoints] = useState<
    (number | LineMarkSeriesPoint)[]
  >([]);
  const [currentX, setCurrentX] = useState<LineMarkSeriesPoint[]>([]);

  const altitudeData = useMemo(
    () =>
      gpsRecordArray.map(({ altitude, datetime }, x) => ({
        x: datetime.getTime(),
        y: altitude,
      })),
    [],
  );
  const speedData = useMemo(
    () =>
      gpsRecordArray.map(({ speed, datetime }, x) => ({
        x: datetime.getTime(),
        y: speed,
      })),
    [],
  );
  return (
    <>
      <AutoSizer>
        {({ height, width }) => {
          const altitudeChart = (
            <XYPlot
              xType="time"
              onMouseLeave={() => {
                onNearestX && onNearestX({ x: null });
                setAltitudePoints([]);
              }}
              width={width}
              height={height}
              // onMouseLeave={() => setPoints([])}
            >
              <XAxis />
              <LineSeries
                color="#c30000"
                data={altitudeData}
                onNearestX={(v, { index }) => {
                  onNearestX && onNearestX({ x: index });
                  setAltitudePoints([v, index]);
                }}
              />
              <LineSeries
                color={"white"}
                data={speedData}
                onNearestX={(v, index) => setSpeedPoints([v])}
              />
              <Crosshair
                values={[...altitudePoints, ...speedPoints]}
                titleFormat={(v) => ({
                  title: "time",
                  value: format(new Date(v[0].x), "HH:mm:ss"),
                })}
                itemsFormat={([altitudePoint, index, speedPoint]) => [
                  {
                    title: "altitude",
                    value: `${Math.floor(altitudePoint?.y)} ft`,
                  },
                  {
                    title: "speed",
                    value: `${Math.floor(speedPoint?.y)} kts`,
                  },
                ]}
              />
            </XYPlot>
          );
          const speedChart = (
            <XYPlot width={width} height={height}>
              <LineSeries
                data={speedData}
              />
            </XYPlot>
          );
          return (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: 0 }}>{speedChart}</div>
              <div style={{ position: "absolute", top: 0 }}>
                {altitudeChart}
              </div>
            </div>
          );
        }}
      </AutoSizer>
    </>
  );
};
