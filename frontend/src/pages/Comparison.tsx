import {
  useEffect,
  useState,
} from 'react';

import {
  Navigate,
} from 'react-router-dom';

import {
  listProjects,
} from '../api/projects';

import {
  listProjectBenchmarks,
} from '../api/benchmarks';

import EmptyState from '../components/EmptyState';

import {
  GitCompare,
} from 'lucide-react';

export default function Comparison() {
  const [
    benchmarkId,
    setBenchmarkId,
  ] = useState<
    number | null
  >(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    let mounted = true;

    async function findLatestBenchmark() {
      try {
        setLoading(true);
        setError(null);

        const projects =
          await listProjects();

        const benchmarkGroups =
          await Promise.all(
            projects.map(
              async (
                project,
              ) => {
                try {
                  return await listProjectBenchmarks(
                    project.id,
                  );
                } catch {
                  return [];
                }
              },
            ),
          );

        const benchmarks =
          benchmarkGroups
            .flat()
            .filter(Boolean)
            .sort(
              (a, b) =>
                new Date(
                  b.created_at,
                ).getTime() -
                new Date(
                  a.created_at,
                ).getTime(),
            );

        if (!mounted) {
          return;
        }

        if (
          benchmarks.length ===
          0
        ) {
          setBenchmarkId(
            null,
          );
          return;
        }

        setBenchmarkId(
          benchmarks[0].id,
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to find a benchmark to compare.',
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    findLatestBenchmark();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="panel min-h-[280px] flex items-center justify-center">

        <div className="text-center">

          <div className="h-8 w-8 border-2 border-accent-400/20 border-t-accent-400 rounded-full animate-spin mx-auto" />

          <p className="terminal-label mt-4">
            FINDING LATEST BENCHMARK
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={GitCompare}
        title="Couldn't open comparison"
        description={error}
      />
    );
  }

  if (
    benchmarkId ===
    null
  ) {
    return (
      <EmptyState
        icon={GitCompare}
        title="No benchmark available"
        description="Run at least one benchmark before opening model comparison."
      />
    );
  }

  return (
    <Navigate
      to={`/benchmarks/${benchmarkId}/compare`}
      replace
    />
  );
}