import { Sample } from '../components/sample';
import { useRecoilState, atom } from 'recoil';
import { dataImport } from '../components/dataImport';

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
    <div>
      <div>{Title}</div>
      <div>選択するとこ</div>
      <div>結果の表示</div>
      <div>ちゃーと</div>
      <Sample />
      <div
        onClick={() => {
          setCount(count + 1);
        }}
      >
        {count}
      </div>
    </div>
  );
}
export async function getStaticProps() {
  const ahoy = 'たいとる';
  return { props: { Title: ahoy } };
}
