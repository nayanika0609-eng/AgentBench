import { apiClient } from './client';

async function download(benchmarkId: number, kind: 'json' | 'csv' | 'pdf', filename: string) {
  const { data } = await apiClient.get(`/export/${benchmarkId}/${kind}`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const exportJson = (benchmarkId: number) =>
  download(benchmarkId, 'json', `benchmark_${benchmarkId}.json`);

export const exportCsv = (benchmarkId: number) =>
  download(benchmarkId, 'csv', `benchmark_${benchmarkId}.csv`);

export const exportPdf = (benchmarkId: number) =>
  download(benchmarkId, 'pdf', `benchmark_${benchmarkId}.pdf`);
