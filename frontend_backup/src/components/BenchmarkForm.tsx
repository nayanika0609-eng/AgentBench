import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Info, Check } from 'lucide-react';

const SUGGESTED_MODELS = [
  { id: 'llama3.1:8b', label: 'Llama 3.1 8B' },
  { id: 'llama3.1:70b', label: 'Llama 3.1 70B' },
  { id: 'llama3:8b', label: 'Llama 3 8B' },
  { id: 'mistral:7b', label: 'Mistral 7B' },
  { id: 'gemma2:9b', label: 'Gemma 2 9B' },
  { id: 'phi3:mini', label: 'Phi-3 Mini' },
  { id: 'qwen2.5:7b', label: 'Qwen 2.5 7B' },
];

export interface BenchmarkFormValues {
  prompt: string;
  models: string[];
  use_rag: boolean;
  top_k: number;
}

export default function BenchmarkForm({
  onSubmit,
  submitting,
  hasDocuments,
}: {
  onSubmit: (values: BenchmarkFormValues) => void;
  submitting: boolean;
  hasDocuments: boolean;
}) {
  const [prompt, setPrompt] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [customModel, setCustomModel] = useState('');
  const [useRag, setUseRag] = useState(false);
  const [topK, setTopK] = useState(5);

  const toggleModel = (id: string) => {
    setSelectedModels((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const addCustomModel = () => {
    const trimmed = customModel.trim();
    if (trimmed && !selectedModels.includes(trimmed)) {
      setSelectedModels((prev) => [...prev, trimmed]);
      setCustomModel('');
    }
  };

  const canSubmit = prompt.trim().length > 0 && selectedModels.length > 0 && !submitting;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({ prompt: prompt.trim(), models: selectedModels, use_rag: useRag, top_k: topK });
      }}
      className="space-y-7"
    >
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="prompt" className="text-sm font-semibold text-ink-800">Prompt</label>
          <span className="text-xs text-ink-400 font-mono">{prompt.length} chars</span>
        </div>
        <textarea
          id="prompt"
          rows={6}
          className="input font-mono text-[13px] resize-y leading-relaxed"
          placeholder="Ask the models something you want to benchmark, e.g. &quot;Summarize the key risks in our Q3 contract renewal.&quot;"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-ink-800 mb-2 block">Models</label>
        <p className="text-xs text-ink-500 mb-3">
          Select one or more Ollama models to run this prompt against. Each model is executed and scored
          independently.
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_MODELS.map((m) => {
            const active = selectedModels.includes(m.id);
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => toggleModel(m.id)}
                className={`relative px-3.5 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? 'border-accent-400 bg-accent-50 text-accent-700 shadow-glow'
                    : 'border-line bg-white text-ink-600 hover:border-line-strong'
                }`}
              >
                {active && <Check className="h-3.5 w-3.5" />}
                {m.label}
                <span className="font-mono text-[10px] text-ink-400 ml-0.5">{m.id}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mt-3">
          <input
            className="input flex-1"
            placeholder="Add a custom model tag (e.g. llama3.2:latest)"
            value={customModel}
            onChange={(e) => setCustomModel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomModel();
              }
            }}
          />
          <button type="button" className="btn-secondary shrink-0" onClick={addCustomModel}>
            Add
          </button>
        </div>

        {selectedModels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedModels.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 rounded-full bg-ink-900 text-white text-[11px] font-mono px-2.5 py-1"
              >
                {m}
                <button type="button" onClick={() => toggleModel(m)} className="hover:text-rose-300">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="panel-soft p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-800">Retrieval-Augmented Generation</p>
            <p className="text-xs text-ink-500 mt-0.5">
              Ground responses in your project's indexed documents before generation.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={useRag}
            onClick={() => setUseRag((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
              useRag ? 'bg-accent-500' : 'bg-ink-200'
            }`}
          >
            <motion.span
              className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-soft"
              animate={{ x: useRag ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            />
          </button>
        </div>

        {!hasDocuments && useRag && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3 flex items-center gap-2">
            <Info className="h-3.5 w-3.5 shrink-0" /> This project has no indexed documents yet — RAG retrieval will
            return no context until you upload some.
          </p>
        )}

        {useRag && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="topk" className="text-xs font-medium text-ink-600">
                Top-K chunks retrieved
              </label>
              <span className="text-sm font-mono text-accent-600 font-semibold">{topK}</span>
            </div>
            <input
              id="topk"
              type="range"
              min={1}
              max={20}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full accent-accent-500"
            />
            <p className="text-[11px] text-ink-400 mt-1">
              Higher values retrieve more context chunks per query, improving recall at the cost of latency.
            </p>
          </motion.div>
        )}
      </div>

      <button type="submit" disabled={!canSubmit} className="btn-accent w-full py-3">
        <Sparkles className="h-4 w-4" /> {submitting ? 'Running benchmark…' : 'Run Benchmark'}
      </button>
    </form>
  );
}
