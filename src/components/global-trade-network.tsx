"use client";

import * as React from "react";
import * as d3 from "d3";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTheme } from "next-themes";

/* ------------------------------------------------------------------ */
/*  Data types                                                        */
/* ------------------------------------------------------------------ */
interface TradeData {
  reporterISO: string;
  partnerISO: string;
  reporterDesc: "M" | "X"; // M = import, X = export
  refMonth: number;
  cmdCode: string;
  fobvalue: number;
}

/* Node – extends D3 simulation node (x/y/fx/fy are required) */
interface Node extends d3.SimulationNodeDatum {
  id: string;
  country: string;
  value: number;          // total trade value
  role: "import" | "export" | "both";
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
}

/* Link – D3 link datum */
interface Link extends d3.SimulationLinkDatum<Node> {
  value: number;
}

/* ------------------------------------------------------------------ */
export function GlobalTradeNetwork() {
  const [data, setData] = React.useState<TradeData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const { resolvedTheme } = useTheme(); // light / dark

  /* --------------------- FETCH --------------------- */
  React.useEffect(() => {
    fetch("http://127.0.0.1:8000/api/trade-data")
      .then((r) => r.json())
      .then((raw: TradeData[]) => {
        const palm = raw.filter((d) =>
          d.cmdCode.toLowerCase().includes("palm oil")
        );
        setData(palm);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  /* --------------------- D3 RENDER --------------------- */
  React.useEffect(() => {
    if (loading || data.length === 0 || !svgRef.current) return;

    const width = 900;
    const height = 600;
    const isDark = resolvedTheme === "dark";

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("max-width", "100%")
      .style("height", "auto")
      .style("font", "10px sans-serif");

    svg.selectAll("*").remove();

    /* ---------- BUILD NODES & DETERMINE ROLE ---------- */
    const importSet = new Set<string>();
    const exportSet = new Set<string>();

    data.forEach((d) => {
      if (d.reporterDesc === "M") {
        importSet.add(d.reporterISO);
        exportSet.add(d.partnerISO);
      } else {
        exportSet.add(d.reporterISO);
        importSet.add(d.partnerISO);
      }
    });

    const nodesMap = new Map<string, Node>();
    data.forEach((d) => {
      [d.reporterISO, d.partnerISO].forEach((iso) => {
        if (!nodesMap.has(iso)) {
          const role: "import" | "export" | "both" =
            importSet.has(iso) && exportSet.has(iso)
              ? "both"
              : importSet.has(iso)
              ? "import"
              : "export";

          nodesMap.set(iso, {
            id: iso,
            country: iso,
            value: 0,
            role,
            x: 0,
            y: 0,
          });
        }
        nodesMap.get(iso)!.value += d.fobvalue;
      });
    });
    const nodes: Node[] = Array.from(nodesMap.values());

    /* ---------- LINKS (directed) ---------- */
    const linkMap = new Map<string, number>();
    data.forEach((d) => {
      const source = d.reporterDesc === "M" ? d.partnerISO : d.reporterISO;
      const target = d.reporterDesc === "M" ? d.reporterISO : d.partnerISO;
      const key = `${source}→${target}`;
      linkMap.set(key, (linkMap.get(key) || 0) + d.fobvalue);
    });
    const links: Link[] = Array.from(linkMap.entries()).map(([k, v]) => {
      const [source, target] = k.split("→");
      return { source, target, value: v };
    });

    /* ---------- SCALES ---------- */
    const nodeRadius = d3
      .scaleSqrt()
      .domain([0, d3.max(nodes, (d) => d.value) ?? 1])
      .range([6, 28]);

    const linkWidth = d3
      .scaleSqrt()
      .domain([0, d3.max(links, (d) => d.value) ?? 1])
      .range([1, 10]);

    const roleColor = d3.scaleOrdinal<string>()
      .domain(["import", "export", "both"])
      .range(["#10b981", "#f59e0b", "#8b5cf6"]); // green / amber / violet

    /* ---------- SIMULATION ---------- */
    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        "link",
        d3.forceLink<Node, Link>(links).id((d) => d.id).distance(140)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<Node>().radius((d) => nodeRadius(d.value) + 6)
      );

    /* ---------- ARROW (size follows edge) ---------- */
    const arrowId = "arrowhead";
    const arrow = svg
      .append("defs")
      .append("marker")
      .attr("id", arrowId)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 0)            // will be set per‑link
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", isDark ? "#bbb" : "#666");

    /* ---------- LINKS ---------- */
    const link = svg
      .append("g")
      .attr("stroke", isDark ? "#bbb" : "#666")
      .attr("stroke-opacity", 0.6)
      .selectAll<SVGLineElement, Link>("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => linkWidth(d.value));

    /* ---------- NODES ---------- */
    const node = svg
      .append("g")
      .selectAll<SVGCircleElement, Node>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => nodeRadius(d.value))
      .attr("fill", (d) => roleColor(d.role))
      .attr("stroke", isDark ? "#333" : "#fff")
      .attr("stroke-width", 1.5)
      .call(drag(simulation));

    /* ---------- LABELS (theme aware) ---------- */
    const label = svg
      .append("g")
      .selectAll<SVGTextElement, Node>("text")
      .data(nodes)
      .join("text")
      .attr("dy", -8)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", isDark ? "#e5e7eb" : "#1f2937")
      .style("pointer-events", "none")
      .text((d) => d.country);

    /* ---------- TICK ---------- */
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x)
        .attr("y1", (d) => (d.source as Node).y)
        .attr("x2", (d) => (d.target as Node).x)
        .attr("y2", (d) => (d.target as Node).y)
        .each(function (d) {
          const line = d3.select(this);
          const w = linkWidth(d.value);
          const r = nodeRadius((d.source as Node).value);
          arrow.attr("refX", r + w / 2 + 3); // tip touches node
          line.attr("marker-end", `url(#${arrowId})`);
        });

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      label.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });

    /* ---------- DRAG ---------- */
    function drag(
      sim: d3.Simulation<Node, Link>
    ): d3.DragBehavior<SVGCircleElement, Node, d3.SubjectPosition> {
      const started = (
        ev: d3.D3DragEvent<SVGCircleElement, Node, d3.SubjectPosition>,
        d: Node
      ) => {
        if (!ev.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      };
      const dragged = (
        ev: d3.D3DragEvent<SVGCircleElement, Node, d3.SubjectPosition>,
        d: Node
      ) => {
        d.fx = ev.x;
        d.fy = ev.y;
      };
      const ended = (
        ev: d3.D3DragEvent<SVGCircleElement, Node, d3.SubjectPosition>,
        d: Node
      ) => {
        if (!ev.active) sim.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      };
      return d3
        .drag<SVGCircleElement, Node>()
        .on("start", started)
        .on("drag", dragged)
        .on("end", ended);
    }

    // Cleanup
    return () => simulation.stop();
  }, [data, loading, resolvedTheme]);

  /* --------------------- UI --------------------- */
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Global Palm Oil Trade Network</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
        <CardContent className="text-center">Loading…</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Palm Oil Trade Network (2024)</CardTitle>
        <CardDescription>
          Green = only import Amber = only export Violet = both Drag to explore
        </CardDescription>
      </CardHeader>
      <CardContent>
        <svg ref={svgRef} className="w-full h-auto border rounded-md" />
      </CardContent>
    </Card>
  );
}