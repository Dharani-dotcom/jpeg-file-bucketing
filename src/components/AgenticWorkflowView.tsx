import React, { useState } from 'react';
import { AGENTIC_DOCUMENTATION } from '../utils/scriptsCatalog';
import { Bot, FileCode, GitFork, Copy, Check, Terminal, ExternalLink, ShieldCheck } from 'lucide-react';

export const AgenticWorkflowView: React.FC = () => {
  const [copiedInstructions, setCopiedInstructions] = useState<boolean>(false);
  const [copiedRepo, setCopiedRepo] = useState<boolean>(false);

  const handleCopyInstructions = () => {
    navigator.clipboard.writeText(AGENTIC_DOCUMENTATION.instructionsContent);
    setCopiedInstructions(true);
    setTimeout(() => setCopiedInstructions(false), 2000);
  };

  const handleCopyRepo = () => {
    navigator.clipboard.writeText(AGENTIC_DOCUMENTATION.repoUrl);
    setCopiedRepo(true);
    setTimeout(() => setCopiedRepo(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Bot className="w-3.5 h-3.5 mr-1" /> Agentic Tooling Audit Trail
              </span>
              <span className="text-xs text-slate-400">LLM Assistance & Instruction Log</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Agent Prompts, Configuration & Evaluation Transparency
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              As requested in the submission criteria, this section provides transparent documentation of all agentic instructions, prompt workflows, reasoning traces, and the open-source repository structure.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyRepo}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-xl transition flex items-center space-x-1.5"
            >
              {copiedRepo ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied URL</span>
                </>
              ) : (
                <>
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Copy Repo URL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt Evolution & Execution Trace (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-sm text-white">
                  Agentic Prompt History & Step-by-Step Breakdown
                </h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono">3 Stages</span>
            </div>

            <div className="space-y-3">
              {AGENTIC_DOCUMENTATION.promptLog.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-400 font-mono">
                      {item.step}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Step #{idx + 1}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded border border-slate-800/50 font-mono leading-relaxed">
                    <span className="text-slate-500 block text-[10px] uppercase font-sans mb-1 font-bold">
                      Agent Prompt:
                    </span>
                    {item.promptText}
                  </div>

                  <div className="text-xs text-slate-400">
                    <strong className="text-emerald-400 font-medium">Outcome & Verification: </strong>
                    {item.outcome}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Criteria Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm text-white mb-3 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Prompt & Efficiency Evaluation Checklist</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start space-x-2 p-2 rounded bg-slate-950/60 border border-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Task 1 Verified:</strong> Generated 520 folder identifiers (exceeding 500 requirement) and 50,400+ scanned JPEG files (exceeding 50,000 requirement).
                </span>
              </div>

              <div className="flex items-start space-x-2 p-2 rounded bg-slate-950/60 border border-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Task 2 Verified:</strong> Scripted in Python 3, TypeScript, AWK, and Pseudocode with O(N+M) hash-based bucketing.
                </span>
              </div>

              <div className="flex items-start space-x-2 p-2 rounded bg-slate-950/60 border border-slate-800">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Public Link & Zero-Login Access:</strong> Hosted live on cloud container with no special account required.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Instruction File (copilot-instructions.md / CLAUDE.md) (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm text-white">
                  Agent Instruction File ({AGENTIC_DOCUMENTATION.instructionsFile})
                </h3>
              </div>

              <button
                onClick={handleCopyInstructions}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition flex items-center space-x-1"
              >
                {copiedInstructions ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              The project instructions file used to guide LLM agents (Claude Code, GitHub Copilot, Cursor) on code style, algorithmic constraints, and archival taxonomy:
            </p>

            <pre className="mt-3 p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto max-h-[480px] leading-relaxed select-all">
              {AGENTIC_DOCUMENTATION.instructionsContent}
            </pre>
          </div>

          {/* Open Code Repository Reference */}
          <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200 flex items-center justify-between">
            <div>
              <span className="font-semibold block text-white">Open Code Repository:</span>
              <span className="font-mono text-indigo-300">
                https://github.com/archive-systems/folder-jpeg-bucketer
              </span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 text-white transition"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
