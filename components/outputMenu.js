import { useRecoilValue, useRecoilState, atom } from 'recoil';
import { selectedObjectStateL } from './drawChart';
import { Grid, Typography, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { referencesDataState } from './inputManu';

export const selectedRelationState = atom({
  key: 'selectedRelationState',
  default: null,
});
export function OutputMenu() {
  const selectedObject = useRecoilValue(selectedObjectStateL);
  const [selectedRelation, setSelectedRelation] = useRecoilState(
    selectedRelationState,
  );
  const referencesData = useRecoilValue(referencesDataState);

  const [referenceData, setReferenceData] = useState(null);
  useEffect(() => {
    if (selectedRelation) {
      setReferenceData(referencesData[selectedRelation.reference[0]]);
    } else {
      setReferenceData(null);
    }
  }, [selectedRelation]);
  // console.log(referenceData);

  useEffect(() => {
    if (selectedObject && selectedObject?.edges == undefined) {
      setSelectedRelation(selectedObject);
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
        : '選択しているオブジェクト：' + selectedObject.id}
    </Box>
  );
  console.log(selectedObject);

  if (selectedObject == null) {
    return <>{title}</>;
  }

  return (
    <div>
      {title}
      {(selectedObject?.edges == undefined
        ? [selectedObject]
        : selectedObject.edges
      ).map((e, i) => {
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
                  <Typography align="center">{e.source}</Typography>
                </Grid>
                <Grid item xs={1}>
                  →
                </Grid>
                <Grid item xs={5.5}>
                  <Typography align="center">{e.target}</Typography>
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
            : selectedRelation.reference[1] == ''
            ? 'データが存在していません'
            : selectedRelation.reference[1]}
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
        {referenceData?.map((e, i) => {
          return <Typography key={i}>{e}</Typography>;
        })}
      </Box>
    </div>
  );
}
