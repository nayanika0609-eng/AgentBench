import { apiClient } from './client';
import type { Project } from '../types';

export async function listProjects() {
  const { data } = await apiClient.get<Project[]>('/projects');
  return data;
}

export async function getProject(projectId: number) {
  const { data } = await apiClient.get<Project>(`/projects/${projectId}`);
  return data;
}

export async function createProject(payload: { name: string; description: string }) {
  const { data } = await apiClient.post<Project>('/projects', payload);
  return data;
}

export async function updateProject(projectId: number, payload: { name: string; description: string }) {
  const { data } = await apiClient.put<Project>(`/projects/${projectId}`, payload);
  return data;
}

export async function deleteProject(projectId: number) {
  await apiClient.delete(`/projects/${projectId}`);
}
