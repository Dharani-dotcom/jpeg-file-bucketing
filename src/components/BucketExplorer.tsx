import React, { useState, useMemo } from 'react';
import { BucketingResult } from '../types';
import { 
  Search, 
  Folder, 
  FileText, 
  FolderX, 
  AlertTriangle, 
  Copy, 
  Check, 
  ChevronRight, 
  Layers, 
  Filter
} from 'lucide-react';

interface BucketExplorerProps {
  result: BucketingResult;
}

type FilterMode = 'all' | 'with_scans' | 'empty' | 'unmatched';

export const BucketExplorer: React.FC<BucketExplorerProps> = ({ result }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string>(() => {
    const firstNonEmpty = Object.keys(result.buckets).find(k => result.buckets[k]?.length > 0);
    return firstNonEmpty || Object.keys(result.buckets)[0] || '';
  });
  const [fileSearchQuery, setFileSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const foldersPerPage = 25;

  // Folder entries list filtered
  const filteredFolders = useMemo(() => {
    let list: [string, string[]][] = Object.entries(result.buckets);

    if (filterMode === 'with_scans') {
      list = list.filter(([, files]) => files.length > 0);
    } else if (filterMode === 'empty') {
      list = list.filter(([, files]) => files.length === 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(([folderId]) => folderId.toLowerCase().includes(q));
    }

    return list;
  }, [result.buckets, filterMode, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredFolders.length / foldersPerPage));
  const currentFoldersPage = useMemo(() => {
    const start = (page - 1) * foldersPerPage;
    return filteredFolders.slice(start, start + foldersPerPage);
  }, [filteredFolders, page]);

  // Current folder's files
  const activeFiles = useMemo(() => {
    if (filterMode === 'unmatched') {
      return result.unmatchedFiles;
    }
    return result.buckets[selectedFolderId] || [];
  }, [result.buckets, result.unmatchedFiles, selectedFolderId, filterMode]);

  // Filtered files in right pane
  const filteredActiveFiles = useMemo(() => {
    if (!fileSearchQuery.trim()) return activeFiles;
    const q = fileSearchQuery.toLowerCase().trim();
    return activeFiles.filter((f) => f.toLowerCase().includes(q));
  }, [activeFiles, fileSearchQuery]);

  const handleCopyFiles = () => {
    navigator.clipboard.writeText(filteredActiveFiles.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search folders (e.g., MS-011_1_2)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => {
              setFilterMode('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Folders ({result.totalFolders})
          </button>
          <button
            onClick={() => {
              setFilterMode('with_scans');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'with_scans'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            With Scans ({result.totalFolders - result.emptyFolders.length})
          </button>
          <button
            onClick={() => {
              setFilterMode('empty');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'empty'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Empty ({result.emptyFolders.length})
          </button>
          <button
            onClick={() => setFilterMode('unmatched')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterMode === 'unmatched'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Orphans ({result.unmatchedFiles.length})
          </button>
        </div>
      </div>

      {/* Split Pane: Folders Master / Files Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Folders List (5 cols) */}
        {filterMode !== 'unmatched' && (
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[640px] shadow-sm">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                Folder Identifiers ({filteredFolders.length})
              </span>
              <span>
                Page {page} of {totalPages}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
              {currentFoldersPage.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No folders match search criteria.
                </div>
              ) : (
                currentFoldersPage.map(([folderId, filesList]) => {
                  const isSelected = folderId === selectedFolderId;
                  const isEmpty = filesList.length === 0;

                  return (
                    <button
                      key={folderId}
                      onClick={() => {
                        setSelectedFolderId(folderId);
                        setFileSearchQuery('');
                      }}
                      className={`w-full text-left p-2.5 rounded-lg transition flex items-center justify-between group ${
                        isSelected
                          ? 'bg-blue-600/20 border border-blue-500/40 text-blue-200'
                          : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {isEmpty ? (
                          <FolderX className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : (
                          <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                        )}
                        <span className="font-mono text-xs font-medium truncate">{folderId}</span>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                            isEmpty
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {filesList.length} scans
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 bg-slate-800 disabled:opacity-40 text-slate-300 rounded border border-slate-700"
                >
                  Previous
                </button>
                <span className="text-slate-400">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 bg-slate-800 disabled:opacity-40 text-slate-300 rounded border border-slate-700"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Column: Files in Selected Bucket (7 cols or full 12 if unmatched) */}
        <div
          className={`${
            filterMode === 'unmatched' ? 'lg:col-span-12' : 'lg:col-span-7'
          } bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[640px] shadow-sm`}
        >
          {/* Header of details pane */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                {filterMode === 'unmatched' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="font-semibold text-sm text-white">
                      Unmatched / Orphaned Scans Queue
                    </h3>
                  </>
                ) : (
                  <>
                    <Folder className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-sm font-mono text-white">
                      {selectedFolderId}
                    </h3>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {filterMode === 'unmatched'
                  ? 'Files scanned without a corresponding registered folder identifier'
                  : `Associated Scanned JPEG Files (${filteredActiveFiles.length} listed)`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyFiles}
                disabled={filteredActiveFiles.length === 0}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center space-x-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy List</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search inside this folder */}
          <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
            <input
              type="text"
              placeholder="Filter filenames in this folder (e.g., _0042)..."
              value={fileSearchQuery}
              onChange={(e) => setFileSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-200 placeholder-slate-500 w-full focus:outline-none"
            />
            {fileSearchQuery && (
              <button
                onClick={() => setFileSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
            {filteredActiveFiles.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                {filterMode === 'unmatched'
                  ? 'No orphaned scans detected. All files mapped successfully!'
                  : 'This folder is empty (0 scans registered).'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredActiveFiles.map((filename, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-slate-950/60 hover:bg-slate-800/50 border border-slate-800/80 text-slate-300 flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
                      <span className="truncate">{filename}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                      Scan #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
