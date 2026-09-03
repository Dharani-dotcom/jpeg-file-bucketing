# Copilot Instructions & Agent Guidelines: Archival Scan Bucketer

## Objective
Bucket scanned JPEG files against their corresponding archival folder identifiers efficiently:
- **Input 1**: A list of folder identifiers (e.g., `MS-011_1_1_1_1`, `MS-011_1_2_6_341`... `MS-011_6_1_6_341`).
- **Input 2**: A list of scanned JPEG files (e.g., `MS-011_1_1_1_1_J_0001.jpg`, `MS-011_1_1_1_1_J_0002.jpg`... `MS-011_1_1_1_1_J_0582.jpg`).

## Synthesizing Test Datasets
1. Generate **at least 500 folder identifiers** using the hierarchical convention:
   `MS-011_{series}_{subseries}_{box}_{folder}`
2. Generate **at least 50,000 scanned JPEG filenames** following the scanner pattern:
   `MS-011_{series}_{subseries}_{box}_{folder}_J_{scan_number:04d}.jpg`
3. Include realistic archival conditions:
   - Folders with varying scan counts (20 to 500+ scans).
   - Empty catalog folders (folders without scans).
   - Orphaned scans (scans with unknown or unregistered folder identifiers).

## Algorithmic & Performance Constraints
- **Time Complexity**: Must achieve optimal **$O(N + M)$** time complexity using hash-indexed data structures (Map / Dictionary). Do NOT use nested loops ($O(N \times M)$) which would take $500 \times 50,000 = 25,000,000$ operations.
- **Parsing Strategy**: Extract folder ID using reverse string search (`rsplit('_J_', 1)` in Python or `lastIndexOf('_J_')` in TypeScript) rather than compiling regex on every iteration to avoid backtrack overhead.
- **Structured Output**: Support hierarchical text tree, JSON dictionary mapping, and tabular CSV.
