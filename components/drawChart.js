import { useRecoilValue } from 'recoil';
import { drawDataState, relatedDataState } from '../pages';

export function DrawChart() {
  const drawData =
    useRecoilValue(drawDataState)?.mxfile.diagram.mxGraphModel.root.mxCell ??
    [];
  const relatedData = useRecoilValue(relatedDataState);
  console.log(drawData);
  console.log(relatedData);
  return (
    <svg
      viewBox={`0 0 1200 1200`}
      style={{
        backgroundColor: '#ddd',
      }}
    >
      <marker
        id="mu_mh"
        markerUnits="strokeWidth"
        markerWidth="5"
        markerHeight="5"
        viewBox="0 0 10 10"
        refX="5"
        refY="5"
        orient={'auto'}
      >
        <polygon points="0,0 1,5 0,10 6,5 " fill="black" />
      </marker>
      {drawData.map((e, i) => {
        return <div key={i}></div>;
      })}
    </svg>
  );
}
