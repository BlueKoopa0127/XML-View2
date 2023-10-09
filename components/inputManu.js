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
  const setRelatedData = useSetRecoilState(relatedDataState);

  useEffect(() => {
    const fetchData = async () => {
      const url =
        typeof drawDataUrl == 'string'
          ? drawDataUrl
          : window.URL.createObjectURL(drawDataUrl);
      const res = await fetch(url);
      if (res.status == 200) {
        const text = await res.text();
        setDrawData(JSON.parse(xml2json(text, { compact: true, spaces: 2 })));
      }
    };
    fetchData();
  }, [drawDataUrl]);

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
