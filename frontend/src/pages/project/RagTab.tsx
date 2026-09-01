import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, FileText, ChevronDown, Clock, Zap, Layers } from 'lucide-react';
import { askRag } from '../../api/rag';
import type { RagAskResponse, RagSource } from '../../types';
import { getApiErrorMessage } from '../../api/client';
import EmptyState from '../../components/EmptyState';

const MODEL_OPTIONS = ['llama3.1:8b', 'llama3.1:70b', 'llama3:8b', 'mistral:7b', 'gemma2:9b'];

function SourceCard({ source, index }: { source: RagSource; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="panel-soft overflow-hidden"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-3.5 text-left"
      >
        <span className="font-mono text-xs text-ink-400 w-6 shrink-0">{String(source.rank).padStart(2, '0')}</span>
        <FileText className="h-4 w-4 text-ink-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink-800 truncate">{source.filename}</p>
          <p className="text-xs text-ink-400 font-mono">Chunk {source.chunk_index}</p>
        </div>
        <span className="text-xs font-mono text-accent-600 shrink-0">d={source.distance.toFixed(4)}</span>
        <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-3.5 pb-3.5"
          >
            <div className="border-t border-line-soft pt-3 grid grid-cols-2 gap-2 text-xs font-mono text-ink-500">
              <p>document_id: {source.document_id}</p>
              <p>chunk_id: {source.chunk_id}</p>
              <p>rank: {source.rank}</p>
              <p>distance: {source.distance}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RagTab({ projectId, hasDocuments }: { projectId: number; hasDocuments: boolean }) {
  const [question, setQuestion] = useState('');
  const [model, setModel] = useState(MODEL_OPTIONS[0]);
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RagAskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await askRag({ project_id: projectId, question: question.trim(), model, top_k: topK });
      setResult(res);
    } catch (err) {
      setError(getApiErrorMessage(err, 'RAG query failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="panel p-5">
          <h3 className="text-sm font-semibold text-ink-800 mb-1">Ask a question</h3>
          <p className="text-xs text-ink-500 mb-4">Retrieve context from indexed documents and generate a grounded answer.</p>

          {!hasDocuments && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
              Enable RAG to evaluate retrieval performance — upload documents to this project first.
            </p>
          )}

          <textarea
            className="input resize-none mb-3"
            rows={4}
            placeholder="What does the onboarding policy say about remote employees?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <div className="mb-3">
            <label className="label mb-1.5 block">Model</label>
            <select className="input" value={model} onChange={(e) => setModel(e.target.value)}>
              {MODEL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="label">Top-K</label>
              <span className="text-sm font-mono text-accent-600 font-semibold">{topK}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full accent-accent-500"
            />
          </div>

          <button className="btn-accent w-full" onClick={handleAsk} disabled={loading || !question.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? 'Retrieving & generating…' : 'Ask'}
          </button>
        </div>
      </div>

      <div className="lg:col-span-3">
        {error && (
          <div className="panel p-5 border-rose-100 bg-rose-50/40 text-sm text-rose-500 mb-4">{error}</div>
        )}

        {loading && (
          <div className="panel p-10 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-6 w-6 text-accent-500 animate-spin mb-3" />
            <p className="text-sm text-ink-600">Retrieving context and generating an answer…</p>
          </div>
        )}

        {!loading && !result && !error && (
          <EmptyState
            icon={Search}
            title="Ask something to see retrieval results"
            description="Sources, chunk-level relevance, and generation timing will appear here."
          />
        )}

        {!loading && result && !result.success && (
          <EmptyState icon={Layers} title="No result" description={result.message ?? 'This query returned nothing.'} />
        )}

        {!loading && result?.success && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="panel p-5">
              <p className="kicker mb-2">Answer</p>
              <p className="text-sm text-ink-800 leading-relaxed whitespace-pre-wrap">{result.answer}</p>

              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-line-soft">
                <div className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock className="h-3.5 w-3.5" /> Retrieval: <span className="font-mono">{result.metrics?.retrieval_time_ms}ms</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Zap className="h-3.5 w-3.5" /> Generation: <span className="font-mono">{result.metrics?.generation_time_ms}ms</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Layers className="h-3.5 w-3.5" /> Total: <span className="font-mono">{result.metrics?.total_time_ms}ms</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-500 font-mono">
                  {result.chunks_used} chunks used
                </div>
              </div>
            </div>

            <div>
              <p className="kicker mb-2">Sources</p>
              <div className="space-y-2">
                {result.sources?.map((s, i) => (
                  <SourceCard key={`${s.chunk_id}-${i}`} source={s} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
