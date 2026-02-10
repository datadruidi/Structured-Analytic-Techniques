# Structured Analytic Techniques

A collection of lightweight, analyst-focused tools supporting Structured Analytic Techniques (SAT).  
All tools run client-side, require no backend, and work offline where applicable.

**Hub:** Open **`index.html`** at the repo root (or run a static server here) to see the tool hub. Each button opens a tool in a new tab; start each tool’s server from its folder (see [HUB-PAGE-INSTRUCTIONS.md](HUB-PAGE-INSTRUCTIONS.md) for port assignments). The **Back to Main Screen** button in Causal Map and Timeline opens the hub at **http://localhost:3000/** — run a static server at the repo root on port 3000 for that button to work. **One terminal:** from the repo root run **`node start-all.js`** to start the hub (3000), Causal Map (8765), Timeline (8080), and Circleboarding (8082) together; press Ctrl+C to stop all.

## Purpose

These tools integrate Structured Analytic Techniques (SAT) into practical, lightweight workflows.  
The aim is to externalize analytic thinking—making assumptions, relationships, and timelines explicit—while reducing cognitive bias and improving transparency. The tools support exploratory analysis in complex and uncertain problem spaces without imposing heavy frameworks or infrastructure.

![Analysis](assets/img/mainpage.png)
Picture: Structured Analytic Techniques for Intelligence Analysis Richards J. Heuer Jr., Randolph H. Pherson

## Contents

- **structured-analytic-causal-map/**
  - Browser-based causal / concept map tool for DIMEFIL/PESTLE/PM-MESII etc. in Getting Organized Phase

- **structured-analytic-timeline/**
  - Browser-based timeline tool (SAT) for timeline analysis in Getting Organized and Diagnostic Phase

- **structured-analytic-circleboarding/**
  - 5WH + “So what?” circleboard with external content zones; runs on port 8082

- **scripts/**
  - Miscellaneous and experimental scripts

- **scripts/**
  - Miscellaneous and experimental scripts
  - **network_mapper/**
    - PCAP-to-graph tooling for Obsidian
