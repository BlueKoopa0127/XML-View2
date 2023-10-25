import { useRecoilState, atom } from 'recoil';
import { InputMenu, dataImport } from '../components/inputManu';
import { DrawChart } from '../components/drawChart';
import { OutputMenu } from '../components/outputMenu';
import { Container } from '@mui/system';
import { Grid, Typography } from '@mui/material';

export const drawDataState = atom({
  key: 'drawDataState',
  default: [],
});

export const relatedDataState = atom({
  key: 'relatedDataState',
  default: [],
});

export default function Home({ Title }) {
  dataImport();
  return (
    <Container>
      <Typography variant="h1" align="center">
        {Title}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <InputMenu />
          <OutputMenu />
        </Grid>
        <Grid item xs={7}>
          <DrawChart />
        </Grid>
      </Grid>
    </Container>
  );
}
export async function getStaticProps() {
  const ahoy = 'たいとる';
  return { props: { Title: ahoy } };
}
