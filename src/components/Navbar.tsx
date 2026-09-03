import React from 'react';
import { ActiveTab } from '../types';
import { FolderTree, FileText, Terminal, Bot, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  folderCount: number;
  fileCount: number;
  executionTimeMs: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  folderCount,
  fileCount,
  executionTimeMs,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview & Benchmark', icon: BarChart3 },
    { id: 'explorer', label: `Explorer (${folderCount})`, icon: FolderTree },
    { id: 'output', label: 'Structured Output', icon: FileText },
    { id: 'scripts', label: 'Standalone Scripts', icon: Terminal },
    { id: 'agentic_docs', label: 'Agentic Log & Instructions', icon: Bot },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-semibold text-lg text-white tracking-tight">
                  Archival Scan Bucketer
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> O(N + M) Active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Archival Identifier Mapping Engine (MS-011 Series)
              </p>
            </div>
          </div>

          {/* Real-time telemetry badges */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <span className="text-slate-400">Folders:</span>{' '}
              <strong className="text-white font-mono">{folderCount.toLocaleString()}</strong>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <span className="text-slate-400">Files:</span>{' '}
              <strong className="text-white font-mono">{fileCount.toLocaleString()}</strong>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-800/50 text-blue-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Processed in <strong className="font-mono text-white">{executionTimeMs} ms</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
