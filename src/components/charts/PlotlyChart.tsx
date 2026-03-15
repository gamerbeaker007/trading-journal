"use client";

/**
 * Plotly wrapper — dynamically imported to avoid SSR issues with plotly.js
 * Usage: <PlotlyChart data={[...]} layout={{...}} />
 */

import dynamic from "next/dynamic";

const PlotlyChart = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 320,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: 14,
      }}
    >
      Loading chart…
    </div>
  ),
});

export default PlotlyChart;
