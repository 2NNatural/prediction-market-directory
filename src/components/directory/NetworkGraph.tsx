'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { forceCenter } from 'd3-force';
import { CONTENT_TAGS } from '@/types';
import type { Application, ContentTag } from '@/types';

// ─── Types ───────────────────────────────────────────────────────

interface HubNodeData {
  isHub: true;
  label: string;
  tag: ContentTag;
}

interface AppNodeData {
  isHub: false;
  app: Application;
}

type GraphNodeData = HubNodeData | AppNodeData;
type GraphNode = NodeObject<GraphNodeData>;

interface GraphLink {
  source: string;
  target: string;
}

// ─── Props ───────────────────────────────────────────────────────

interface NetworkGraphProps {
  apps: Application[];
  onNodeClick: (app: Application) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────

function hubId(tag: string) {
  return `hub-${tag.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
}

function buildGraphData(apps: Application[], selectedCategory: ContentTag | null) {
  const filtered = selectedCategory
    ? apps.filter((a) => a.content_tags.includes(selectedCategory))
    : apps;

  // Collect tags that actually have apps
  const activeTags = new Set<ContentTag>();
  for (const app of filtered) {
    for (const tag of app.content_tags) {
      if ((CONTENT_TAGS as readonly string[]).includes(tag)) {
        activeTags.add(tag);
      }
    }
  }

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Hub nodes
  for (const tag of activeTags) {
    nodes.push({ id: hubId(tag), isHub: true, label: tag.toUpperCase(), tag });
  }

  // App nodes + edges
  for (const app of filtered) {
    nodes.push({ id: app.id, isHub: false, app });
    for (const tag of app.content_tags) {
      if (activeTags.has(tag)) {
        links.push({ source: app.id, target: hubId(tag) });
      }
    }
  }

  return { nodes, links };
}

// ─── Component ───────────────────────────────────────────────────

export function NetworkGraph({ apps, onNodeClick }: NetworkGraphProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ContentTag | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink>>(undefined);

  useEffect(() => { setMounted(true); }, []);

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Build graph data
  const graphData = useMemo(
    () => buildGraphData(apps, selectedCategory),
    [apps, selectedCategory],
  );

  // Density calculation
  const density = useMemo(() => {
    const appCount = graphData.nodes.filter((n) => !n.isHub).length;
    const hubCount = graphData.nodes.filter((n) => n.isHub).length;
    const maxEdges = appCount * hubCount;
    if (maxEdges === 0) return 0;
    return graphData.links.length / maxEdges;
  }, [graphData]);

  // Category tabs: only tags that have at least one app
  const availableTags = useMemo(() => {
    const tagSet = new Set<ContentTag>();
    for (const app of apps) {
      for (const tag of app.content_tags) {
        if ((CONTENT_TAGS as readonly string[]).includes(tag)) {
          tagSet.add(tag);
        }
      }
    }
    return CONTENT_TAGS.filter((t) => tagSet.has(t));
  }, [apps]);

  // Configure forces after mount
  useEffect(() => {
    if (!fgRef.current || !mounted) return;
    const fg = fgRef.current;
    const charge = fg.d3Force('charge');
    if (charge && typeof charge.strength === 'function') {
      charge.strength(-200);
    }
    const link = fg.d3Force('link');
    if (link && typeof link.distance === 'function') {
      link.distance(120);
    }
    fg.d3Force('center', forceCenter(dimensions.width / 2, dimensions.height / 2) as unknown as Parameters<typeof fg.d3Force>[1]);
    fg.d3ReheatSimulation();
  }, [mounted, dimensions.width, dimensions.height, graphData]);

  // Node rendering
  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      if (node.isHub) {
        // Halo ring
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Filled circle
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, 2 * Math.PI);
        ctx.fillStyle = '#C0C0C0';
        ctx.fill();

        // Label above
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(node.label, x, y - 18);
      } else {
        const isHovered = hoveredNode?.id === node.id;

        // Filled circle
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = '#0A0A0A';
        ctx.fill();

        if (isHovered) {
          // Hover ring
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.strokeStyle = '#0A0A0A';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // App name below
          ctx.font = '500 10px Inter, system-ui, sans-serif';
          ctx.fillStyle = '#555';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(node.app.name, x, y + 12);
        }
      }
    },
    [hoveredNode],
  );

  // Pointer area (larger hit target)
  const nodePointerAreaPaint = useCallback(
    (node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      ctx.beginPath();
      ctx.arc(x, y, node.isHub ? 20 : 10, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [],
  );

  // Click handler
  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (!node.isHub) {
        onNodeClick(node.app);
      }
    },
    [onNodeClick],
  );

  // Hover handler
  const handleNodeHover = useCallback(
    (node: GraphNode | null) => {
      setHoveredNode(node);
    },
    [],
  );

  return (
    <div className="flex flex-col gap-0">
      {/* Category tabs */}
      <div className="flex items-center gap-4 px-1 pb-4 overflow-x-auto">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`text-sm font-medium uppercase tracking-[0.05em] whitespace-nowrap pb-1 border-b-2 transition-colors ${
            selectedCategory === null
              ? 'text-[#0A0A0A] border-[#0A0A0A]'
              : 'text-gray-400 border-transparent hover:text-gray-600'
          }`}
        >
          All Nodes
        </button>
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedCategory(tag)}
            className={`text-sm font-medium uppercase tracking-[0.05em] whitespace-nowrap pb-1 border-b-2 transition-colors ${
              selectedCategory === tag
                ? 'text-[#0A0A0A] border-[#0A0A0A]'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Graph container */}
      <div
        ref={containerRef}
        className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] overflow-hidden"
        style={{ height: 'calc(100vh - 340px)', minHeight: 400 }}
      >
        {mounted && dimensions.width > 0 && dimensions.height > 0 && (
          <ForceGraph2D
            key={`${dimensions.width}-${dimensions.height}`}
            ref={fgRef as React.MutableRefObject<ForceGraphMethods<GraphNode, GraphLink> | undefined>}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor="transparent"
            nodeLabel=""
            nodeCanvasObjectMode={() => 'replace'}
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={nodePointerAreaPaint}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            linkColor={() => 'rgba(0,0,0,0.08)'}
            linkWidth={0.5}
            linkLineDash={() => [4, 4]}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            cooldownTicks={100}
            warmupTicks={50}
            enableNodeDrag={true}
          />
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-2 pt-3 text-xs text-gray-400 uppercase tracking-[0.05em]">
        <div className="flex items-center gap-1.5">
          <span>Network Density</span>
          <span className="text-[#0A0A0A] font-medium">{density.toFixed(3)}</span>
          <span>Index</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#0A0A0A]" />
            Market Node
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#C0C0C0]" />
            Category Hub
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t border-dashed border-gray-400" />
            Relationship
          </span>
        </div>
      </div>
    </div>
  );
}

export default NetworkGraph;
