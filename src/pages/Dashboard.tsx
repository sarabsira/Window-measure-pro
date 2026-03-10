import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  FolderOpen,
  FileDown,
  Archive,
  Trash2,
  Home,
  Layers,
  BarChart3,
  Upload,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { EmptyState } from '../components/UI/EmptyState';

const statusColors = {
  active: 'teal' as const,
  completed: 'green' as const,
  archived: 'default' as const,
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, deleteProject, updateProject, setActiveProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.projectName.toLowerCase().includes(q) ||
      `${p.client.firstName} ${p.client.lastName}`.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalWindows = projects.reduce(
    (sum, p) => sum + p.rooms.reduce((rs, r) => rs + r.windows.length, 0),
    0
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProject(id);
      addToast('Project deleted', 'success');
    }
  };

  const handleExportData = () => {
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `measurepro-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported successfully', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          // Merge: add projects that don't already exist by id
          const existingIds = new Set(projects.map((p) => p.id));
          let added = 0;
          imported.forEach((p) => {
            if (!existingIds.has(p.id)) {
              useProjectStore.setState((state) => ({
                projects: [...state.projects, p],
              }));
              added++;
            }
          });
          addToast(`Imported ${added} new project(s)`, 'success');
        }
      } catch {
        addToast('Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1B2D]">MeasurePro</h1>
          <p className="text-slate-400 text-sm mt-0.5">Window Furnishing Consultant Tool</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px]">
              <Upload size={16} />
              Import Data
            </span>
          </label>
          <Button variant="secondary" size="sm" icon={<Download size={16} />} onClick={handleExportData}>
            Export All
          </Button>
          <Button size="md" icon={<Plus size={18} />} onClick={() => navigate('/project/new')}>
            New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: projects.length, icon: <FolderOpen size={20} /> },
          {
            label: 'Active Projects',
            value: projects.filter((p) => p.status === 'active').length,
            icon: <BarChart3 size={20} />,
          },
          { label: 'Windows Measured', value: totalWindows, icon: <Layers size={20} /> },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center">
                {icon}
              </div>
              <div className="text-2xl font-bold text-slate-800 font-mono">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or clients..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white min-h-[44px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Project Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Home size={32} />}
          title={search ? 'No projects found' : 'No projects yet'}
          description={
            search
              ? 'Try adjusting your search terms'
              : 'Create your first project to start measuring windows'
          }
          action={
            !search
              ? { label: 'Create First Project', onClick: () => navigate('/project/new') }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const totalProjectWindows = project.rooms.reduce(
              (s, r) => s + r.windows.length,
              0
            );
            return (
              <Card key={project.id} hoverable className="group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{project.projectName}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {project.client.firstName} {project.client.lastName}
                    </p>
                  </div>
                  <Badge variant={statusColors[project.status]}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="text-xs text-slate-400">
                    {project.address.suburb && `${project.address.suburb}, `}
                    {project.address.city}
                  </p>
                  <p className="text-xs text-slate-400">
                    Consultant: {project.consultant.name}
                  </p>
                  <div className="flex gap-3 text-xs text-slate-500 font-mono">
                    <span>{project.rooms.length} rooms</span>
                    <span>·</span>
                    <span>{totalProjectWindows} windows</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {format(new Date(project.createdAt), 'dd MMM yyyy')}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<FolderOpen size={14} />}
                    onClick={() => {
                      setActiveProject(project.id);
                      navigate(`/project/${project.id}`);
                    }}
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<FileDown size={14} />}
                    onClick={() => navigate(`/project/${project.id}/export`)}
                  >
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Archive size={14} />}
                    onClick={() =>
                      updateProject(project.id, {
                        status: project.status === 'archived' ? 'active' : 'archived',
                      })
                    }
                  >
                    {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={<Trash2 size={14} />}
                    onClick={() => handleDelete(project.id, project.projectName)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
