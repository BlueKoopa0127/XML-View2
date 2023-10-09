import { Sample } from '../components/sample';
import { useRecoilState, atom } from 'recoil';
import { InputMenu, dataImport } from '../components/inputManu';
import { DrawChart } from '../components/drawChart';
import { Container } from '@mui/system';
import { Grid, Typography } from '@mui/material';

export const countState = atom({
  key: 'countState',
  default: 0,
});

export const drawDataState = atom({
  key: 'drawDataState',
  default: null,
});

export const relatedDataState = atom({
  key: 'relatedDataState',
  default: null,
});

export default function Home({ Title }) {
  const [count, setCount] = useRecoilState(countState);
  const [drawData, setDrawData] = useRecoilState(drawDataState);
  const [relatedData, setRelatedData] = useRecoilState(relatedDataState);
  dataImport();
  console.log(drawData);
  console.log(relatedData);
  return (
    <Container>
      <Typography variant="h1" align="center">
        {Title}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={5}>
          <InputMenu />
          <div>結果</div>
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
