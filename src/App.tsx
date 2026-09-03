import React, { useState, useMemo } from 'react';
import { ActiveTab, BucketingResult } from './types';
import { generateTestData } from './utils/dataGenerator';
import { runBucketing, computeStats } from './utils/bucketingEngine';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { BucketExplorer } from './components/BucketExplorer';
import { StructuredOutputViewer } from './components/StructuredOutputViewer';
import { ScriptsViewer } from './components/ScriptsViewer';
import { AgenticWorkflowView } from './components/AgenticWorkflowView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Initial synthetic test data generation: >= 500 folders and >= 50,000 files
  const initialData = useMemo(() => {
    return generateTestData({
      targetFolderCount: 520,
      targetFileCount: 50400,
      includeEmptyFolders: true,
      includeOrphanFiles: true,
      orphanCount: 12,
    });
  }, []);

  const [folders, setFolders] = useState<string[]>(initialData.folders);
  const [files, setFiles] = useState<string[]>(initialData.files);

  // Run the bucketing engine
  const [result, setResult] = useState<BucketingResult>(() => {
    return runBucketing(initialData.folders, initialData.files);
  });

  // Calculate statistics
  const stats = useMemo(() => {
    return computeStats(result);
  }, [result]);

  // Regeneration callback
  const handleRegenerate = (
    targetFolderCount: number,
    targetFileCount: number,
    includeEmpty: boolean,
    includeOrphans: boolean
  ) => {
    const newData = generateTestData({
      targetFolderCount,
      targetFileCount,
      includeEmptyFolders: includeEmpty,
      includeOrphanFiles: includeOrphans,
      orphanCount: includeOrphans ? 12 : 0,
    });

    const newResult = runBucketing(newData.folders, newData.files);
    setFolders(newData.folders);
    setFiles(newData.files);
    setResult(newResult);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        folderCount={folders.length}
        fileCount={files.length}
        executionTimeMs={result.executionTimeMs}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewDashboard
            result={result}
            stats={stats}
            folders={folders}
            files={files}
            onRegenerate={handleRegenerate}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'explorer' && <BucketExplorer result={result} />}

        {activeTab === 'output' && <StructuredOutputViewer result={result} />}

        {activeTab === 'scripts' && <ScriptsViewer />}

        {activeTab === 'agentic_docs' && <AgenticWorkflowView />}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Archival Scan Bucketer &bull; Linear Optimal O(N + M) Algorithm</span>
          <span className="font-mono text-slate-400">
            {folders.length.toLocaleString()} Folders &bull; {files.length.toLocaleString()} Scanned Files
          </span>
        </div>
      </footer>
    </div>
  );
}
