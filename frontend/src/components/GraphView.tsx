import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { GraphData } from '../types';

const riskColor: Record<string, string> = {
  CRITICAL: '#F43F5E',
  HIGH: '#F97316',
  MEDIUM: '#F59E0B',
  LOW: '#10B981',
};

const typeColor: Record<string, string> = {
  wallet: '#06B6D4',
  transaction: '#8B5CF6',
  ip: '#F59E0B',
  cluster: '#3B82F6',
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
            risk_level: (n.data as any)?.risk_level,
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
            'background-color': (ele: any) =>
              riskColor[ele.data('risk_level')] ?? typeColor[ele.data('type')] ?? '#06B6D4',
            label: 'data(label)',
            color: '#F8FAFC',
            'font-size': '10px',
            'font-family': 'ui-monospace, monospace',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: 36,
            height: 36,
            'border-width': (ele: any) => (ele.data('id') === focusId ? 4 : 2),
            'border-color': (ele: any) => (ele.data('id') === focusId ? '#22D3EE' : 'rgba(255, 255, 255, 0.2)'),
            'overlay-opacity': 0,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#334155',
            'target-arrow-color': '#64748B',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(type)',
            'font-size': '8px',
            'font-family': 'ui-monospace, monospace',
            color: '#64748B',
            'text-rotation': 'autorotate',
            'text-background-color': '#0B0F19',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#38BDF8',
            'border-width': 4,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 400,
        padding: 40,
        componentSpacing: 60,
      },
    });

    return () => cy.destroy();
  }, [data, focusId]);

  return <div ref={containerRef} className="h-full w-full bg-[#05080F]" />;
}
