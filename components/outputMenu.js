import { useRecoilValue } from 'recoil';
import { selectedObjectState, translate } from './drawChart';
import { drawDataState, relatedDataState } from '../pages';

export function OutputMenu() {
  const selectedObject = useRecoilValue(selectedObjectState);
  const relatedData = useRecoilValue(relatedDataState);

  if (selectedObject == null) {
    return <div>ノードやエッジをクリックしてください</div>;
  }

  if (selectedObject.type == 'shape') {
    console.log('ノード');
  } else {
    console.log('エッジ');
    function getSourceTarget() {
      function getName(element) {
        return element.text[0][1];
      }
      return [getName(selectedObject.source), getName(selectedObject.target)];
    }
    const sourceTarget = getSourceTarget();
    console.log(sourceTarget);
  }

  console.log(selectedObject);
  return (
    <div>
      <div>結果</div>
      <div>{selectedObject.id}</div>
    </div>
  );
}
