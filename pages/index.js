import { InputMenu, dataImport } from '../components/inputManu';
import { DrawChart } from '../components/drawChart';
import { OutputMenu } from '../components/outputMenu';
import { Container } from '@mui/system';
import { Grid, Typography } from '@mui/material';

export default function Home({ Title }) {
  dataImport();
  return (
    <Container>
      <Grid container spacing={2}>
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
        <Grid item xs={5}>
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
  const title = 'HCD-Image View';
  return { props: { Title: title } };
}
