import { useEffect } from 'react';
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  atom,
} from 'recoil';
import { xml2json } from 'xml-js';

import { Input, Button, Card, Typography } from '@mui/material';
import { drawDataState, relatedDataState } from '../pages';

export const drawDataUrlState = atom({
  key: 'drawDataUrlState',
  default: 'Miya_sample.drawio.xml',
});

export const relatedDataUrlState = atom({
  key: 'relatedDataUrlState',
  default:
    'https://script.googleusercontent.com/macros/echo?user_content_key=nd8R4gTB8cWnUxMh7wtmkwG_Tvf2v1OnzsL3415FrpqC35528jhS6BVOnm29dxk_F_KfEsPG9r7kRvtJfHi-Oc5Udodpl8L0m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnMcvwa9F95N400DZ4TmCuxfMiNlxraAC4kLmfCWiHTwpxI6af9-_YLu7nKW_RIEzYJL9Sn8v8UQx_AxJT9Z4uec1XCiqKzyYpA&lib=MQfS-BbL2BHguduB_Ix_KiE4IkG4fjIwP',
});

export function InputMenu() {
  const [drawDataUrl, setDrawDataUrl] = useRecoilState(drawDataUrlState);
  const [relatedDataUrl, setRelatedDataUrl] =
    useRecoilState(relatedDataUrlState);
  return (
    <>
      <div>
        <Input
          accept="*.xml"
          style={{ display: 'none' }}
          id="file-input"
          type="file"
          onChange={(e) => setDrawDataUrl(e.target.files[0])}
        />
        <label htmlFor="file-input">
          <Button variant="contained" component="span">
            ファイルを選択
          </Button>
        </label>
        {drawDataUrl && <p>選択されたファイル名: {drawDataUrl.name}</p>}
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
            データのURL: {relatedDataUrl}
          </Typography>
        </Card>
      </div>
    </>
  );
}

export function dataImport() {
  const drawDataUrl = useRecoilValue(drawDataUrlState);
  const relatedDataUrl = useRecoilValue(relatedDataUrlState);
  const setDrawData = useSetRecoilState(drawDataState);
  const [relatedData, setRelatedData] = useRecoilState(relatedDataState);

  useEffect(() => {
    const fetchData = async () => {
      const url =
        typeof drawDataUrl == 'string'
          ? drawDataUrl
          : window.URL.createObjectURL(drawDataUrl);
      const res = await fetch(url);
      if (res.status == 200 && relatedData != null && relatedData.length > 0) {
        const text = await res.text();
        const drawData = JSON.parse(
          xml2json(text, { compact: true, spaces: 2 }),
        ).mxfile.diagram.mxGraphModel.root.mxCell;

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
          //console.log(result)
          return result;
        }

        const formatDrawData = drawData
          .map((e) => {
            //存在しない場合、空要素を返す
            if (!('mxGeometry' in e)) {
              return { ...e, type: 'null' };
            }
            //x座標がある場合
            if ('x' in e.mxGeometry._attributes) {
              const style = getStyle(e._attributes.style);

              if (style[0][0] == 'text') {
                //画像のないテキストオブジェクト
                return {
                  id: e._attributes.id,
                  mxGeometry: e.mxGeometry,
                  type: 'text',
                  style: style,
                  text: translate(e._attributes.value),
                };
              } else {
                if (style[0][0] == 'rounded') {
                  return {
                    id: e._attributes.id,
                    mxGeometry: e.mxGeometry,
                    type: 'rounded',
                    style: style,
                    text: translate(e._attributes.value),
                    shape: style[0][0],
                  };
                } else {
                  // 画像のあるテキストオブジェクト
                  return {
                    id: e._attributes.id,
                    mxGeometry: e.mxGeometry,
                    type: 'shape',
                    style: style,
                    text: translate(e._attributes.value),
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
            }
          })
          .filter((e) => {
            return e.type != 'null';
          });
        const nodeData = formatDrawData
          .filter((e) => e.type == 'shape')
          .map((e) => e.text[0][1]);
        // console.log(nodeData);
        const filteredRelatedData = relatedData.filter((e) => {
          return nodeData.includes(e[0]) && nodeData.includes(e[1]);
        });
        // console.log(filteredRelatedData);
        const edgeFormatDrawData = formatDrawData.map((e) => {
          if (e.type == 'arrow') {
            return {
              ...e,
              source: formatDrawData.find((f) => f.id == e.source),
              target: formatDrawData.find((f) => f.id == e.target),
            };
          } else {
            return e;
          }
        });

        const nodeFormatDrawData = edgeFormatDrawData.map((e) => {
          if (e.type == 'shape') {
            return {
              ...e,
              sourceNodes: edgeFormatDrawData
                .filter((f) => f.type == 'arrow')
                .map((f) => {
                  if (f.target.id == e.id) {
                    return f.source;
                  }
                  return null;
                })
                .filter((f) => f != undefined),
              targetNodes: edgeFormatDrawData
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
        const relatedFormatDrawData = nodeFormatDrawData.map((e) => {
          if (e.type == 'shape') {
            return {
              ...e,
              literature: filteredRelatedData.filter(
                (f) =>
                  (e.sourceNodes.map((g) => g.text[0][1]).includes(f[0]) &&
                    f[1] == e.text[0][1]) ||
                  (e.targetNodes.map((g) => g.text[0][1]).includes(f[1]) &&
                    f[0] == e.text[0][1]),
              ),
            };
          } else if (e.type == 'arrow') {
            return {
              ...e,
              literature: filteredRelatedData.filter(
                (f) =>
                  f[0] == e.source.text[0][1] && f[1] == e.target.text[0][1],
              ),
            };
          } else {
            return e;
          }
        });
        setDrawData(relatedFormatDrawData);
      }
    };
    fetchData();
  }, [drawDataUrl, relatedData]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(relatedDataUrl);
      if (res.status == 200) {
        const text = await res.json();
        setRelatedData(text);
      }
    };
    fetchData();
  }, [relatedDataUrl]);
}
