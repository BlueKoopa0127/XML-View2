import { Sample } from '../components/sample';
import { useRecoilState } from 'recoil';
import { atom } from 'recoil';

export const countState = atom({
  key: 'countState',
  default: 0,
});

export default function Home({ Title }) {
  const [count, setCount] = useRecoilState(countState);
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
