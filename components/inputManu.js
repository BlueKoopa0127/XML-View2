import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, atom } from 'recoil';
import { xml2json } from 'xml-js';
import dagre from '@dagrejs/dagre';

import { Input, Button, Card, Typography, Link } from '@mui/material';

export const rightDrawDataUrlState = atom({
  key: 'rightDrawDataUrlState',
  default: 'Amygdala.circuit2.drawio.xml',
});

export const relatedDataUrlState = atom({
  key: 'relatedDataUrlState',
  default:
    'https://docs.google.com/spreadsheets/d/1E22mAQftP9xf2lDWZ734l0teWgaUCcFCpjzf2Y8Sk30/edit?gid=1487323325#gid=1487323325',
  // 'https://script.googleusercontent.com/macros/echo?user_content_key=pOWAyIM-b-J2OpMs0HPZe8r0EwiAki9o0_o0wa7LK1swU4ICsbTPD_qQNa7qqxA-lLXLGGtQ82-suuUTavuZfhsfyjF_8OF6m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnDYKF2zFn5OZnyVKWYnPBfZ3YQEck7XSO0gXijE891CHit92B2yvMLzggcX7-Jsi0PcmMlzXkJaTg89XpJdTBtk0VSA0nS2m9dz9Jw9Md8uu&lib=MKxHInl40nO0X9VMVsZQb7jQfreIY07W7',
});

export const relatedDataAllState = atom({
  key: 'relatedDataAllState',
  default: null,
});

export const drawDataState = atom({
  key: 'drawDataState',
  default: [],
});

export const rightDrawDataState = atom({
  key: 'rightDrawDataState',
  default: [],
});

export const relatedDataState = atom({
  key: 'relatedDataState',
  default: [],
});

export const referencesDataState = atom({
  key: 'referencesDataState',
  default: null,
});

export const frgDataState = atom({
  key: 'frgDataState',
  default: null,
});

export function InputMenu() {
  const [rightDrawDataUrl, setRightDrawDataUrl] = useRecoilState(
    rightDrawDataUrlState,
  );
  const [relatedDataUrl, setRelatedDataUrl] =
    useRecoilState(relatedDataUrlState);
  return (
    <>
      <div>
        <div>
          <Input
            accept="*.xml"
            style={{ display: 'none' }}
            id="rightDrawDataUrl"
            type="file"
            onChange={(e) => setRightDrawDataUrl(e.target.files[0])}
          />
          <label htmlFor="rightDrawDataUrl">
            <Button variant="contained" component="span">
              ファイルを選択
            </Button>
          </label>
          {rightDrawDataUrl && (
            <p>
              要件実現グラフのxmlファイル名:{' '}
              {rightDrawDataUrl.name ?? rightDrawDataUrl}
            </p>
          )}
        </div>
      </div>
      <div>
        <Card variant="outlined">
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard
                .readText()
                .then((clipboardData) => {
                  setRelatedDataUrl(clipboardData);
                })
                .catch((error) => {
                  console.error(
                    'クリップボードからテキストを読み取れませんでした: ',
                    error,
                  );
                });
            }}
          >
            クリップボードを読み取る
          </Button>
          <Typography
            variant="body1"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            データのURL:
            <Link
              href={relatedDataUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {relatedDataUrl}
            </Link>
          </Typography>
        </Card>
      </div>
    </>
  );
}

export function dataImport() {
  const [drawData, setDrawData] = useRecoilState(drawDataState);

  const rightDrawDataUrl = useRecoilValue(rightDrawDataUrlState);
  const [rightDrawData, setRightDrawData] = useRecoilState(rightDrawDataState);

  const relatedDataAll = useRecoilValue(relatedDataAllState);
  const [relatedData, setRelatedData] = useRecoilState(relatedDataState);
  const [frgData, setFrgData] = useRecoilState(frgDataState);

  const [referencesData, setReferencesData] =
    useRecoilState(referencesDataState);
  const [referencesDataAll, setReferencesDataAll] = useState([]);

  useEffect(() => {
    console.log(rightDrawDataUrl);
    const fetchData = async () => {
      const d = await url2json(rightDrawDataUrl);
      setRightDrawData(d);
    };
    fetchData();
  }, [rightDrawDataUrl]);

  useEffect(() => {
    if (relatedDataAll) {
      const text = relatedDataAll;

      const frg = [...text['frg']];
      frg.shift();

      setReferencesDataAll(text['references']);
      setFrgData(
        text['frg'].reduce((acc, e) => {
          acc[e[0]] = new Set(e[1]);
          return acc;
        }, {}),
      );

      const edges = [...text['connections']];
      edges.shift();
      console.log(edges);

      const compound = text['compound'];
      console.log('Compound', compound);

      const nodes = getNodesFromLinks(edges);
      console.log('Nodes', nodes);

      const dagreLayout = getDagreLayout(nodes, edges, compound);
      console.log('DAGRE', dagreLayout);
      setDrawData(dagreLayout);
    }
  }, [relatedDataAll]);

  useEffect(() => {
    //console.log(referencesDataAll);
    //console.log(relatedData);
    // const filteredReferencesData = referencesDataAll.filter((e) => {
    //   return relatedData.map((f) => f[2]).includes(e[0]);
    // });

    let br = {};
    referencesDataAll.map((e) => {
      br[e[0]] = e[1].split('\n').map((f) => {
        return (
          <>
            {f}
            <br />
          </>
        );
      });
      // return [
      //   e[0],
      //   e[1].split('\n').map((f) => {
      //     return (
      //       <>
      //         {f}
      //         <br />
      //       </>
      //     );
      //   }),
      //   e[1],
      // ];
    });
    setReferencesData(br);
  }, [referencesDataAll]);
}
function getNodesFromLinks(edges) {
  let graph = {};

  edges.forEach((e) => {
    if (!graph[e[0]]) {
      graph[e[0]] = createNode(e[0]);
    }
    if (!graph[e[1]]) {
      graph[e[1]] = createNode(e[1]);
    }
  });

  edges.forEach((e) => {
    graph[e[0]].target.push(graph[e[1]].id);
  });

  return Object.values(graph);
}

