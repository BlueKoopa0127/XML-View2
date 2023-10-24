import { useRecoilValue } from 'recoil';
import { drawDataState, relatedDataState } from '../pages';

export function DrawChart() {
  const drawData = useRecoilValue(drawDataState);
  const relatedData = useRecoilValue(relatedDataState);
  console.log(drawData);
  console.log(relatedData);
  return (
    <svg
      viewBox={`0 0 1200 1200`}
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
        //存在しない場合、空要素を返す
        if (!('mxGeometry' in e)) {
          return <div key={i}></div>;
        }
        //x座標がある場合
        if ('x' in e.mxGeometry._attributes) {
          const style = getStyle(e._attributes.style);
          const shape = style.find((a) => {
            return a[0] == 'shape';
          });
          if (style[0][0] == 'text') {
            //画像のないテキストオブジェクト
            return <DrawText key={e._attributes.id} e={e} />;
          } else {
            // 画像のあるテキストオブジェクト
            return (
              <DrawShape
                key={e._attributes.id}
                e={e}
                shape={shape == null ? style[0][0] : shape[1]}
              />
            );
          }
        } //x座標は無いけどsourceとtargetが存在する場合、矢印の描画
        else if ('source' in e._attributes && 'target' in e._attributes) {
          return <></>;
        }
      })}
    </svg>
  );
}

function translate(t) {
  const result = t
    .split('<')
    .map((a) => {
      return a.split('>');
    })
    .filter((a) => a.indexOf('') == -1);
  //console.log(result)
  return result;
}
function getStyle(s) {
  return s.split(';').map((a) => {
    return a.split('=');
  });
}

function DrawText({ e }) {
  const attr = e.mxGeometry._attributes;
  return (
    <g key={e._attributes.id}>
      {translate(e._attributes.value).map((a, index) => {
        return (
          <text
            key={index}
            x={attr.x * 1 + attr.width / 2}
            y={attr.y * 1 + attr.height / 2 + index * 20}
            width={attr.width}
            height={attr.height}
            textAnchor="middle"
          >
            {a[a.length - 1]}
          </text>
        );
      })}
    </g>
  );
}

function DrawShape({ e, shape }) {
  const relatedData = useRecoilValue(relatedDataState);
  const attr = e.mxGeometry._attributes;
  //console.log(e);
  return (
    <g
      key={e._attributes.id}
      onClick={() => {
        const b = translate(e._attributes.value);
        const n = b[0][1];
        console.log(n);
        const sender = relatedData.filter((c) => {
          return c[0] == n;
        });
        const receiver = relatedData.filter((c) => {
          return c[1] == n;
        });
        console.log(sender);
        console.log(receiver);
      }}
    >
      <image
        href={`${shape}.png`}
        x={attr.x}
        y={attr.y}
        width={attr.width}
        height={attr.height}
      />
      {translate(e._attributes.value).map((a, index) => {
        return (
          <text
            key={index}
            x={attr.x * 1 + attr.width / 2}
            y={attr.y * 1 + attr.height / 2 + index * 20}
            width={attr.width}
            height={attr.height}
            textAnchor="middle"
          >
            {a[a.length - 1]}
          </text>
        );
      })}
    </g>
  );
}

function DrawArray({ data, e, sheetData, displayText, setDisplayText }) {
  //console.log(e._attributes.style);
  const sourcePoint = data.find(
    (element) => e._attributes.source == element._attributes.id,
  );
  const targetPoint = data.find(
    (element) => e._attributes.target == element._attributes.id,
  );
  const sourcePointAttributes = sourcePoint.mxGeometry._attributes;
  const targetPointAttributes = targetPoint.mxGeometry._attributes;
  const r = (sourcePointAttributes.width * 1) / 2;
  const style = getStyle(e._attributes.style);
  //console.log(style);
  const [sx, sy] = angle(
    (style.find((e) => e[0] == 'exitX') ?? ['', 0.5])[1] * 1,
    (style.find((e) => e[0] == 'exitY') ?? ['', 0.5])[1] * 1,
    r,
  );
  const [tx, ty] = angle(
    (style.find((e) => e[0] == 'entryX') ?? ['', 0.5])[1] * 1,
    (style.find((e) => e[0] == 'entryY') ?? ['', 0.5])[1] * 1,
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
  //console.log(arrayPoints);
  const sourceName = translate(sourcePoint._attributes.value)[0][1];
  const targetName = translate(targetPoint._attributes.value)[0][1];
  return (
    <g
      key={e._attributes.id}
      onClick={() => {
        console.log(sourceName);
        console.log(targetName);
        const row = sheetData.find((r) => {
          return r[0] == sourceName && r[1] == targetName;
        }) ?? [sourceName, targetName, 'No Data'];
        setDisplayText(row);
        console.log(row);
      }}
    >
      {arrayPoints.map((p, index, ary) => {
        if (index < arrayPoints.length - 1) {
          return (
            <g key={e._attributes.id + index}>
              <line
                key={0}
                x1={p[0]}
                y1={p[1]}
                x2={arrayPoints[index + 1][0]}
                y2={arrayPoints[index + 1][1]}
                strokeWidth={3}
                stroke={
                  sourceName == displayText[0] && targetName == displayText[1]
                    ? 'red'
                    : 'black'
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
