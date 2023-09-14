'use client';
import { useEffect, useState, useRef } from 'react';
import { xml2json } from 'xml-js';
import 'bulma/css/bulma.css';
import * as d3 from 'd3';

function translate(t) {
  const result = t
    .split('<')
    .map((a) => {
      return a.split('>');
    })
    .filter((a) => a.indexOf('') == -1);
  //console.log(result);
  return result;
}
function getStyle(s) {
  return s.split(';').map((a) => {
    return a.split('=');
  });
}

export default function Home() {
  const [xmlUrl, setXmlUrl] = useState('Miya_sample.drawio.xml');
  const [jsonUrl, setJsonUrl] = useState(
    'https://script.googleusercontent.com/macros/echo?user_content_key=nd8R4gTB8cWnUxMh7wtmkwG_Tvf2v1OnzsL3415FrpqC35528jhS6BVOnm29dxk_F_KfEsPG9r7kRvtJfHi-Oc5Udodpl8L0m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnMcvwa9F95N400DZ4TmCuxfMiNlxraAC4kLmfCWiHTwpxI6af9-_YLu7nKW_RIEzYJL9Sn8v8UQx_AxJT9Z4uec1XCiqKzyYpA&lib=MQfS-BbL2BHguduB_Ix_KiE4IkG4fjIwP',
  );
  const [updateJson, setUpdateJson] = useState(0);
  const [xml, setXml] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [displayText, setDisplayText] = useState([
    'Source',
    'Target',
    'Detail',
  ]);
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(xmlUrl);
      if (res.status == 200) {
        const text = await res.text();
        setXml(text);
      }
    };
    console.log(xmlUrl);
    fetchData();
  }, [xmlUrl]);

  useEffect(() => {
    console.log(updateJson);
    const fetchData = async () => {
      const res = await fetch(jsonUrl);
      if (res.status == 200) {
        const text = await res.json();
        setSheetData(text);
      }
    };
    fetchData();
  }, [updateJson]);

  useEffect(() => {
    setJsonData(JSON.parse(xml2json(xml, { compact: true, spaces: 2 })));
  }, [xml]);

  const b = xml == null || sheetData == null;
  const data = b ? null : jsonData.mxfile.diagram.mxGraphModel.root.mxCell;

  return (
    <div className="container is-fluid">
      <div className="hero-body">
        <div className="title">XML-View</div>
      </div>
      <div className="content">
        <div className="section">
          <div className="file">
            <label className="file-label">
              <input
                className="file-input"
                accept=".xml"
                type="file"
                name="resume"
                onChange={(e) => {
                  const f = e.target.files[0];
                  const url = window.URL.createObjectURL(f);
                  setXmlUrl(url);
                  console.log(url);
                }}
              />
              <span className="file-cta">
                <span className="file-label">ファイルを選択…</span>
              </span>
            </label>
          </div>
          <input
            className="input is-expanded"
            type="text"
            value={jsonUrl}
            onChange={(event) => {
              setJsonUrl(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setUpdateJson(updateJson + 1);
              }
            }}
            placeholder="ここにURLを入力"
          />
        </div>
        <div className="section">
          {displayText.map((d, i) => {
            return (
              <div key={i} className="columns is-vcentered">
                <div
                  className="column"
                  style={{
                    background: '#eee',
                  }}
                >
                  {sheetData ? sheetData[0][i] : 'Loading..'}
                </div>
                <div
                  className="column is-1 has-text-centered"
                  style={{
                    background: '#fff',
                  }}
                >
                  {':'}
                </div>
                <div
                  className="column is-half"
                  style={{
                    background: '#eee',
                  }}
                >
                  {d}
                </div>
              </div>
            );
          })}
        </div>
        {b ? (
          <div />
        ) : (
          <ZoomableSVG>
            <svg
              viewBox={`0 0 1200 1200`}
              style={{
                backgroundColor: 'gray',
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
              {data.map((e) => {
                if ('mxGeometry' in e) {
                  const attr = e.mxGeometry._attributes;
                  //console.log(e._attributes);
                  //console.log(attr);
                  if ('x' in e.mxGeometry._attributes) {
                    // テキストオブジェクト
                    const style = getStyle(e._attributes.style);
                    //console.log(style);
                    const shape = style.find((a) => {
                      return a[0] == 'shape';
                    });
                    if (style[0][0] == 'text') {
                      //画像のないテキストオブジェクト
                      return <DrawText key={e._attributes.id} e={e} />;
                    } else {
                      // 画像のあるテキストオブジェクト
                      if (shape != null) {
                        return (
                          <DrawShape
                            key={e._attributes.id}
                            e={e}
                            shape={shape[1]}
                            sheetData={sheetData}
                          />
                        );
                      } else {
                        //console.log(style[0][0]);
                        return (
                          <DrawShape
                            key={e._attributes.id}
                            e={e}
                            shape={style[0][0]}
                            sheetData={sheetData}
                          />
                        );
                      }
                    }
                  } else if (
                    'source' in e._attributes &&
                    'target' in e._attributes
                  ) {
                    return (
                      <DrawArray
                        key={e._attributes.id}
                        data={data}
                        e={e}
                        sheetData={sheetData}
                        displayText={displayText}
                        setDisplayText={setDisplayText}
                      />
                    );
                  }
                }
              })}
            </svg>
          </ZoomableSVG>
        )}
      </div>
    </div>
  );
}

function ZoomableSVG({ children, width, height }) {
  const svgRef = useRef();
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  useEffect(() => {
    const zoom = d3.zoom().on('zoom', (event) => {
      const { x, y, k } = event.transform;
      setK(k);
      setX(x);
      setY(y);
    });
    d3.select(svgRef.current).call(zoom);
  }, []);
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 1200"
      style={{ cursor: 'grab', backgroundColor: 'gray' }}
    >
      <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
    </svg>
  );
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

function DrawShape({ e, shape, sheetData }) {
  const attr = e.mxGeometry._attributes;
  console.log(e);
  return (
    <g
      key={e._attributes.id}
      onClick={() => {
        const b = translate(e._attributes.value);
        const n = b[0][1];
        console.log(n);
        const sender = sheetData.filter((c) => {
          return c[0] == n;
        });
        const receiver = sheetData.filter((c) => {
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