function createNode(id) {
  return {
    id: id,
    target: [],
  };
}
function getDagreLayout(nodes, edges, compound) {
  var g = new dagre.graphlib.Graph({
    directed: true,
    compound: true,
    multigraph: false,
  });

  // Set an object for the graph label
  g.setGraph({
    rankdir: 'TB', // 'TB' for top to bottom layout
    nodesep: 50, // horizontal space between nodes
    edgesep: 10, // horizontal space between edges
    ranksep: 50, // vertical space between nodes
    marginx: 100,
    marginy: 100,

    acyclicer: 'greedy',
    ranker: 'longest-path',
  });

  g.setDefaultEdgeLabel(function () {
    return {};
  });
  nodes.map((e) => {
    g.setNode(e, { label: e, width: 10, height: 10 });
  });

  edges.map((e) => {
    g.setEdge(e[0], e[1], [e[2], e[3]]);
  });

  compound.map((e) => {
    e[1].map((f) => {
      if (e[0] != f) {
        g.setParent(f, e[0]);
      }
    });
  });

  console.log(g);
  return g;
}

async function url2json(url) {
  const stringUrl =
    typeof url == 'string' ? url : window.URL.createObjectURL(url);
  const res = await fetch(stringUrl);
  if (res.status != 200) {
    throw 'not 200';
  }
  const text = await res.text();
  const jsonData = JSON.parse(xml2json(text, { compact: true, spaces: 2 }));
  const drawData = jsonData.mxfile.diagram.mxGraphModel.root.mxCell;

  //console.log(drawData);

  const formatDrawData = drawData
    .map((e) => {
      //存在しない場合、空要素を返す
      if (!('mxGeometry' in e)) {
        return { ...e, type: 'null' };
      }
      //x座標がある場合
      if (
        ('value' in e._attributes && e._attributes.value != '') ||
        'x' in e.mxGeometry._attributes
      ) {
        const style = getStyle(e._attributes.style);
        const text = translate(e._attributes.value);

        if (style[0][0] == 'text') {
          //画像のないテキストオブジェクト
          return {
            id: e._attributes.id,
            mxGeometry: e.mxGeometry,
            type: 'text',
            style: style,
            text: text[0][text[0].length - 1],
          };
        } else {
          if (style[0][0] == 'rounded' && text.length == 0) {
            return {
              id: e._attributes.id,
              mxGeometry: e.mxGeometry,
              type: 'rounded',
              style: style,
              text: text,
              shape: style[0][0],
            };
          } else {
            // 画像のあるテキストオブジェクト
            if (!('x' in e.mxGeometry._attributes)) {
              e.mxGeometry._attributes.x = '0';
            }
            if (!('y' in e.mxGeometry._attributes)) {
              e.mxGeometry._attributes.y = '0';
            }
            return {
              id: e._attributes.id,
              mxGeometry: e.mxGeometry,
              type: 'shape',
              style: style,
              text: text[0][text[0].length - 1],
              shape: style[0][0],
            };
          }
        }
      } //x座標は無いけどsourceとtargetが存在する場合、矢印の描画
      else if ('source' in e._attributes && 'target' in e._attributes) {
        return {
          id: e._attributes.id,
          mxGeometry: e.mxGeometry,
          type: 'arrow',
          style: getStyle(e._attributes.style),
          source: e._attributes.source,
          target: e._attributes.target,
        };
      } else {
        return { ...e, type: 'null' };
      }
    })
    .filter((e) => {
      return e.type != 'null';
    })
    .map((e, i, a) => {
      if (e.type == 'arrow') {
        return {
          ...e,
          source: a.find((f) => f.id == e.source),
          target: a.find((f) => f.id == e.target),
        };
      } else {
        return e;
      }
    })
    .map((e, i, a) => {
      if (e.type == 'shape') {
        return {
          ...e,
          sourceNodes: a
            .filter((f) => f.type == 'arrow')
            .map((f) => {
              if (f.target.id == e.id) {
                return f.source;
              }
              return null;
            })
            .filter((f) => f != undefined),
          targetNodes: a
            .filter((f) => f.type == 'arrow')
            .map((f) => {
              if (f.source.id == e.id) {
                return f.target;
              }
              return null;
            })
            .filter((f) => f != undefined),
        };
      } else {
        return e;
      }
    });
  console.log(formatDrawData);
  return formatDrawData;
}

function getStyle(s) {
  return s.split(';').map((a) => {
    return a.split('=');
  });
}
function translate(t) {
  const result = t
    .split('<')
    .map((a) => {
      return a.split('>');
    })
    .filter((a) => a.indexOf('') == -1);
  return result;
}
