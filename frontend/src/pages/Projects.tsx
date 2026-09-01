import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Pencil, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { listProjects, createProject, updateProject, deleteProject } from '../api/projects';
import type { Project } from '../types';
import PageHeader from '../components/PageHeader';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { SkeletonCardGrid } from '../components/Skeleton';
import { getApiErrorMessage } from '../api/client';
import { useToast } from '../components/Toast';

function ProjectForm({
  initial,
  onSubmit,
  submitLabel,
  loading,
}: {
  initial?: { name: string; description: string };
  onSubmit: (values: { name: string; description: string }) => void;
  submitLabel: string;
  loading: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, description });
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="pname" className="label mb-1.5 block">Project name</label>
        <input
          id="pname"
          required
          className="input"
          placeholder="e.g. Customer Support Copilot"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="pdesc" className="label mb-1.5 block">Description</label>
        <textarea
          id="pdesc"
          required
          rows={3}
          className="input resize-none"
          placeholder="What is this project evaluating?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading} className="btn-accent w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}

export default function Projects() {
  const { data: projects, loading, error, refetch } = useAsync(listProjects, []);
  const { push } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCreate = async (values: { name: string; description: string }) => {
    setSaving(true);
    try {
      await createProject(values);
      push('Project created.', 'success');
      setCreateOpen(false);
      refetch();
    } catch (err) {
      push(getApiErrorMessage(err, 'Could not create project.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (values: { name: string; description: string }) => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateProject(editTarget.id, values);
      push('Project updated.', 'success');
      setEditTarget(null);
      refetch();
    } catch (err) {
      push(getApiErrorMessage(err, 'Could not update project.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      push('Project deleted.', 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      push(getApiErrorMessage(err, 'Could not delete project.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        kicker="Workspace"
        title="Projects"
        description="Each project holds its own documents, benchmarks, and results."
        action={
          <button className="btn-accent" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New project
          </button>
        }
      />

      {loading ? (
        <SkeletonCardGrid count={6} />
      ) : error ? (
        <EmptyState icon={FolderKanban} title="Couldn't load projects" description={error} />
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="panel p-5 flex flex-col group hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-accent-50 flex items-center justify-center">
                  <FolderKanban className="h-[18px] w-[18px] text-accent-600" strokeWidth={1.8} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditTarget(p)}
                    aria-label={`Edit ${p.name}`}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    aria-label={`Delete ${p.name}`}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-ink-400 hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-display font-semibold text-ink-900 mb-1">{p.name}</h3>
              <p className="text-sm text-ink-500 line-clamp-2 flex-1">{p.description}</p>

              <Link
                to={`/projects/${p.id}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-800 group-hover:text-accent-600 transition-colors"
              >
                Open workspace <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="Create your first benchmark project"
          description="Projects organize your documents, benchmark runs, and evaluation results."
          action={
            <button className="btn-accent" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New project
            </button>
          }
        />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create project">
        <ProjectForm onSubmit={handleCreate} submitLabel="Create project" loading={saving} />
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit project">
        {editTarget && (
          <ProjectForm
            initial={{ name: editTarget.name, description: editTarget.description }}
            onSubmit={handleEdit}
            submitLabel="Save changes"
            loading={saving}
          />
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete project">
        <p className="text-sm text-ink-600">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This will remove all associated
          benchmarks and results. This action cannot be undone.
        </p>
        <div className="flex gap-2 mt-5">
          <button className="btn-secondary flex-1" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn-danger flex-1" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />} Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
