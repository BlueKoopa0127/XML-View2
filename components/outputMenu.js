import { useRecoilValue } from 'recoil';
import { selectedObjectState, translate } from './drawChart';
import { drawDataState, relatedDataState } from '../pages';

export function OutputMenu() {
  const selectedObject = useRecoilValue(selectedObjectState);
  const drawData = useRecoilValue(drawDataState);
  const relatedData = useRecoilValue(relatedDataState);

  if (selectedObject == null) {
    return <div>ノードやエッジをクリックしてください</div>;
  }

  if ('x' in selectedObject.mxGeometry._attributes) {
    console.log('ノード');
  } else {
    console.log('エッジ');
    function getSourceTarget() {
      let source, target;
      drawData.map((e) => {
        if (selectedObject._attributes.source == e._attributes.id) {
          source = e;
        }
        if (selectedObject._attributes.target == e._attributes.id) {
          target = e;
        }
      });
      function getName(element) {
        return element.text[0][1];
      }
      return [getName(source), getName(target)];
    }
    const sourceTarget = getSourceTarget();
    console.log(sourceTarget);
  }

  console.log(selectedObject);
  return (
    <div>
      <div>結果</div>
      <div>{selectedObject._attributes.id}</div>
    </div>
  );
}
