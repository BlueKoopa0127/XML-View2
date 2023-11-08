import { useRecoilValue } from 'recoil';
import { selectedObjectState } from './drawChart';
import { Grid, Typography, Card, CardContent, Box } from '@mui/material';
import { useState } from 'react';

export function OutputMenu() {
  const selectedObject = useRecoilValue(selectedObjectState);
  const [selectedRelation, setSelectedRelation] = useState(null);

  if (selectedObject == null) {
    return <div>ノードやエッジをクリックしてください</div>;
  }

  return (
    <div>
      <div>結果</div>
      {selectedObject.literature.map((e, i) => {
        return (
          <div key={i}>
            <Card
              key={i}
              onClick={() => {
                setSelectedRelation(e);
              }}
              style={
                selectedRelation == e
                  ? { cursor: 'pointer', border: '1px solid red' }
                  : { cursor: 'pointer' }
              }
            >
              <CardContent>
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
              </CardContent>
            </Card>
            <Box m={2} />
          </div>
        );
      })}
      <div>
        説明文：
        {selectedRelation == null ? '選択してくれ〜' : selectedRelation[2]}
      </div>
    </div>
  );
}
