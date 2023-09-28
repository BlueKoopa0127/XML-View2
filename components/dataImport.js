import { xml2json } from 'xml-js';
import { useSetRecoilState } from 'recoil';
import { useState, useEffect } from 'react';
import { drawDataState, relatedDataState } from '../pages';

export function dataImport() {
  const [drawDataUrl, setDrawDataUrl] = useState('Miya_sample.drawio.xml');
  const [relatedDataUrl, setRelatedDataUrl] = useState(
    'https://script.googleusercontent.com/macros/echo?user_content_key=nd8R4gTB8cWnUxMh7wtmkwG_Tvf2v1OnzsL3415FrpqC35528jhS6BVOnm29dxk_F_KfEsPG9r7kRvtJfHi-Oc5Udodpl8L0m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnMcvwa9F95N400DZ4TmCuxfMiNlxraAC4kLmfCWiHTwpxI6af9-_YLu7nKW_RIEzYJL9Sn8v8UQx_AxJT9Z4uec1XCiqKzyYpA&lib=MQfS-BbL2BHguduB_Ix_KiE4IkG4fjIwP',
  );
  const setDrawData = useSetRecoilState(drawDataState);
  const setRelatedData = useSetRecoilState(relatedDataState);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(drawDataUrl);
      if (res.status == 200) {
        const text = await res.text();
        setDrawData(JSON.parse(xml2json(text, { compact: true, spaces: 2 })));
      }
    };
    console.log(drawDataUrl);
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
