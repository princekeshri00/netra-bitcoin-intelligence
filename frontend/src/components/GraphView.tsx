import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { GraphData } from '../types';

// Minimalist Dark Architectural Palette (Non-garish, restrained, high-fidelity)
const getMinimalistNodeStyle = (type: string, riskLevel?: string, isFocus?: boolean) => {
  if (isFocus) {
    return {
      bg: '#1C1318',
      border: '#F43F5E', // Muted crimson focus indicator
      borderWidth: 2.5,
      shape: 'ellipse' as const,
      size: 38,
      labelColor: '#F87171',
    };
  }

  if (type === 'transaction') {
    return {
      bg: '#0F172A',
      border: '#475569',
      borderWidth: 1.5,
      shape: 'diamond' as const,
      size: 24,
      labelColor: '#94A3B8',
    };
  }

  if (type === 'ip') {
    return {
      bg: '#09221C',
      border: '#0D9488',
      borderWidth: 1.5,
      shape: 'hexagon' as const,
      size: 26,
      labelColor: '#5EEAD4',
    };
  }

  if (type === 'cluster') {
    return {
      bg: '#18182E',
      border: '#6366F1',
      borderWidth: 1.5,
      shape: 'round-rectangle' as const,
      size: 30,
      labelColor: '#A5B4FC',
    };
  }

  // Wallet nodes based on risk tier
  switch (riskLevel) {
    case 'CRITICAL':
      return {
        bg: '#211417',
        border: '#E11D48',
        borderWidth: 2,
        shape: 'ellipse' as const,
        size: 32,
        labelColor: '#FDA4AF',
      };
    case 'HIGH':
      return {
        bg: '#211812',
        border: '#EA580C',
        borderWidth: 1.8,
        shape: 'ellipse' as const,
        size: 30,
        labelColor: '#FDBA74',
      };
    case 'MEDIUM':
      return {
        bg: '#1E1B13',
        border: '#D97706',
        borderWidth: 1.5,
        shape: 'ellipse' as const,
        size: 28,
        labelColor: '#FDE68A',
      };
    case 'LOW':
    default:
      return {
        bg: '#0F172A',
        border: '#334155',
        borderWidth: 1.5,
        shape: 'ellipse' as const,
        size: 26,
        labelColor: '#94A3B8',
      };
  }
};

export default function GraphView({ data, focusId }: { data: GraphData; focusId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...data.nodes.map((n) => {
          const isFocus = Boolean(n.id === focusId || (focusId && n.label && n.label.includes(focusId)));
          const riskLevel = (n.data as any)?.risk_level;
          const styleMeta = getMinimalistNodeStyle(n.type, riskLevel, isFocus);

          return {
            data: {
              id: n.id,
              label: n.label.length > 18 ? `${n.label.slice(0, 7)}...${n.label.slice(-5)}` : n.label,
              fullLabel: n.label,
              type: n.type,
              risk_level: riskLevel,
              isFocus: isFocus ? 'true' : 'false',
              nodeBg: styleMeta.bg,
              nodeBorder: styleMeta.border,
              nodeBorderWidth: styleMeta.borderWidth,
              nodeShape: styleMeta.shape,
              nodeSize: styleMeta.size,
              nodeLabelColor: styleMeta.labelColor,
            },
          };
        }),
        ...data.edges.map((e, idx) => ({
          data: {
            id: e.id || `edge_${idx}`,
            source: e.source,
            target: e.target,
            type: e.type,
            amount: (e.data as any)?.amount,
          },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(nodeBg)',
            'border-color': 'data(nodeBorder)',
            'border-width': 'data(nodeBorderWidth)',
            shape: 'data(nodeShape)' as any,
            width: 'data(nodeSize)',
            height: 'data(nodeSize)',
            label: 'data(label)',
            color: 'data(nodeLabelColor)',
            'font-size': '9px',
            'font-family': 'ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace',
            'font-weight': 500,
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'text-background-color': '#090D16',
            'text-background-opacity': 0.85,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'overlay-opacity': 0,
            'transition-property': 'opacity, border-width, border-color',
            'transition-duration': 0.25,
          },
        },
        {
          selector: 'node[isFocus = "true"]',
          style: {
            'border-color': '#F43F5E',
            'border-width': 3,
            'border-style': 'solid',
            'underlay-color': '#F43F5E',
            'underlay-padding': 3,
            'underlay-opacity': 0.3,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.2,
            'line-color': '#283344',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.8,
            'curve-style': 'bezier',
            'opacity': 0.65,
            'transition-property': 'opacity, line-color, width',
            'transition-duration': 0.25,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#38BDF8',
            'border-width': 3,
            'underlay-color': '#38BDF8',
            'underlay-padding': 3,
            'underlay-opacity': 0.35,
          },
        },
        {
          selector: '.highlighted',
          style: {
            opacity: 1,
            'line-color': '#38BDF8',
            'target-arrow-color': '#38BDF8',
            width: 2,
          },
        },
        {
          selector: '.dimmed',
          style: {
            opacity: 0.18,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        padding: 50,
        // Spacious topology parameters
        componentSpacing: 160,
        nodeRepulsion: 3500000,
        idealEdgeLength: 130,
        edgeElasticity: 28,
        gravity: 0.2,
        nestingFactor: 1.2,
        numIter: 1000,
        nodeOverlap: 8,
      },
    });

    // Creative interaction: hover / tap focus neighborhood highlighting
    cy.on('mouseover', 'node', (e) => {
      const node = e.target;
      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass('dimmed');
      neighborhood.removeClass('dimmed');
      node.connectedEdges().addClass('highlighted');
    });

    cy.on('mouseout', 'node', () => {
      cy.elements().removeClass('dimmed');
      cy.edges().removeClass('highlighted');
    });

    return () => cy.destroy();
  }, [data, focusId]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-[#080C14] relative overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}
