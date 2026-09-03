import React, { useState, useMemo } from 'react';
import { BucketingResult, OutputFormat } from '../types';
import { 
  formatAsTextTree, 
  formatAsCsv, 
  formatAsJsonSample 
} from '../utils/bucketingEngine';
import { 
  FileText, 
  Code, 
  Table, 
  Copy, 
  Check, 
  Download, 
  Search, 
  CheckCircle2 
} from 'lucide-react';

interface StructuredOutputViewerProps {
  result: BucketingResult;
}

export const StructuredOutputViewer: React.FC<StructuredOutputViewerProps> = ({ result }) => {
  const [activeFormat, setActiveFormat] = useState<OutputFormat>('text_tree');
  const [copied, setCopied] = useState<boolean>(false);
  const [maxFoldersPreview, setMaxFoldersPreview] = useState<number>(40);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const outputText = useMemo(() => {
    switch (activeFormat) {
      case 'text_tree':
        return formatAsTextTree(result.buckets, result.unmatchedFiles, 8, maxFoldersPreview);
      case 'json':
        return formatAsJsonSample(result.buckets, result.unmatchedFiles, maxFoldersPreview, 6);
      case 'csv':
        return formatAsCsv(result.buckets, result.unmatchedFiles, 400);
      case 'summary':
        return [
          `================================================================================`,
          `ARCHIVAL BUCKETING SUMMARY MATRIX`,
          `================================================================================`,
          `Total Registered Folders   : ${result.totalFolders.toLocaleString()}`,
          `Total Scanned JPEG Files   : ${result.totalFiles.toLocaleString()}`,
          `Matched Files in Buckets   : ${result.matchedFilesCount.toLocaleString()} (${((result.matchedFilesCount / result.totalFiles) * 100).toFixed(2)}%)`,
          `Empty Folders (0 scans)    : ${result.emptyFolders.length}`,
          `Unmatched / Orphan Scans   : ${result.unmatchedFiles.length}`,
          `Algorithmic Time Complexity: O(N + M) Linear Optimal`,
          `Benchmark Execution Time   : ${result.executionTimeMs} ms`,
          `Throughput                 : ${(result.totalFiles / Math.max(0.001, result.executionTimeMs / 1000)).toLocaleString()} files/sec`,
          `================================================================================`,
          ``,
          `EMPTY FOLDERS AUDIT LIST:`,
          result.emptyFolders.length === 0
            ? '  (None - all folders received scanned files)'
            : result.emptyFolders.map(f => `  • ${f}`).join('\n'),
          ``,
          `ORPHAN / UNMATCHED AUDIT LIST:`,
          result.unmatchedFiles.length === 0
            ? '  (None - zero orphaned files)'
            : result.unmatchedFiles.map(u => `  • ${u}`).join('\n')
        ].join('\n');
      default:
        return '';
    }
  }, [activeFormat, result, maxFoldersPreview]);

  const filteredOutputText = useMemo(() => {
    if (!searchFilter.trim()) return outputText;
    const lines = outputText.split('\n');
    const q = searchFilter.toLowerCase();
    const matchingLines = lines.filter(l => l.toLowerCase().includes(q));
    return `// Showing ${matchingLines.length} lines matching "${searchFilter}":\n\n` + matchingLines.join('\n');
  }, [outputText, searchFilter]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let extension = 'txt';
    let mime = 'text/plain';
    if (activeFormat === 'json') {
      extension = 'json';
      mime = 'application/json';
    } else if (activeFormat === 'csv') {
      extension = 'csv';
      mime = 'text/csv';
    }

    const blob = new Blob([outputText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archival_bucketed_output.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Format Switcher & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Format buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveFormat('text_tree')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeFormat === 'text_tree'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Directory Tree (.txt)</span>
          </button>

          <button
            onClick={() => setActiveFormat('json')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeFormat === 'json'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>JSON Object</span>
          </button>

          <button
            onClick={() => setActiveFormat('csv')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeFormat === 'csv'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>CSV Manifest</span>
          </button>

          <button
            onClick={() => setActiveFormat('summary')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeFormat === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reconciliation Audit</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center space-x-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Output</span>
          </button>
        </div>
      </div>

      {/* Output Screen Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-slate-300">
              Format: <strong className="text-blue-400">{activeFormat.toUpperCase()}</strong>
            </span>
            <span>&bull;</span>
            <span>{result.matchedFilesCount.toLocaleString()} scans mapped across {result.totalFolders} buckets</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span>Preview depth:</span>
              <select
                value={maxFoldersPreview}
                onChange={(e) => setMaxFoldersPreview(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value={20}>20 folders</option>
                <option value={40}>40 folders</option>
                <option value={100}>100 folders</option>
                <option value={500}>All 500+ folders</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1.5" />
              <input
                type="text"
                placeholder="Find in output..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-0.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Text Area / Code Display */}
        <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto overflow-y-auto max-h-[600px] leading-relaxed select-all">
          {filteredOutputText}
        </pre>
      </div>
    </div>
  );
};
