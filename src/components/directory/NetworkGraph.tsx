'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Application, FilterState } from '@/types';
import { DIMENSION_CONFIGS } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraph2DComponent = any;

const INTERFACE_COLORS: Record<string, string> = {
  'Pro Terminal': '#6366f1',
  'Retail Wrapper': '#22c55e',
  'Social Wrapper': '#f59e0b',
  'Agentic': '#a855f7',
  'Aggregator': '#06b6d4',
};

const DEFAULT_COLOR = '#9ca3af';

const TAG_FIELD_MAP: Record<string, keyof Application> = {
  content: 'content_tags',
  instrument: 'instrument_tags',
  execution: 'execution_tags',
  interface: 'interface_tags',
  resolution: 'resolution_tags',
};

interface NetworkGraphProps {
  apps: Application[];
  searchQuery: string;
  activeFilters: FilterState;
  onNodeClick: (app: Application) => void;
}

interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  app: Application;
  matched: boolean;
}

interface GraphLink {
  source: string;
  target: string;
}

export function NetworkGraph({ apps, searchQuery, onNodeClick }: NetworkGraphProps) {
  const [mounted, setMounted] = useState(false);
  const [ForceGraph, setForceGraph] = useState<ForceGraph2DComponent>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    setMounted(true);
    import('react-force-graph-2d').then((mod) => {
      setForceGraph(() => mod.default);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: 600 });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const graphData = useMemo(() => {
    const lowerQ = searchQuery.toLowerCase();
    const nodes: GraphNode[] = apps.map((app) => {
      let tagCount = 0;
      for (const dim of DIMENSION_CONFIGS) {
        tagCount += (app[TAG_FIELD_MAP[dim.key]] as string[]).length;
      }
      const primaryInterface = app.interface_tags[0] ?? null;
      const color = primaryInterface ? (INTERFACE_COLORS[primaryInterface] ?? DEFAULT_COLOR) : DEFAULT_COLOR;
      const matched =
        !searchQuery ||
        app.name.toLowerCase().includes(lowerQ) ||
        (app.description ?? '').toLowerCase().includes(lowerQ);

      return { id: app.id, name: app.name, val: tagCount, color, app, matched };
    });

    // Build edges: pairwise tag intersection
    const links: GraphLink[] = [];
    const appTagSets: Map<string, Set<string>> = new Map();
    for (const app of apps) {
      const tagSet = new Set<string>();
      for (const dim of DIMENSION_CONFIGS) {
        for (const tag of app[TAG_FIELD_MAP[dim.key]] as string[]) {
          tagSet.add(tag);
        }
      }
      appTagSets.set(app.id, tagSet);
    }

    for (let i = 0; i < apps.length; i++) {
      for (let j = i + 1; j < apps.length; j++) {
        const setA = appTagSets.get(apps[i].id)!;
        const setB = appTagSets.get(apps[j].id)!;
        let hasOverlap = false;
        for (const tag of setA) {
          if (setB.has(tag)) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) {
          links.push({ source: apps[i].id, target: apps[j].id });
        }
      }
    }

    return { nodes, links };
  }, [apps, searchQuery]);

  const nodeCanvasObject = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const gNode = node as GraphNode;
      const radius = Math.sqrt(gNode.val) * 6 / globalScale * Math.min(globalScale, 2);
      const fontSize = 12 / globalScale;
      const alpha = searchQuery && !gNode.matched ? 0.2 : 1;

      ctx.globalAlpha = alpha;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = gNode.color;
      ctx.fill();

      // Label
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#374151';
      ctx.fillText(gNode.name, node.x, node.y + radius + 2 / globalScale);

      ctx.globalAlpha = 1;
    },
    [searchQuery],
  );

  if (!mounted || !ForceGraph) {
    return (
      <div ref={containerRef} className="w-full h-[600px] flex items-center justify-center bg-[#FAFAFA] rounded-xl border border-gray-200">
        <p className="text-sm text-gray-400">Loading graph...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-[600px] rounded-xl border border-gray-200 overflow-hidden">
      <ForceGraph
        graphData={graphData}
        width={dimensions.width}
        height={600}
        backgroundColor="#FAFAFA"
        nodeLabel="name"
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={// eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node: any, color: string, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const radius = Math.sqrt(node.val) * 6 / globalScale * Math.min(globalScale, 2);
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        linkColor={() => '#e5e7eb'}
        linkWidth={1}
        nodeRelSize={6}
        onNodeClick={(node: GraphNode) => onNodeClick(node.app)}
      />
    </div>
  );
}
