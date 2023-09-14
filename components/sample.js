import { useRecoilState } from 'recoil';
import { countState } from '../pages/index';

export function Sample() {
  const [count, setCount] = useRecoilState(countState);
  //return <div onClick={setCount(count + 1)}>{count}</div>;
  return (
    <div
      onClick={() => {
        setCount(count + 1);
      }}
    >
      {count}
    </div>
  );
}
