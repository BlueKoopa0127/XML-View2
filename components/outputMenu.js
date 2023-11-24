import { useRecoilValue, useRecoilState, atom } from 'recoil';
import { selectedObjectState } from './drawChart';
import { Grid, Typography, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { referencesDataState } from './inputManu';

export const selectedRelationState = atom({
  key: 'selectedRelationState',
  default: null,
});

export function OutputMenu() {
  const selectedObject = useRecoilValue(selectedObjectState);
  const [selectedRelation, setSelectedRelation] = useRecoilState(
    selectedRelationState,
  );
  const referencesData = useRecoilValue(referencesDataState);

  const [referenceData, setReferenceData] = useState(null);
  useEffect(() => {
    setReferenceData(
      referencesData?.find((e) => e?.[0] == selectedRelation?.[2]),
    );
  }, [selectedRelation]);
  console.log(referenceData);

  useEffect(() => {
    if (selectedObject?.type == 'arrow') {
      setSelectedRelation(selectedObject.literature[0]);
    } else {
      setSelectedRelation(null);
    }
  }, [selectedObject]);

  const title = (
    <Box
      style={{ border: '2px solid #333' }}
      p={1.5}
      marginTop={3}
      marginBottom={1.5}
    >
      {selectedObject == null
        ? 'ノードやエッジをクリックしてください'
        : '選択しているオブジェクト：'}
      {selectedObject == null
        ? ''
        : selectedObject.name ??
          (selectedObject?.literature.length == 0
            ? 'データが存在していません'
            : selectedObject?.literature[0][0] +
              ' → ' +
              selectedObject?.literature[0][1])}
    </Box>
  );

  if (selectedObject == null) {
    return <>{title}</>;
  }

  return (
    <div>
      {title}
      {selectedObject.literature.map((e, i) => {
        return (
          <div key={i}>
            <Box
              onClick={() => {
                setSelectedRelation(e);
              }}
              style={
                selectedRelation == e
                  ? { cursor: 'pointer', border: '1px solid red' }
                  : { cursor: 'pointer', border: '1px solid #ddd' }
              }
              p={1.5}
            >
              <Grid container spacing={2}>
                <Grid item xs={5.5}>
                  <Typography align="center">{e[0]}</Typography>
                </Grid>
                <Grid item xs={1}>
                  →
                </Grid>
                <Grid item xs={5.5}>
                  <Typography align="center">{e[1]}</Typography>
                </Grid>
              </Grid>
            </Box>
            <Box m={1} />
          </div>
        );
      })}
      <Box p={1} marginTop={1} style={{ border: '1px solid #555' }}>
        <Typography>
          Pointers on literature : <br />
          {selectedRelation == null
            ? '上の項目か右図中の矢印をクリック'
            : selectedRelation[3] == ''
            ? 'データが存在していません'
            : selectedRelation[3]}
        </Typography>
      </Box>

      <Box p={1} marginTop={1} style={{ border: '1px solid #555' }}>
        <Button
          variant="contained"
          component="span"
          onClick={async () => {
            await navigator.clipboard.writeText(referenceData?.[2]);
          }}
          m={1}
        >
          Bibtexをコピーする
        </Button>
        {referencesData
          ?.find((e) => e?.[0] == selectedRelation?.[2])?.[1]
          ?.map((e, i) => {
            return <Typography key={i}>{e}</Typography>;
          })}
      </Box>
    </div>
  );
}
