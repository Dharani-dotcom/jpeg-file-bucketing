#!/usr/bin/env python3
"""
Archival Scan Bucketing Engine
Buckets scanned JPEG files against registered folder identifiers.

Tasks Addressed:
1. Generates test data of >= 500 folder identifiers and >= 50,000 scanned JPEG filenames.
2. High-performance O(N + M) bucketing algorithm mapping JPEGs to folders.
3. Outputs structured text (Directory tree, JSON, CSV).

Usage:
    python3 bucket_scans.py --demo
    python3 bucket_scans.py --folders-file folders.txt --files-file scans.txt --output-format json
"""

import sys
import os
import json
import time
import argparse
from typing import Dict, List, Tuple, Set

def parse_folder_id(filename: str) -> str:
    """
    Extracts folder identifier from a scanned JPEG filename.
    Pattern: {FOLDER_IDENTIFIER}_J_{SCAN_INDEX}.jpg
    Example: MS-011_1_1_1_1_J_0042.jpg -> MS-011_1_1_1_1
    """
    if "_J_" in filename:
        return filename.rsplit("_J_", 1)[0]
    return ""

def bucket_files(
    folder_ids: List[str], 
    filenames: List[str]
) -> Tuple[Dict[str, List[str]], List[str], List[str]]:
    """
    Buckets filenames into their corresponding folders using an O(1) hash map.
    Returns:
        (buckets, empty_folders, unmatched_files)
    """
    # 1. Initialize hash table with all known folder identifiers
    buckets: Dict[str, List[str]] = {fid.strip(): [] for fid in folder_ids if fid.strip()}
    unmatched_files: List[str] = []

    # 2. Process each file in O(1) time
    for filename in filenames:
        clean_name = filename.strip()
        if not clean_name:
            continue
            
        folder_id = parse_folder_id(clean_name)
        if folder_id and folder_id in buckets:
            buckets[folder_id].append(clean_name)
        else:
            unmatched_files.append(clean_name)

    # 3. Sort files in each bucket numerically
    for fid in buckets:
        buckets[fid].sort()

    # 4. Identify empty folders
    empty_folders = [fid for fid, scans in buckets.items() if len(scans) == 0]

    return buckets, empty_folders, unmatched_files

def generate_test_data(min_folders: int = 520, min_files: int = 50400) -> Tuple[List[str], List[str]]:
    """
    Generates synthetic archival test data adhering to MS-011 hierarchy:
    - Folders: MS-011_{series}_{subseries}_{box}_{folder}
    - Scans:   MS-011_{series}_{subseries}_{box}_{folder}_J_{0001}.jpg
    """
    folders: List[str] = []
    seen = set()

    # Generate hierarchical folder identifiers
    for s in range(1, 7):
        for ss in range(1, 5):
            for b in range(1, 9):
                for f in range(1, 26):
                    fid = f"MS-011_{s}_{ss}_{b}_{f}"
                    if fid not in seen:
                        seen.add(fid)
                        folders.append(fid)
                        if len(folders) >= min_folders:
                            break

    # Reserve a few empty folders (e.g. 10) for realistic edge-case testing
    active_folders = folders[:-10]
    files: List[str] = []

    # Distribute scans across active folders
    scans_per_folder = min_files // len(active_folders)
    for fid in active_folders:
        for idx in range(1, scans_per_folder + 1):
            files.append(f"{fid}_J_{idx:04d}.jpg")

    # Add remainder to hit target
    remainder = min_files - len(files)
    for i in range(remainder):
        fid = active_folders[i % len(active_folders)]
        seq = scans_per_folder + 1 + (i // len(active_folders))
        files.append(f"{fid}_J_{seq:04d}.jpg")

    # Add realistic orphan / unmatched scans
    for o in range(1, 13):
        files.append(f"MS-011_99_99_99_99_J_{o:04d}.jpg")

    return folders, files

def format_structured_text(buckets: Dict[str, List[str]], unmatched: List[str], max_folders: int = 30) -> str:
    """Renders structured hierarchical text output."""
    lines = []
    lines.append("=" * 80)
    lines.append("ARCHIVAL SCAN BUCKETING REPORT")
    lines.append(f"Total Folders: {len(buckets):,} | Total Scans: {sum(len(b) for b in buckets.values()):,}")
    lines.append("=" * 80)
    lines.append("")

    for fid, files in list(buckets.items())[:max_folders]:
        lines.append(f"📁 [FOLDER] {fid}/ ({len(files)} scans)")
        if not files:
            lines.append("   └── (Empty folder - 0 scans)")
        else:
            limit = min(len(files), 6)
            for i in range(limit):
                branch = "└── " if i == limit - 1 and len(files) <= 6 else "├── "
                lines.append(f"   {branch}{files[i]}")
            if len(files) > 6:
                lines.append(f"   └── ... [{len(files) - 6} additional scans in this folder]")
        lines.append("")

    if len(buckets) > max_folders:
        lines.append(f"... [{len(buckets) - max_folders} more folders omitted from console preview]\n")

    if unmatched:
        lines.append(f"⚠️  [UNMATCHED SCANS] ({len(unmatched)} orphaned files without registered folders):")
        for u in unmatched[:10]:
            lines.append(f"   ├── {u}")
        if len(unmatched) > 10:
            lines.append(f"   └── ... [{len(unmatched) - 10} more unmatched files]")

    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Bucket scanned JPEG files against folder identifiers.")
    parser.add_argument("--demo", action="store_true", default=True, help="Run with 500+ folders and 50,000+ files")
    parser.add_argument("--folders-file", type=str, help="File containing folder IDs (one per line)")
    parser.add_argument("--files-file", type=str, help="File containing scanned filenames (one per line)")
    parser.add_argument("--output-format", choices=["tree", "json", "csv"], default="tree")
    parser.add_argument("--out-file", type=str, help="Write output to specified file path")
    args = parser.parse_args()

    if args.folders_file and args.files_file:
        with open(args.folders_file) as f:
            folders = [l.strip() for l in f if l.strip()]
        with open(args.files_file) as f:
            files = [l.strip() for l in f if l.strip()]
    else:
        folders, files = generate_test_data()

    print(f"Loaded {len(folders):,} folders and {len(files):,} scanned files.", file=sys.stderr)
    
    t0 = time.perf_counter()
    buckets, empty_folders, unmatched = bucket_files(folders, files)
    t1 = time.perf_counter()

    elapsed_ms = (t1 - t0) * 1000
    matched_files = sum(len(b) for b in buckets.values())

    print(f"Bucketing completed in {elapsed_ms:.2f} ms ({len(files)/((t1-t0) or 0.001):,.0f} files/sec).", file=sys.stderr)
    print(f"Matched: {matched_files:,} | Empty folders: {len(empty_folders)} | Unmatched: {len(unmatched)}", file=sys.stderr)

    if args.output_format == "json":
        output = json.dumps({"buckets": buckets, "unmatched": unmatched, "empty_folders": empty_folders}, indent=2)
    elif args.output_format == "csv":
        rows = ["Folder_Identifier,Filename,Status"]
        for fid, flist in buckets.items():
            for fn in flist:
                rows.append(f'"{fid}","{fn}","MATCHED"')
        for fn in unmatched:
            rows.append(f'"UNMATCHED","{fn}","ORPHAN"')
        output = "\n".join(rows)
    else:
        output = format_structured_text(buckets, unmatched)

    if args.out_file:
        with open(args.out_file, "w") as f:
            f.write(output)
        print(f"Saved output to {args.out_file}", file=sys.stderr)
    else:
        print(output)

if __name__ == "__main__":
    main()
