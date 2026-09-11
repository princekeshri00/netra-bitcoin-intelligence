import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { GraphData } from '../types';

const riskColor: Record<string, string> = {
  CRITICAL: '#7A1611',
  HIGH: '#A3311A',
  MEDIUM: '#8A6A17',
  LOW: '#2E6B47',
};
const typeColor: Record<string, string> = {
  wallet: '#1B2A45',
  transaction: '#B5651D',
};

export default function GraphView({ data, focusId }: { data: GraphData; focusId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...data.nodes.map((n) => ({
          data: {
            id: n.id,
            label: n.label,
            type: n.type,
            risk_level: n.data?.risk_level,
          },
        })),
        ...data.edges.map((e) => ({
          data: { id: e.id, source: e.source, target: e.target, type: e.type },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            // risk color takes priority over entity-type color when present
            'background-color': (ele: any) =>
              riskColor[ele.data('risk_level')] ?? typeColor[ele.data('type')] ?? '#94A3B8',
            label: 'data(label)',
            color: '#1E2430',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: 34,
            height: 34,
            'border-width': (ele: any) => (ele.data('id') === focusId ? 3 : 0),
            'border-color': '#7A1611',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#CBD5E1',
            'target-arrow-color': '#CBD5E1',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(type)',
            'font-size': '8px',
            color: '#94A3B8',
          },
        },
      ],
      layout: { name: 'cose', animate: false, padding: 40 },
    });

    return () => cy.destroy();
  }, [data, focusId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
