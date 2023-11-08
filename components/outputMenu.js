import { useRecoilValue } from 'recoil';
import { selectedObjectState } from './drawChart';

export function OutputMenu() {
  const selectedObject = useRecoilValue(selectedObjectState);

  if (selectedObject == null) {
    return <div>ノードやエッジをクリックしてください</div>;
  }

  return (
    <div>
      <div>結果</div>
      {selectedObject.literature.map((e, i) => {
        return (
          <div key={i}>
            {e[0]} {e[1]} {e[2]}
          </div>
        );
      })}
    </div>
  );
}
