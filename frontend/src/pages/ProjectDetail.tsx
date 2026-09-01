import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LayoutGrid,
  FileText,
  Zap,
  BarChart3,
  Search,
  FileDown,
} from 'lucide-react';

import { useAsync } from '../hooks/useAsync';
import { getProject } from '../api/projects';
import { listDocuments } from '../api/documents';

import EmptyState from '../components/EmptyState';
import { SkeletonBlock } from '../components/Skeleton';

import OverviewTab from './project/OverviewTab';
import DocumentsTab from './project/DocumentsTab';
import BenchmarksTab from './project/BenchmarksTab';
import ResultsTab from './project/ResultsTab';
import RagTab from './project/RagTab';
import ReportsTab from './project/ReportsTab';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'benchmarks', label: 'Benchmarks', icon: Zap },
  { id: 'results', label: 'Results', icon: BarChart3 },
  { id: 'rag', label: 'RAG', icon: Search },
  { id: 'reports', label: 'Reports', icon: FileDown },
];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const id = Number(projectId);

  const [activeTab, setActiveTab] = useState('overview');

  const {
    data: project,
    loading,
    error,
  } = useAsync(
    () => getProject(id),
    [id]
  );

  const {
    data: documents,
    refetch: refetchDocuments,
  } = useAsync(
    () => listDocuments(id),
    [id]
  );

  /*
   * A document is considered available for RAG only when
   * it has at least one indexed chunk.
   *
   * This also avoids treating an uploaded-but-empty document
   * as ready for retrieval.
   */
  const hasDocuments =
    (documents ?? []).some(
      (document) =>
        document.chunk_count > 0
    );

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonBlock className="h-6 w-64" />
        <SkeletonBlock className="h-40 w-full" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <EmptyState
        icon={FileText}
        title="Project not found"
        description="This project doesn't exist, or you don't have access to it."
        action={
          <Link
            to="/projects"
            className="btn-accent"
          >
            Back to projects
          </Link>
        }
      />
    );
  }

  return (
    <div>
      {/* Back */}

      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-ink-800 mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All projects
      </Link>

      {/* Header */}

      <motion.div
        initial={{
          opacity: 0,
          y: -6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-6"
      >
        <p className="kicker mb-1.5">
          Project Workspace
        </p>

        <h1 className="text-2xl md:text-[28px] font-display font-semibold text-ink-900">
          {project.name}
        </h1>

        <p className="text-sm text-ink-500 mt-1.5 max-w-2xl">
          {project.description}
        </p>
      </motion.div>

      {/* Tabs */}

      <div className="border-b border-line mb-6 -mx-1 px-1 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map((tab) => {
            const active =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'text-ink-900'
                    : 'text-ink-400 hover:text-ink-700'
                }`}
              >
                <tab.icon
                  className="h-[15px] w-[15px]"
                  strokeWidth={1.8}
                />

                {tab.label}

                {active && (
                  <motion.div
                    layoutId="project-tab-underline"
                    className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent-500 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}

      <motion.div
        key={activeTab}
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.25,
        }}
      >
        {activeTab === 'overview' && (
          <OverviewTab
            project={project}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            projectId={id}
            onDocumentsChanged={refetchDocuments}
          />
        )}

        {activeTab === 'benchmarks' && (
          <BenchmarksTab
            projectId={id}
            hasDocuments={hasDocuments}
          />
        )}

        {activeTab === 'results' && (
          <ResultsTab projectId={id} />
        )}

        {activeTab === 'rag' && (
          <RagTab
            projectId={id}
            hasDocuments={hasDocuments}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab projectId={id} />
        )}
      </motion.div>
    </div>
  );
}