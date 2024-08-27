import {
  InputMenu,
  dataImport,
  referencesDataState,
} from '../components/inputManu';
import { DrawChart } from '../components/drawChart';
import { OutputMenu } from '../components/outputMenu';
import { Container } from '@mui/system';
import { Grid, Typography } from '@mui/material';
import { drawDataState, rightDrawDataState } from '../components/inputManu';
import { useRecoilValue } from 'recoil';
import AutoDrawChart from '../components/autoDrawChart';

export default function Home({ Title }) {
  const drawData = useRecoilValue(drawDataState);
  const rightDrawData = useRecoilValue(rightDrawDataState);
  const referencesData = useRecoilValue(referencesDataState);
  dataImport();
  console.log(drawData);
  console.log(rightDrawData);
  console.log(referencesData);
  console.log(AutoDrawChart?.cyRef?.current);
  console.log(new Set(['BA_F', 'BA_E']).has('BA_E'));
  return (
    <Container maxWidth="xl">
      <Grid container spacing={2} marginY={10}>
        <Grid item xs={5}>
          <InputMenu />
        </Grid>
        <Grid item xs={7}>
          <Typography variant="h1" align="center">
            {Title}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <OutputMenu />
        </Grid>
        <Grid item xs={4.5}>
          <AutoDrawChart data={drawData} />
        </Grid>
        <Grid item xs={4.5}>
          <DrawChart drawData={rightDrawData} isBRA={false} />
        </Grid>
      </Grid>
    </Container>
  );
}
export async function getStaticProps() {
  const title = 'HCD-Image View';
  return { props: { Title: title } };
}
