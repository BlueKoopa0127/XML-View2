import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  relatedDataAllState,
  relatedDataUrlState,
} from '../components/inputManu';

export default function SpreadsheetComponent() {
  const relatedDataUrl = useRecoilValue(relatedDataUrlState);
  const [relatedDataAll, setRelatedDataAll] =
    useRecoilState(relatedDataAllState);

  const RANGES = ['Connections', 'Circuits', 'References', 'FRG(I/O表示)'];
  const COLUMNS = {
    Connections: [
      'Sender Circuit ID (sCID)',
      'Receiver Circuit ID (rCID)',
      'Reference ID',
      'Pointers on literature',
    ],
    Circuits: ['Circuit ID', 'Sub-Circuits'],
    References: ['Reference ID', 'BibTex '],
    'FRG(I/O表示)': ['Node ID', 'Output Circuits (1)'],
  };

  useEffect(() => {
    const fetchData = async () => {
      const SPREADSHEET_ID = relatedDataUrl.split('/')[5];
      try {
        // スプレッドシートからデータを取得
        const response = await fetch(
          `/api/sheetAPI?id=${SPREADSHEET_ID}&ranges=${RANGES.map(
            encodeURIComponent,
          ).join('&ranges=')}`,
        );

        console.log(response);
        const result = await response.json();
        console.log(result);

        const filteredResult = result?.valueRanges?.map((sheet) => {
          const sheetName = sheet?.range?.split('!')[0].replaceAll("'", '');
          const filtered = sheet.values.filter((column) => {
            return COLUMNS[sheetName].includes(column[0]);
          });
          return filtered[0].map((_, c) => filtered.map((r) => r[c]));
        });

        const nodes = new Set();
        const refIds = new Set();

        const Connections = filteredResult[0].filter(
          (e) => e[0] != '' && e[1] != '',
        );

        Connections.forEach((e) => {
          nodes.add(e[0]);
          nodes.add(e[1]);
          refIds.add(e[2]);
        });

        const Circuit = filteredResult[1]
          .map((e) => {
            return [
              e[0],
              e[1]
                ?.split('\n')
                .map((f) => f.split(';').filter((f) => f != ''))
                .flat(1)
                .filter((e) => nodes.has(e)),
            ];
          })
          .filter((e) => e[1] && e[1].length > 0);

        const References = filteredResult[2].filter((e) => refIds.has(e[0]));

        const Frg = filteredResult[3]
          .map((e) => {
            return [
              e[0].replaceAll(' ', '-'),
              e[1]
                ?.split('\n')
                .map((f) => f.split(';').filter((f) => f != ''))
                .flat(1),
            ];
          })
          .filter((e) => e[1] && e[1].length > 0);

        const AllData = {
          connections: Connections,
          references: References,
          compound: Circuit,
          frg: Frg,
        };

        // ここまでGASで書いていたもの

        setRelatedDataAll(AllData);

        console.log('ALLDATA:', AllData);
        console.log('DataURL:', relatedDataUrl);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [relatedDataUrl]);
}
