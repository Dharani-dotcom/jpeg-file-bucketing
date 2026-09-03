/**
 * Type definitions for Folder and JPEG File Bucketing System
 */

export interface FolderItem {
  id: string;
  series: number;
  subseries: number;
  box: number;
  folderNum: number;
}

export interface BucketingResult {
  buckets: Record<string, string[]>;
  unmatchedFiles: string[];
  emptyFolders: string[];
  totalFolders: number;
  totalFiles: number;
  matchedFilesCount: number;
  executionTimeMs: number;
  memoryUsageMb?: number;
}

export interface DatasetStats {
  folderCount: number;
  fileCount: number;
  minFilesPerFolder: number;
  maxFilesPerFolder: number;
  avgFilesPerFolder: number;
  unmatchedCount: number;
  emptyFolderCount: number;
}

export type ActiveTab = 'overview' | 'explorer' | 'output' | 'scripts' | 'agentic_docs';

export type OutputFormat = 'text_tree' | 'json' | 'csv' | 'summary';
