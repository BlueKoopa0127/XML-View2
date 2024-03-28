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
import { frgDataState } from './inputManu';
import { selectedObjectState } from './drawChart';

export const selectedObjectStateR = atom({
  key: 'selectedObjectStateR',
  default: null,
});

export function RightDrawChart({ drawData }) {
  const setSelectedObject = useSetRecoilState(selectedObjectStateR);
  const setSelectedRelation = useSetRecoilState(selectedRelationState);
  const textData = drawData.filter((e) => e.type == 'text');
  const groupData = drawData.filter((e) => e.type == 'rounded');
  const nodeData = drawData.filter((e) => e.type == 'shape');
  const edgeData = drawData.filter((e) => e.type == 'arrow');
  console.log(drawData);
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
      <Button variant="contained" component="span" id="resetButton2">
        位置をリセット
      </Button>
      <ZoomableSVG>
        <svg
          viewBox={`-800 -300 3600 3600`}
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
          {textData.map((e, i) => {
            return <DrawText key={e.id} e={e} />;
          })}
          {groupData.map((e, i) => {
            return (
              <DrawShape key={e.id} e={e} style={{ userSelect: 'none' }} />
            );
          })}

          {edgeData.map((e, i) => {
            return <DrawArrow key={i} e={e} />;
          })}
          {nodeData.map((e, i) => {
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

    const resetButton = d3.select('#resetButton2');
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
  const selectedObject = useRecoilValue(selectedObjectStateR);
  const selectedRelation = useRecoilValue(selectedRelationState);
  const selectedObjectL = useRecoilValue(selectedObjectState);
  const frg = useRecoilValue(frgDataState);
  const isSource = selectedRelation ? selectedRelation[0] == e.name : false;
  const isTarget = selectedRelation ? selectedRelation[1] == e.name : false;
  const isSelectedR = frg
    ?.filter((f) => f[1].includes(selectedObjectL?.name))
    .map((f) => f[0])
    .includes(e.text?.[0]?.[0]);
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
  const text = e?.text?.[0]?.[0].split('-');
  const t = [];
  let i = 1;
  while (i < text?.length) {
    const b = text[i - 1] + '-' + text[i];
    if (b.length * 8 < attr.width) {
      t.push(b);
      i += 2;
    } else if (i == text?.length - 1) {
      t.push(text[i - 1] + '-');
      t.push(text[i]);
      i++;
    } else {
      t.push(text[i - 1] + '-');
      i++;
    }
  }
  if (t.length == 0) {
    t.push(text?.[0]);
  }
  return (
    <g key={e.id}>
      {e.shape == 'ellipse' ? (
        <circle
          cx={attr.x * 1 + attr.width / 2}
          cy={attr.y * 1 + attr.height / 2}
          r={40}
          fill="white"
          stroke={color}
        />
      ) : (
        <rect
          x={attr.x}
          y={attr.y}
          width={attr.width}
          height={attr.height}
          fill={color == 'black' ? 'white' : color}
          fillOpacity={color == 'black' ? 1 : 0.2}
          stroke={color}
        />
      )}
      {t?.map((a, index) => {
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
            {a}
          </text>
        );
      })}
    </g>
  );
}

function DrawArrow({ e }) {
  const [selectedObject, setSelectedObject] =
    useRecoilState(selectedObjectStateR);
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
