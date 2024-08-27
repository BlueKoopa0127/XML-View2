import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { selectedObjectStateL, selectedObjectStateR } from './drawChart';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectedRelationState } from './outputMenu';
import { frgDataState } from './inputManu';

export default function AutoDrawChart({ data }) {
  const cyRef = useRef(null);
  cytoscape.use(cola); // register extension

  const [selectedObjectL, setSelectedObjectL] =
    useRecoilState(selectedObjectStateL);

  const [selectedObjectR, setSelectedObjectR] =
    useRecoilState(selectedObjectStateR);

  const frg = useRecoilValue(frgDataState);

  const [selectedRelation, setSelectedRelation] = useRecoilState(
    selectedRelationState,
  );
  const prevSelectedrelation = usePrevious(selectedRelation);

  const [cy, setCy] = useState(null); // Cytoscape.jsオブジェクトを状態として保持
  console.log(cy);

  useEffect(() => {
    if (selectedObjectR && frg) {
      const list = frg[selectedObjectR?.text];

      if (list) {
        const a = cy.nodes().filter((e) => list.has(e.id()));
        console.log(a);
      }
    }
  }, [selectedObjectR]);

  useEffect(() => {
    if (prevSelectedrelation) {
      cy.edges(`edge[id = "${prevSelectedrelation.id}"]`)?.removeClass(
        'selectedEdge',
      );
    }
    if (selectedRelation) {
      cy.edges(`edge[id = "${selectedRelation.id}"]`)?.addClass('selectedEdge');
    }
  }, [selectedRelation]);

  useEffect(() => {
    if (data.length != 0) {
      console.log('GRAPH DATA', data);
      const nodes = data.nodes().map((e) => {
        const node = data.node(e);
        const parent = data.parent(e);

        return {
          group: 'nodes',
          classes: [],
          data: { id: e, label: e, parent: parent },
          // position: { x: node.x, y: node.y },
        };
      });
      const edges = data.edges().map((e) => {
        // console.log(e);
        const edge = data.edge(e.v, e.w);
        return {
          group: 'edges',
          classes: [],
          data: {
            id: e.v + '-' + e.w,
            source: e.v,
            target: e.w,
            reference: edge,
          },
        };
      });
      const elements = nodes.concat(edges);

      const cy = cytoscape({
        container: cyRef.current,
        elements: elements,
        style: style,
        layout: {
          name: 'preset',
        },
        wheelSensitivity: 0.5,
      });

      setCy(cy);

      console.log(selectedRelation);

      cy.nodes().on('click', (event) => {
        event.stopPropagation();
        const node = event.target;

        setSelectedObjectL((prevSelectedObjectL) => {
          // 前回の選択が現在のノードである場合
          if (prevSelectedObjectL?.id === node.id()) {
            // 以前の選択を解除
            node.removeClass('selected');
            return null;
          } else {
            // 前回の選択を新しい選択に変更
            if (prevSelectedObjectL) {
              cy.nodes(`node[id = "${prevSelectedObjectL.id}"]`)?.removeClass(
                'selected',
              );
              cy.edges(`edge[id = "${prevSelectedObjectL.id}"]`)?.removeClass(
                'selectedEdge',
              );
            }
            node.addClass('selected');
            return {
              ...node.data(),
              edges: node.connectedEdges().map((e) => e.data()),
            };
          }
        });
        console.log('node clicked', node.data(), node);
      });
      cy.edges().on('click', (event) => {
        const edge = event.target;

        setSelectedObjectL((prevSelectedObjectL) => {
          if (prevSelectedObjectL?.id === edge.id()) {
            edge.removeClass('selectedEdge');
            return null;
          } else {
            if (prevSelectedObjectL) {
              cy.nodes(`node[id = "${prevSelectedObjectL.id}"]`)?.removeClass(
                'selected',
              );
              cy.edges(`edge[id = "${prevSelectedObjectL.id}"]`)?.removeClass(
                'selectedEdge',
              );
            }
            edge.addClass('selectedEdge');
            return edge.data();
          }
        });
        console.log('edge clicked', edge.data(), edge);
      });

      cy.layout({
        name: 'cola',
        randomize: false,
        fit: true,
        maxSimulationTime: 1000,
        nodeSpacing: 20,
        convergenceThreshold: 0.01,
      }).run();

      return () => {
        cy.destroy();
      };
    }
  }, [data]);

  return (
    <div
      style={{ backgroundColor: '#eee', width: '100%', height: '100%' }}
      ref={cyRef}
    />
  );
}

const style = [
  {
    selector: 'node',
    style: {
      'background-color': '#00FFFF',
      label: 'data(label)',
      opacity: 1,
    },
  },

  {
    selector: '$node > node',
    style: {
      'background-color': '#00DD00',
      label: 'data(label)',
    },
  },
  {
    selector: 'edge',
    style: {
      width: 1,
      'line-color': '#aaa',
      'target-arrow-color': '#aaa',
      'target-arrow-shape': 'triangle',
      'curve-style': 'straight',
      opacity: 0.8,
    },
  },
  {
    selector: '.selected',
    style: {
      'background-color': '#FF0000',
      label: 'data(label)',
      opacity: 1,
    },
  },
  {
    selector: '.selectedEdge',
    style: {
      width: 1,
      'line-color': '#AA0000',
      'target-arrow-color': '#AA0000',
      'target-arrow-shape': 'triangle',
      'curve-style': 'straight',
      opacity: 0.8,
    },
  },
  {
    selector: '.parent',
    style: {
      'background-color': '#EEEE00',
    },
  },
  {
    selector: '.removed',
    style: {
      'background-color': '#ff0000',
    },
  },
  {
    selector: '.removedEdge',
    style: {
      'line-color': '#ff0000',
      'target-arrow-color': '#ff0000',
      'target-arrow-shape': 'triangle',
      'curve-style': 'straight',
      width: 1,
      opacity: 0.5,
    },
  },
];

function usePrevious(value) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
