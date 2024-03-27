import {
  useRecoilValue,
  useRecoilState,
  useSetRecoilState,
  atom,
} from 'recoil';
import { selectedRelationState } from './outputMenu';
import { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { Button } from '@mui/material';
import { selectedObjectStateR } from './rightDrawChart';
import { frgDataState } from './inputManu';

export const selectedObjectState = atom({
  key: 'selectedObjectState',
  default: null,
});

export function DrawChart({ drawData }) {
  const setSelectedObject = useSetRecoilState(selectedObjectState);
  const setSelectedRelation = useSetRecoilState(selectedRelationState);
  return (
    <>
      <Button
        variant="contained"
        component="span"
        onClick={() => {
          setSelectedObject(null);
          setSelectedRelation(null);
        }}
      >
        オブジェクト選択をリセット
      </Button>
      <Button variant="contained" component="span" id="resetButton">
        位置をリセット
      </Button>
      <ZoomableSVG>
        <svg
          viewBox={`-500 -300 3600 3600`}
          style={{
            backgroundColor: '#ddd',
          }}
        >
          <marker
            id="mu_mh"
            markerUnits="strokeWidth"
            markerWidth="5"
            markerHeight="5"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            orient={'auto'}
          >
            <polygon points="0,0 1,5 0,10 6,5 " fill="black" />
          </marker>
          {drawData.map((e, i) => {
            if (e.type == 'text') {
              return <DrawText key={e.id} e={e} />;
            } else if (e.type == 'rounded') {
              return (
                <DrawShape key={e.id} e={e} style={{ userSelect: 'none' }} />
              );
            } else if (e.type == 'shape') {
              return (
                <g
                  key={e.id}
                  onClick={() => {
                    setSelectedObject(e);
                  }}
                  style={{ userSelect: 'none', cursor: 'pointer' }}
                >
                  <DrawShape e={e} />
                </g>
              );
            } else if (e.type == 'arrow') {
              return <DrawArrow key={i} e={e} />;
            }
          })}
        </svg>
      </ZoomableSVG>
    </>
  );
}

function ZoomableSVG({ children, width, height }) {
  const svgRef = useRef();
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  useEffect(() => {
    const svgElement = d3.select(svgRef.current);
    const initialTransform = d3.zoomIdentity;
    const zoom = d3.zoom().on('zoom', (event) => {
      const { x, y, k } = event.transform;
      setK(k);
      setX(x);
      setY(y);
    });
    svgElement.call(zoom).call(zoom.transform, initialTransform);

    const resetButton = d3.select('#resetButton');
    resetButton.on('click', () => {
      svgElement
        .transition()
        .duration(500)
        .call(zoom.transform, initialTransform);
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 800"
      style={{ cursor: 'grab', backgroundColor: 'gray' }}
    >
      <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
    </svg>
  );
}

function angle(x, y, r) {
  if (x == 0.5 && y == 0.5) {
    return [0, 0];
  }
  if (x == 0.5) {
    return [0, r * (y ? 1 : -1)];
  }
  if (y == 0.5) {
    return [r * (x ? 1 : -1), 0];
  }
  return [(r * (x ? 1 : -1)) / Math.SQRT2, (r * (y ? 1 : -1)) / Math.SQRT2];
}

function DrawText({ e }) {
  const attr = e.mxGeometry._attributes;
  return (
    <g key={e.id}>
      {e.text.map((a, index) => {
        return (
          <text
            key={index}
            x={attr.x * 1 + attr.width / 2}
            y={attr.y * 1 + attr.height / 2 + index * 20}
            width={attr.width}
            height={attr.height}
            textAnchor="middle"
            style={{
              userSelect: 'none',
            }}
          >
            {a[a.length - 1]}
          </text>
        );
      })}
    </g>
  );
}

function DrawShape({ e }) {
  const attr = e.mxGeometry._attributes;
  const selectedObject = useRecoilValue(selectedObjectState);
  const selectedRelation = useRecoilValue(selectedRelationState);
  const selectedObjectR = useRecoilValue(selectedObjectStateR);
  const frg = useRecoilValue(frgDataState);
  const isSource = selectedRelation ? selectedRelation[0] == e.name : false;
  const isTarget = selectedRelation ? selectedRelation[1] == e.name : false;
  const isSelectedR = frg
    .find((f) => f[0] == selectedObjectR?.text?.[0])?.[1]
    .includes(e.name);

  const color =
    selectedObject == e
      ? 'red'
      : isSelectedR
      ? 'green'
      : isSource
      ? 'red'
      : isTarget
      ? 'blue'
      : 'black';
  //console.log(e);
  return (
    <g key={e.id}>
      {e.shape == 'ellipse' ? (
        <circle
          cx={attr.x * 1 + attr.width / 2}
          cy={attr.y * 1 + attr.height / 2}
          r={40}
          fill={color == 'black' ? 'white' : color}
          fillOpacity={color == 'black' ? 1 : 0.2}
          stroke={color}
        />
      ) : (
        <rect
          x={attr.x}
          y={attr.y}
          width={attr.width}
          height={attr.height}
          fill="white"
          stroke={color}
        />
      )}
      {e.text.map((a, index) => {
        return (
          <text
            key={index}
            x={attr.x * 1 + attr.width / 2}
            y={attr.y * 1 + attr.height / 2 + index * 20}
            width={attr.width}
            height={attr.height}
            textAnchor="middle"
            fill={color}
            style={{ fill: 'black' }}
          >
            {a[a.length - 1]}
          </text>
        );
      })}
    </g>
  );
}

function DrawArrow({ e }) {
  const [selectedObject, setSelectedObject] =
    useRecoilState(selectedObjectState);
  const selectedRelation = useRecoilValue(selectedRelationState);
  const hightlightRelation = selectedRelation
    ? selectedRelation[0] == e.source.text[0][1] &&
      selectedRelation[1] == e.target.text[0][1]
    : false;
  const sourcePointAttributes = e.source.mxGeometry._attributes;
  const targetPointAttributes = e.target.mxGeometry._attributes;
  const rx = (sourcePointAttributes.width * 1) / 2;
  const ry = (sourcePointAttributes.height * 1) / 2;

  const [sx, sy] = angle(
    (e.style.find((e) => e[0] == 'exitX') ?? ['', 0.5])[1] * 1,
    (e.style.find((e) => e[0] == 'exitY') ?? ['', 0.5])[1] * 1,
    ry,
  );
  const [tx, ty] = angle(
    (e.style.find((e) => e[0] == 'entryX') ?? ['', 0.5])[1] * 1,
    (e.style.find((e) => e[0] == 'entryY') ?? ['', 0.5])[1] * 1,
    ry,
  );
  const sourcePointXY = [
    [
      sourcePointAttributes.x * 1 + rx + sx,
      sourcePointAttributes.y * 1 + ry + sy,
    ],
  ];
  const targetPointXY = [
    [
      targetPointAttributes.x * 1 + rx + tx,
      targetPointAttributes.y * 1 + ry + ty,
    ],
  ];
  //console.log(sourcePoint);
  //console.log(targetPoint);
  const getArrayPoints = () => {
    if ('Array' in e.mxGeometry) {
      const p = e.mxGeometry.Array.mxPoint;
      if (Array.isArray(p)) {
        return e.mxGeometry.Array.mxPoint.map((f) => {
          return [f._attributes.x, f._attributes.y];
        });
      } else {
        return [[p._attributes.x, p._attributes.y]];
      }
    } else {
      return null;
    }
  };
  const arrayPoints = sourcePointXY.concat(
    getArrayPoints() ?? [],
    targetPointXY,
  );

  return (
    <g
      key={e.id}
      onClick={() => {
        setSelectedObject(e);
      }}
      style={{ cursor: 'pointer' }}
    >
      {arrayPoints.map((p, index, ary) => {
        if (index < arrayPoints.length - 1) {
          return (
            <g key={e.id + index}>
              <line
                key={0}
                x1={p[0]}
                y1={p[1]}
                x2={arrayPoints[index + 1][0]}
                y2={arrayPoints[index + 1][1]}
                strokeWidth={3}
                stroke={
                  selectedObject == e || hightlightRelation ? 'red' : 'black'
                }
                markerEnd={ary.length - 2 == index ? 'url(#mu_mh)' : ''}
              />
              <line
                key={1}
                x1={p[0]}
                y1={p[1]}
                x2={arrayPoints[index + 1][0]}
                y2={arrayPoints[index + 1][1]}
                strokeWidth={25}
                stroke="black"
                opacity={0.1}
              />
            </g>
          );
        }
      })}
    </g>
  );
}
