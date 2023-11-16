import { useRecoilValue, useRecoilState, atom } from 'recoil';
import { selectedObjectState } from './drawChart';
import { Grid, Typography, Box } from '@mui/material';
import { useEffect } from 'react';

export const selectedRelationState = atom({
  key: 'selectedRelationState',
  default: null,
});

export function OutputMenu() {
  const selectedObject = useRecoilValue(selectedObjectState);
  const [selectedRelation, setSelectedRelation] = useRecoilState(
    selectedRelationState,
  );

  useEffect(() => {
    if (selectedObject?.type == 'arrow') {
      setSelectedRelation(selectedObject.literature[0]);
    } else {
      setSelectedRelation(null);
    }
  }, [selectedObject]);

  if (selectedObject == null) {
    return <div>ノードやエッジをクリックしてください</div>;
  }

  return (
    <div>
      <div>結果</div>
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
      <Box p={1} style={{ border: '1px solid #555' }}>
        <Typography>
          説明文：
          {selectedRelation == null ? '選択してくれ〜' : selectedRelation[2]}
        </Typography>
      </Box>
    </div>
  );
}
