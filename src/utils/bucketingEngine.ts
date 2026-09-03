import { BucketingResult, DatasetStats } from '../types';

/**
 * Algorithmic bucketing engine with high-precision benchmarking.
 * Complexity:
 * - Time: O(F + N) where F is folders count and N is files count.
 * - Space: O(F + N) for storing buckets.
 */
export function runBucketing(folders: string[], files: string[]): BucketingResult {
  const startTime = performance.now();

  // 1. Initialize Map with all known folders
  // Using Map for fast O(1) average lookup and preservation of insertion order
  const bucketMap = new Map<string, string[]>();
  for (let i = 0; i < folders.length; i++) {
    bucketMap.set(folders[i], []);
  }

  const unmatchedFiles: string[] = [];
  let matchedFilesCount = 0;

  // 2. Iterate through files and bucket them against known folders
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    // Folder ID precedes the '_J_' sequence identifier
    const jIndex = filename.lastIndexOf('_J_');

    if (jIndex !== -1) {
      const folderId = filename.substring(0, jIndex);
      const bucket = bucketMap.get(folderId);

      if (bucket !== undefined) {
        bucket.push(filename);
        matchedFilesCount++;
      } else {
        // Filename has valid _J_ format but folder is not in catalog
        unmatchedFiles.push(filename);
      }
    } else {
      // Malformed filename without _J_ token
      unmatchedFiles.push(filename);
    }
  }

  // 3. Identify empty folders
  const emptyFolders: string[] = [];
  const bucketsRecord: Record<string, string[]> = {};

  bucketMap.forEach((fileList, folderId) => {
    bucketsRecord[folderId] = fileList;
    if (fileList.length === 0) {
      emptyFolders.push(folderId);
    }
  });

  const endTime = performance.now();
  const executionTimeMs = parseFloat((endTime - startTime).toFixed(3));

  return {
    buckets: bucketsRecord,
    unmatchedFiles,
    emptyFolders,
    totalFolders: folders.length,
    totalFiles: files.length,
    matchedFilesCount,
    executionTimeMs,
  };
}

/**
 * Compute dataset distribution statistics
 */
export function computeStats(result: BucketingResult): DatasetStats {
  const bucketEntries = Object.values(result.buckets);
  let min = bucketEntries.length > 0 ? bucketEntries[0].length : 0;
  let max = 0;
  let total = 0;

  for (const bucket of bucketEntries) {
    const len = bucket.length;
    if (len < min) min = len;
    if (len > max) max = len;
    total += len;
  }

  const avg = bucketEntries.length > 0 ? parseFloat((total / bucketEntries.length).toFixed(1)) : 0;

  return {
    folderCount: result.totalFolders,
    fileCount: result.totalFiles,
    minFilesPerFolder: min,
    maxFilesPerFolder: max,
    avgFilesPerFolder: avg,
    unmatchedCount: result.unmatchedFiles.length,
    emptyFolderCount: result.emptyFolders.length,
  };
}

/**
 * Generate Structured Text Tree representation
 */
export function formatAsTextTree(
  buckets: Record<string, string[]>,
  unmatchedFiles: string[],
  previewLimitPerFolder = 10,
  maxFolders = 50
): string {
  const lines: string[] = [];
  lines.push(`================================================================================`);
  lines.push(`ARCHIVAL DIRECTORY BUCKETING REPORT`);
  lines.push(`Total Folders: ${Object.keys(buckets).length} | Total Scans: ${Object.values(buckets).reduce((acc, b) => acc + b.length, 0)}`);
  lines.push(`================================================================================\n`);

  const entries = Object.entries(buckets).slice(0, maxFolders);
  for (const [folderId, filesList] of entries) {
    lines.push(`📁 [FOLDER] ${folderId}/  (${filesList.length} scans)`);
    if (filesList.length === 0) {
      lines.push(`   └── (Empty folder - 0 scans recorded)`);
    } else {
      const displayCount = Math.min(filesList.length, previewLimitPerFolder);
      for (let i = 0; i < displayCount; i++) {
        const isLast = i === displayCount - 1 && filesList.length <= previewLimitPerFolder;
        const branch = isLast ? '└── ' : '├── ';
        lines.push(`   ${branch}${filesList[i]}`);
      }
      if (filesList.length > previewLimitPerFolder) {
        lines.push(`   └── ... [${filesList.length - previewLimitPerFolder} more scans in this folder]`);
      }
    }
    lines.push('');
  }

  if (Object.keys(buckets).length > maxFolders) {
    lines.push(`... [${Object.keys(buckets).length - maxFolders} additional folders omitted from text preview]\n`);
  }

  if (unmatchedFiles.length > 0) {
    lines.push(`⚠️  [UNMATCHED / ORPHANED SCANS] (${unmatchedFiles.length} files without registered folders):`);
    for (const orphan of unmatchedFiles.slice(0, 15)) {
      lines.push(`   └── ${orphan}`);
    }
    if (unmatchedFiles.length > 15) {
      lines.push(`   └── ... [${unmatchedFiles.length - 15} more orphan files]`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate formatted CSV mapping
 */
export function formatAsCsv(
  buckets: Record<string, string[]>,
  unmatchedFiles: string[],
  limitRows = 500
): string {
  const lines: string[] = ['Folder_Identifier,Filename,Scan_Index,Status'];
  let rowCount = 0;

  for (const [folderId, fileList] of Object.entries(buckets)) {
    for (const filename of fileList) {
      if (rowCount >= limitRows) break;
      const jIdx = filename.lastIndexOf('_J_');
      const scanIdx = jIdx !== -1 ? filename.substring(jIdx + 3, filename.lastIndexOf('.')) : 'N/A';
      lines.push(`"${folderId}","${filename}","${scanIdx}","MATCHED"`);
      rowCount++;
    }
    if (rowCount >= limitRows) break;
  }

  for (const orphan of unmatchedFiles) {
    if (rowCount >= limitRows) break;
    lines.push(`"UNMATCHED","${orphan}","N/A","ORPHAN"`);
    rowCount++;
  }

  return lines.join('\n');
}

/**
 * Generate Structured JSON sample
 */
export function formatAsJsonSample(
  buckets: Record<string, string[]>,
  unmatchedFiles: string[],
  foldersPreviewCount = 10,
  filesPreviewPerFolder = 5
): string {
  const sampleBuckets: Record<string, string[]> = {};
  const entries = Object.entries(buckets).slice(0, foldersPreviewCount);

  for (const [fId, files] of entries) {
    sampleBuckets[fId] = files.slice(0, filesPreviewPerFolder);
    if (files.length > filesPreviewPerFolder) {
      sampleBuckets[fId].push(`... (${files.length - filesPreviewPerFolder} more files)`);
    }
  }

  return JSON.stringify(
    {
      metadata: {
        total_folders: Object.keys(buckets).length,
        total_matched_files: Object.values(buckets).reduce((a, b) => a + b.length, 0),
        total_unmatched_files: unmatchedFiles.length,
        structure: 'Folder Identifier -> Array of Scanned JPEG Filenames',
      },
      sample_buckets: sampleBuckets,
      sample_unmatched_files: unmatchedFiles.slice(0, 5),
    },
    null,
    2
  );
}
