import { useRecoilValue } from 'recoil';
import { selectedObjectState } from './drawChart';

export function OutputMenu() {
  const selectedObject = useRecoilValue(selectedObjectState);
  console.log(selectedObject);
  return (
    <div>
      <div>結果</div>
      <div>{selectedObject._attributes.id}</div>
    </div>
  );
}
