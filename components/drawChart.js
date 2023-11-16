import {
  useRecoilValue,
  useRecoilState,
  useSetRecoilState,
  atom,
} from 'recoil';
import { drawDataState } from '../pages';
import { selectedRelationState } from './outputMenu';

export const selectedObjectState = atom({
  key: 'selectedObjectState',
  default: null,
});

export function DrawChart() {
  const drawData = useRecoilValue(drawDataState);
  const setSelectedObject = useSetRecoilState(selectedObjectState);
  console.log(drawData);
  return (
    <svg
      viewBox={`0 0 800 800`}
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
          return <DrawShape key={e.id} e={e} style={{ userSelect: 'none' }} />;
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
            style={{ userSelect: 'none' }}
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
  const isRelation = selectedRelation
    ? selectedRelation[0] == e.name || selectedRelation[1] == e.name
    : false;
  const isSource = selectedRelation ? selectedRelation[0] == e.name : false;
  const isTarget = selectedRelation ? selectedRelation[1] == e.name : false;
  const color = isSource
    ? 'red'
    : isTarget
    ? 'blue'
    : selectedObject == e
    ? 'red'
    : 'black';
  //console.log(e);
  return (
    <g key={e.id}>
      {e.type == 'shape' ? (
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
          fill="white"
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
  const r = (sourcePointAttributes.width * 1) / 2;

  const [sx, sy] = angle(
    (e.style.find((e) => e[0] == 'exitX') ?? ['', 0.5])[1] * 1,
    (e.style.find((e) => e[0] == 'exitY') ?? ['', 0.5])[1] * 1,
    r,
  );
  const [tx, ty] = angle(
    (e.style.find((e) => e[0] == 'entryX') ?? ['', 0.5])[1] * 1,
    (e.style.find((e) => e[0] == 'entryY') ?? ['', 0.5])[1] * 1,
    r,
  );
  const sourcePointXY = [
    [
      sourcePointAttributes.x * 1 + r + sx,
      sourcePointAttributes.y * 1 + r + sy,
    ],
  ];
  const targetPointXY = [
    [
      targetPointAttributes.x * 1 + r + tx,
      targetPointAttributes.y * 1 + r + ty,
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
