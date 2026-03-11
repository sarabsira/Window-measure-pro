import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderOpen, Trash2, Layers, Download, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { EmptyState } from '../components/UI/EmptyState';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { jobs, deleteJob } = useProjectStore();
  const { addToast } = useUIStore();
  const [search, setSearch] = useState('');

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      !q ||
      j.village.toLowerCase().includes(q) ||
      j.resident.name.toLowerCase().includes(q) ||
      j.resident.unitNumber.toLowerCase().includes(q) ||
      j.consultantName.toLowerCase().includes(q)
    );
  });

  const totalWindows = jobs.reduce((sum, j) => sum + j.windows.length, 0);

  const handleDelete = (id: string, village: string, residentName: string) => {
    if (confirm(`Delete job for ${residentName} at ${village}? This cannot be undone.`)) {
      deleteJob(id);
      addToast('Job deleted', 'success');
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(jobs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ryman-curtain-jobs-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Data exported', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          const existingIds = new Set(jobs.map((j) => j.id));
          let added = 0;
          imported.forEach((j) => {
            if (!existingIds.has(j.id)) {
              useProjectStore.setState((state) => ({ jobs: [...state.jobs, j] }));
              added++;
            }
          });
          addToast(`Imported ${added} job(s)`, 'success');
        }
      } catch {
        addToast('Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1B2D]">Ryman Curtain Measure</h1>
          <p className="text-slate-400 text-sm mt-0.5">Auckland Village Curtain Measurement Tool</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px]">
              <Upload size={16} /> Import
            </span>
          </label>
          <Button variant="secondary" size="sm" icon={<Download size={16} />} onClick={handleExport}>
            Export
          </Button>
          <Button size="md" icon={<Plus size={18} />} onClick={() => navigate('/job/new')}>
            New Job
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Total Jobs', value: jobs.length, icon: <FolderOpen size={20} /> },
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

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by village, resident or consultant..."
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]"
        />
      </div>

      {/* Job list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={32} />}
          title={search ? 'No jobs found' : 'No jobs yet'}
          description={
            search ? 'Try adjusting your search' : 'Start a new job to begin measuring curtains'
          }
          action={!search ? { label: 'New Job', onClick: () => navigate('/job/new') } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <Card key={job.id} hoverable className="group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{job.village}</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Unit {job.resident.unitNumber} · {job.resident.name}</p>
                </div>
              </div>

              <div className="space-y-1 mb-4 text-xs text-slate-400">
                {job.resident.phone && <p>{job.resident.phone}</p>}
                {job.resident.email && <p>{job.resident.email}</p>}
                <p>Consultant: {job.consultantName}</p>
                <p className="font-mono text-slate-500">{job.windows.length} window{job.windows.length !== 1 ? 's' : ''}</p>
                <p className="text-slate-300">{format(new Date(job.createdAt), 'dd MMM yyyy')}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  icon={<FolderOpen size={14} />}
                  onClick={() => navigate(`/job/${job.id}`)}
                  className="flex-1"
                >
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  icon={<Trash2 size={14} />}
                  onClick={() => handleDelete(job.id, job.village, job.resident.name)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
