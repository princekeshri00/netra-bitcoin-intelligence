import { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import type { GraphNode, GraphResponse, RiskLevel } from '../types';
import { fetchGraphNeighborhood } from '../api/client';
import RiskBadge from './RiskBadge';
import { Search, RefreshCw, ZoomIn, ZoomOut, Cpu, Download, GitBranch } from 'lucide-react';

const nodeColor: Record<string, string> = {
  wallet: '#06B6D4',
  transaction: '#8B5CF6',
  ip: '#F59E0B',
  cluster: '#3B82F6',
};

export default function GraphExplorerView({
  alertId = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  onSelectAlert,
}: {
  alertId?: string;
  onSelectAlert?: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutName, setLayoutName] = useState<'cose' | 'circle' | 'concentric' | 'breadthfirst'>('cose');
  const [depth, setDepth] = useState<number>(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchGraphNeighborhood(alertId, depth).then((res) => {
      setGraphData(res);
      setLoading(false);
    });
  }, [alertId, depth]);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    const filteredNodes = graphData.nodes.filter(
      (n) => (searchQuery ? n.label.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    );

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = graphData.edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...filteredNodes.map((n) => ({
          data: { id: n.id, label: n.label, type: n.type, rawNode: n },
        })),
        ...filteredEdges.map((e, i) => ({
          data: { id: e.id || `e${i}`, source: e.source, target: e.target, relation: e.type, amount: e.data?.amount },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': (ele: any) => nodeColor[ele.data('type')] ?? '#64748B',
            label: 'data(label)',
            color: '#E2E8F0',
            'font-size': '11px',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            width: 38,
            height: 38,
            'border-width': (ele: any) => (ele.data('id') === alertId ? 3 : 0),
            'border-color': '#EF4444',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#475569',
            'target-arrow-color': '#475569',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: (ele: any) => (ele.data('amount') ? `${ele.data('relation')} (${ele.data('amount')} BTC)` : ele.data('relation')),
            'font-size': '9px',
            color: '#94A3B8',
          },
        },
        {
          selector: ':selected',
          style: {
            'border-width': 4,
            'border-color': '#06B6D4',
            'background-color': '#0891B2',
          },
        },
      ],
      layout: { name: layoutName, animate: true, padding: 50 },
    });

    cy.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data('rawNode');
      setSelectedNode(nodeData);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;

    return () => cy.destroy();
  }, [graphData, layoutName, searchQuery]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleReset = () => cyRef.current?.fit();

  if (loading) {
    return <div className="p-8 font-mono text-slate-400">Loading K-Hop Subgraph Neighborhood...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-md">
        <div>
          <h1 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-cyan-400" />
            GET /api/v1/graph/neighborhood/ · Cytoscape Subgraph
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            K-Hop Neighborhood traversal centered around entity: <span className="text-cyan-300 font-bold">{alertId}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Depth Selector */}
          <select
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-xs font-mono rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value={1}>1-Hop Subgraph</option>
            <option value={2}>2-Hop Subgraph</option>
            <option value={3}>3-Hop Subgraph</option>
            <option value={4}>4-Hop Subgraph</option>
          </select>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs font-mono rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          {/* Layout Selector */}
          <select
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-xs font-mono rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="cose">COSE Physics Layout</option>
            <option value="circle">Circular Layout</option>
            <option value="concentric">Concentric Layout</option>
            <option value="breadthfirst">Breadthfirst Tree</option>
          </select>

          {/* Zoom Buttons */}
          <button
            onClick={handleZoomIn}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg border border-slate-700 text-xs"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg border border-slate-700 text-xs"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg border border-slate-700 text-xs"
            title="Reset Fit"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-lg h-[520px]">
          {/* Canvas Container */}
          <div ref={containerRef} className="h-full w-full bg-slate-950" />

          {/* Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm border border-slate-800 p-3 rounded-lg text-xs font-mono space-y-1.5 shadow-md">
            <div className="text-[10px] uppercase font-bold text-slate-400">Node Types Legend</div>
            <div className="flex items-center gap-3 text-slate-300">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#0E7490]" /> Wallet</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#1C2C47]" /> Transaction</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#B4390A]" /> IP Relay</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-sm font-semibold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Entity Node Inspector</span>
              {typeof selectedNode?.data?.risk_level === 'string' &&
                ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(selectedNode.data.risk_level) && (
                  <RiskBadge level={selectedNode.data.risk_level as RiskLevel} />
                )}
            </h3>

            {selectedNode ? (
              <div className="mt-4 space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Entity Identifier</span>
                  <span className="font-bold text-cyan-300 break-all text-sm">{selectedNode.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Type</span>
                    <span className="font-bold text-white capitalize">{selectedNode.type}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Risk Score</span>
                    <span className="font-bold text-rose-400">
                      {typeof selectedNode.data?.risk_score === 'number'
                        ? selectedNode.data.risk_score
                        : 'N/A'}
                      /100
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-12 text-center text-slate-500 text-xs font-mono space-y-2">
                <Cpu className="h-8 w-8 mx-auto text-slate-600 animate-pulse" />
                <p>Click on any node in the graph topology to inspect attributes.</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4">
            <button
              onClick={() => window.alert('Exporting Neighborhood Graph JSON...')}
              className="w-full bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 py-2 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" /> Export Subgraph JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
