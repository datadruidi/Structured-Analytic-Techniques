# Multiple Hypothesis Generation

This module provides a **Hypothesis Generation** screen: candidate statements from a source list are placed into question columns (Who?, What?, Why?) and a Permutation area, with drag-to-reorder in each column.

## Running the app

- **Via hub:** From the repo root run `node start-all.js`, then open the hub at **http://localhost:3000** and click **Multiple Hypothesis**. The app runs on its own server at **http://localhost:8083** (port per HUB-PAGE-INSTRUCTIONS.md).
- **Standalone:** Run `node server.js` in this folder, then open **http://localhost:8083**. Do not open `index.html` as a file (file://) or the source file will not load.

## Source file

The left panel **“Added for Hypothesis Generation”** is populated from **Multiple_Hypothesis_Generation.txt** in this folder. Each line (after stripping a leading `- `) is shown as a row with a **Generate** button. You can also add new items with **Add +**.

### How the file is created (from Circleboarding)

1. Start the Circleboarding server from the `structured-analytic-circleboarding` folder (`node server.js`).
2. Open the app at **http://localhost:8082**.
3. Add or drag items into the **So what?** section, then click **Save for Hypothesis Generation**.

The file is written here with the structure:

```
So What?
- item 1
- item 2
...
```

## Workflow

1. **Source list (left):** Items from the file (and any you add) appear as rows with a **Generate** button.
2. **Generate:** Click **Generate** on an item → a popup asks **Who?**, **What?**, **Why?** → choose one → the item becomes a card in that column.
3. **Columns:** Who?, What?, Why?, and **Permutation**. Cards can be dragged to reorder within a column; card text is editable.
4. **Permutation:** Reserved for the next step (combinations/permutations of the placed items); logic can be added later.
