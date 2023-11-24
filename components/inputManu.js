import { useEffect, useState } from 'react';
import {
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
  atom,
} from 'recoil';
import { xml2json } from 'xml-js';

import { Input, Button, Card, Typography, Link } from '@mui/material';

export const drawDataUrlState = atom({
  key: 'drawDataUrlState',
  default: 'Miya_sample.drawio.xml',
});

export const relatedDataUrlState = atom({
  key: 'relatedDataUrlState',
  default:
    'https://script.googleusercontent.com/macros/echo?user_content_key=eZc5ZI_5uIjKgfMjH2_SPPMYv8cxFBIkWPUr_9ikfkgxhj6xeHMxsbhhkkxdnrGqqkBp81s-CMyKcTthGOMyNSb9b-CHg-7sm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnNn7QRqOoEBV3cKWTQSamdgSRZrrPeIyZwphpZ0GlGts72gFKSD-1bAtb3NGIwK2-kjPHDGPMaez-XMAlwbU29ealZQvKNBeidz9Jw9Md8uu&lib=MlymDeyPZhGLLMUX4XnL84AHWkD4xvv7U',
});

export const drawDataState = atom({
  key: 'drawDataState',
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
  const drawDataUrl = useRecoilValue(drawDataUrlState);
  const relatedDataUrl = useRecoilValue(relatedDataUrlState);
  const [drawData, setDrawData] = useRecoilState(drawDataState);
  const [relatedData, setRelatedData] = useRecoilState(relatedDataState);
  const [referencesData, setReferencesData] =
    useRecoilState(referencesDataState);
  const [referencesDataAll, setReferencesDataAll] = useState([]);
  const [relatedDataAll, setRelatedDataAll] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const url =
        typeof drawDataUrl == 'string'
          ? drawDataUrl
          : window.URL.createObjectURL(drawDataUrl);
      const res = await fetch(url);
      if (
        res.status == 200 &&
        relatedDataAll != null &&
        relatedDataAll.length > 0
      ) {
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
                    name: translate(e._attributes.value)[0][1],
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
        const filteredRelatedData = relatedDataAll.filter((e) => {
          return nodeData.includes(e[0]) && nodeData.includes(e[1]);
        });
        setRelatedData(filteredRelatedData);
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
  }, [drawDataUrl, relatedDataAll]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(relatedDataUrl);
      if (res.status == 200) {
        const text = await res.json();
        setRelatedDataAll(text[0]);
        setReferencesDataAll(text[1]);
      }
    };
    fetchData();
  }, [relatedDataUrl]);

  useEffect(() => {
    //console.log(referencesDataAll);
    //console.log(relatedData);
    const filteredReferencesData = referencesDataAll.filter((e) => {
      return relatedData.map((f) => f[2]).includes(e[0]);
    });
    const br = filteredReferencesData.map((e) => {
      return [
        e[0],
        e[1].split('\n').map((f) => {
          return (
            <>
              {f}
              <br />
            </>
          );
        }),
        e[1],
      ];
    });
    setReferencesData(br);
  }, [referencesDataAll, relatedData]);
}
