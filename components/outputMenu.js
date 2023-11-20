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

  console.log(selectedObject?.literature);

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
      <Box p={1} style={{ border: '1px solid #555' }}>
        <Typography>
          説明文：
          {selectedRelation == null
            ? '上の項目か右図の中の矢印をクリック'
            : selectedRelation[2]}
        </Typography>
      </Box>
    </div>
  );
}
