import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import type { GraphNode, GraphResponse, RiskLevel } from '../types';
import { fetchGraphNeighborhood } from '../api/client';
import RiskBadge from './RiskBadge';
import {
  Search,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Cpu,
  Download,
  GitBranch,
  Copy,
  Check,
  ExternalLink,
  Crosshair,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

// Minimalist Dark Palette
const getNodeAppearance = (type: string, riskLevel?: string, isCenter?: boolean) => {
  if (isCenter) {
    return {
      bg: '#1C1318',
      border: '#F43F5E',
      borderWidth: 2.5,
      shape: 'ellipse' as const,
      size: 40,
      labelColor: '#F87171',
    };
  }

  if (type === 'transaction') {
    return {
      bg: '#0F172A',
      border: '#475569',
      borderWidth: 1.5,
      shape: 'diamond' as const,
      size: 26,
      labelColor: '#94A3B8',
    };
  }

  if (type === 'ip') {
    return {
      bg: '#09221C',
      border: '#0D9488',
      borderWidth: 1.5,
      shape: 'hexagon' as const,
      size: 28,
      labelColor: '#5EEAD4',
    };
  }

  if (type === 'cluster') {
    return {
      bg: '#18182E',
      border: '#6366F1',
      borderWidth: 1.5,
      shape: 'round-rectangle' as const,
      size: 32,
      labelColor: '#A5B4FC',
    };
  }

  // Wallets categorized by risk
  switch (riskLevel) {
    case 'CRITICAL':
      return {
        bg: '#211417',
        border: '#E11D48',
        borderWidth: 2,
        shape: 'ellipse' as const,
        size: 34,
        labelColor: '#FDA4AF',
      };
    case 'HIGH':
      return {
        bg: '#211812',
        border: '#EA580C',
        borderWidth: 1.8,
        shape: 'ellipse' as const,
        size: 32,
        labelColor: '#FDBA74',
      };
    case 'MEDIUM':
      return {
        bg: '#1E1B13',
        border: '#D97706',
        borderWidth: 1.5,
        shape: 'ellipse' as const,
        size: 30,
        labelColor: '#FDE68A',
      };
    case 'LOW':
    default:
      return {
        bg: '#0F172A',
        border: '#334155',
        borderWidth: 1.5,
        shape: 'ellipse' as const,
        size: 28,
        labelColor: '#94A3B8',
      };
  }
};

export default function GraphExplorerView({
  alertId = 'cf1b4045-9e56-47fe-83a3-4ec44f2b6a4c',
  onSelectAlert,
}: {
  alertId?: string;
  onSelectAlert?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [centerId, setCenterId] = useState(alertId);
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'circle' | 'breadthfirst'>('cose');
  const [depth, setDepth] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setCenterId(alertId);
  }, [alertId]);

  useEffect(() => {
    setLoading(true);
    fetchGraphNeighborhood(centerId, depth).then((res) => {
      setGraphData(res);
      setLoading(false);
      setSelectedNode(null);
    });
  }, [centerId, depth]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    const filteredNodes = graphData.nodes.filter((n) =>
      searchQuery ? n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = graphData.edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...filteredNodes.map((n) => {
          const isCenter = Boolean(n.id === centerId || (centerId && n.label && n.label.includes(centerId)));
          const riskLevel = (n.data as any)?.risk_level;
          const styleMeta = getNodeAppearance(n.type, riskLevel, isCenter);

          return {
            data: {
              id: n.id,
              label: n.label.length > 20 ? `${n.label.slice(0, 8)}...${n.label.slice(-5)}` : n.label,
              fullLabel: n.label,
              type: n.type,
              risk_level: riskLevel,
              rawNode: n,
              isCenter: isCenter ? 'true' : 'false',
              nodeBg: styleMeta.bg,
              nodeBorder: styleMeta.border,
              nodeBorderWidth: styleMeta.borderWidth,
              nodeShape: styleMeta.shape,
              nodeSize: styleMeta.size,
              nodeLabelColor: styleMeta.labelColor,
            },
          };
        }),
        ...filteredEdges.map((e, i) => ({
          data: {
            id: e.id || `e${i}`,
            source: e.source,
            target: e.target,
            relation: e.type,
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
            'font-size': '9.5px',
            'font-family': 'ui-monospace, "JetBrains Mono", monospace',
            'font-weight': 500,
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'text-background-color': '#070A10',
            'text-background-opacity': 0.85,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'overlay-opacity': 0,
            'transition-property': 'opacity, border-width, border-color',
            'transition-duration': 0.25,
          },
        },
        {
          selector: 'node[isCenter = "true"]',
          style: {
            'border-color': '#F43F5E',
            'border-width': 3,
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
            opacity: 0.65,
            label: (ele: any) =>
              ele.data('amount') ? `${ele.data('amount')} BTC` : ele.data('relation') || '',
            'font-size': '8px',
            'font-family': 'ui-monospace, "JetBrains Mono", monospace',
            color: '#64748B',
            'text-rotation': 'autorotate',
            'text-background-color': '#070A10',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
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
            opacity: 0.16,
          },
        },
      ],
      layout: getLayoutOptions(layoutName),
    });

    // Tap node handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const nodeData = node.data('rawNode');
      setSelectedNode(nodeData);

      // Highlight neighborhood
      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass('dimmed');
      neighborhood.removeClass('dimmed');
      node.connectedEdges().addClass('highlighted');
    });

    // Tap background handler
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
        cy.elements().removeClass('dimmed');
        cy.edges().removeClass('highlighted');
      }
    });

    // Hover effect
    cy.on('mouseover', 'node', (evt) => {
      if (!selectedNode) {
        const node = evt.target;
        const neighborhood = node.neighborhood().add(node);
        cy.elements().addClass('dimmed');
        neighborhood.removeClass('dimmed');
        node.connectedEdges().addClass('highlighted');
      }
    });

    cy.on('mouseout', 'node', () => {
      if (!selectedNode) {
        cy.elements().removeClass('dimmed');
        cy.edges().removeClass('highlighted');
      }
    });

    cyRef.current = cy;

    return () => cy.destroy();
  }, [graphData, layoutName, searchQuery, centerId]);

  function getLayoutOptions(name: string) {
    switch (name) {
      case 'concentric':
        return {
          name: 'concentric',
          animate: true,
          animationDuration: 500,
          padding: 60,
          minNodeSpacing: 80,
          spacingFactor: 1.8,
          concentric: (node: any) => (node.data('isCenter') === 'true' ? 10 : 2),
          levelWidth: () => 1,
        };
      case 'circle':
        return {
          name: 'circle',
          animate: true,
          animationDuration: 500,
          padding: 60,
          spacingFactor: 1.7,
        };
      case 'breadthfirst':
        return {
          name: 'breadthfirst',
          animate: true,
          animationDuration: 500,
          padding: 60,
          spacingFactor: 1.8,
          directed: true,
        };
      case 'cose':
      default:
        return {
          name: 'cose',
          animate: true,
          animationDuration: 600,
          padding: 60,
          // Extra spacious physical repulsion parameters
          componentSpacing: 180,
          nodeRepulsion: 4200000,
          idealEdgeLength: 150,
          edgeElasticity: 24,
          gravity: 0.18,
          nestingFactor: 1.2,
          numIter: 1000,
          nodeOverlap: 6,
        };
    }
  }

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleReset = () => cyRef.current?.fit(undefined, 50);

  const handleExportJson = () => {
    if (!graphData) return;
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subgraph_${centerId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !graphData) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="font-mono text-sm text-cyan-400/80">Calculating Topological Subgraph Neighborhood...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Minimalist Top Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B0F19]/90 backdrop-blur-md p-4 rounded-xl border border-slate-800/80 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-slate-900 text-slate-300 border border-slate-700/60">
              <GitBranch className="h-3 w-3 text-cyan-400" /> Graph Engine
            </span>
            <span className="text-xs font-mono text-slate-500">/api/v1/graph/neighborhood/</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white font-mono">
              Ego Subgraph Centered on
            </h1>
            <span className="font-mono text-sm text-rose-400 font-semibold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30 truncate max-w-[220px]" title={centerId}>
              {centerId}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Depth Selector */}
          <select
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="bg-slate-950 border border-slate-800 text-xs font-mono rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value={1}>1-Hop Subgraph</option>
            <option value={2}>2-Hop Subgraph</option>
            <option value={3}>3-Hop Subgraph</option>
          </select>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-mono rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 w-40 transition-colors"
            />
          </div>

          {/* Layout Selector */}
          <select
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs font-mono rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
          >
            <option value="cose">COSE Physics Layout (Spacious)</option>
            <option value="concentric">Concentric Rings</option>
            <option value="circle">Circular Boundary</option>
            <option value="breadthfirst">Breadthfirst Tree</option>
          </select>

          {/* Zoom Buttons */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="hover:bg-slate-800 text-slate-300 p-2 text-xs transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="hover:bg-slate-800 text-slate-300 p-2 text-xs border-l border-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleReset}
              className="hover:bg-slate-800 text-slate-300 p-2 text-xs border-l border-slate-800 transition-colors"
              title="Reset View"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Graph Topology Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-[#090C14] border border-slate-800/80 rounded-xl overflow-hidden relative shadow-lg h-[560px]">
          {/* Canvas Container */}
          <div
            ref={containerRef}
            className="h-full w-full"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Minimalist Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-[#0B0F19]/90 backdrop-blur-md border border-slate-800/90 p-3 rounded-lg text-xs font-mono space-y-2 shadow-lg">
            <div className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider">Topology Geometry Key</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-300 text-[11px]">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1C1318] border border-[#F43F5E]" />
                <span>Seed Entity</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#0F172A] border border-[#475569] rotate-45" />
                <span>Transaction</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#211417] border border-[#E11D48]" />
                <span>Critical Wallet</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#211812] border border-[#EA580C]" />
                <span>High Risk Wallet</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F172A] border border-[#334155]" />
                <span>Standard Wallet</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#09221C] border border-[#0D9488]" />
                <span>IP Relay Node</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="lg:col-span-4 bg-[#0B0F19]/90 backdrop-blur-md border border-slate-800/80 rounded-xl p-5 shadow-lg space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800/80 pb-3 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Node Forensic Inspector
              </span>
              {typeof selectedNode?.data?.risk_level === 'string' &&
                ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(selectedNode.data.risk_level) && (
                  <RiskBadge level={selectedNode.data.risk_level as RiskLevel} />
                )}
            </div>

            {selectedNode ? (
              <div className="mt-4 space-y-4 text-xs font-mono">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90 space-y-1">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Entity Hash</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-cyan-300 break-all text-xs font-mono">{selectedNode.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedNode.id)}
                      className="text-slate-400 hover:text-white p-1 shrink-0"
                      title="Copy Entity ID"
                    >
                      {copiedId === selectedNode.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Node Type</span>
                    <span className="font-bold text-white capitalize text-sm mt-0.5 block">{selectedNode.type}</span>
                  </div>
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-slate-500 block text-[10px] uppercase">Risk Tier Score</span>
                    <span className="font-bold text-rose-400 text-sm mt-0.5 block">
                      {typeof selectedNode.data?.risk_score === 'number' ? selectedNode.data.risk_score : 'N/A'}
                      <span className="text-slate-500 text-[10px]">/100</span>
                    </span>
                  </div>
                </div>

                {/* Focus as Center Seed Action */}
                <button
                  onClick={() => setCenterId(selectedNode.id)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 py-2.5 rounded-xl text-xs font-mono font-medium border border-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Crosshair className="h-3.5 w-3.5 text-rose-400" /> Re-Center Subgraph Here
                </button>

                {onSelectAlert && selectedNode.type === 'wallet' && (
                  <button
                    onClick={() => onSelectAlert(selectedNode.id)}
                    className="w-full bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 py-2.5 rounded-xl text-xs font-mono font-medium border border-cyan-500/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Investigate Lead Dossier <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-16 text-center text-slate-500 text-xs font-mono space-y-3">
                <Crosshair className="h-8 w-8 mx-auto text-slate-700 animate-pulse" />
                <p>Click on any node in the topology canvas to inspect forensic properties and re-center the ego subgraph.</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <button
              onClick={handleExportJson}
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/90 py-2.5 rounded-xl text-xs font-mono font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4 text-slate-400" /> Export Subgraph (JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
