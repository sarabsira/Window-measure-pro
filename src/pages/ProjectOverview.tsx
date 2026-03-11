import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Trash2, Square, MapPin, User, Phone, Mail } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { EmptyState } from '../components/UI/EmptyState';

export const ProjectOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, addWindow, deleteWindow, deleteJob } = useProjectStore();
  const { addToast } = useUIStore();

  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Square size={32} />}
          title="Job not found"
          description="This job may have been deleted."
          action={{ label: 'Back to Dashboard', onClick: () => navigate('/') }}
        />
      </div>
    );
  }

  const handleAddWindow = () => {
    const windowId = addWindow(job.id);
    navigate(`/job/${job.id}/window/${windowId}`);
  };

  const handleDeleteWindow = (windowId: string, tag: string) => {
    if (confirm(`Delete window ${tag}?`)) {
      deleteWindow(job.id, windowId);
      addToast('Window deleted', 'success');
    }
  };

  const handleDeleteJob = () => {
    if (confirm(`Delete this entire job for ${job.resident.name}? This cannot be undone.`)) {
      deleteJob(job.id);
      navigate('/');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"
      >
        <ChevronLeft size={16} /> All Jobs
      </button>

      {/* Job header */}
      <div className="bg-[#0F1B2D] rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} className="text-teal-400" />
              <h1 className="text-xl font-bold">{job.village}</h1>
            </div>
            <div className="space-y-1 text-sm text-slate-300 mt-3">
              <div className="flex items-center gap-2">
                <User size={14} className="text-teal-400" />
                <span>{job.resident.name}</span>
                <span className="text-slate-400">· Unit {job.resident.unitNumber}</span>
              </div>
              {job.resident.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-teal-400" />
                  <span>{job.resident.phone}</span>
                </div>
              )}
              {job.resident.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-teal-400" />
                  <span>{job.resident.email}</span>
                </div>
              )}
              <p className="text-slate-400 text-xs mt-2">Consultant: {job.consultantName}</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              icon={<Trash2 size={14} />}
              onClick={handleDeleteJob}
              className="bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
            >
              Delete Job
            </Button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 text-sm font-mono">
          <span className="text-teal-400 font-semibold">{job.windows.length}</span>
          <span className="text-slate-400 ml-2">window{job.windows.length !== 1 ? 's' : ''} measured</span>
        </div>
      </div>

      {/* Windows */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Windows</h2>
        <Button size="sm" icon={<Plus size={16} />} onClick={handleAddWindow}>
          Add Window
        </Button>
      </div>

      {job.windows.length === 0 ? (
        <EmptyState
          icon={<Square size={32} />}
          title="No windows yet"
          description="Add your first window to start measuring"
          action={{ label: 'Add Window', onClick: handleAddWindow }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {job.windows.map((w) => {
            const m = w.measurements;
            const hasSize = m.width && m.height;
            return (
              <Card key={w.id} hoverable onClick={() => navigate(`/job/${job.id}/window/${w.id}`)} className="group">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-lg font-bold font-mono text-teal-500">{w.tag}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteWindow(w.id, w.tag); }}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {hasSize ? (
                  <p className="text-sm font-mono text-slate-700 mb-1">
                    {m.width} × {m.height} mm
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 mb-1">No dimensions yet</p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.curtainType && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-teal-50 text-teal-600 border border-teal-100 capitalize">
                      {m.curtainType}
                    </span>
                  )}
                  {m.controlSide && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-50 text-slate-500 border border-slate-100 capitalize">
                      {m.controlSide} control
                    </span>
                  )}
                  {m.fabricName && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-50 text-slate-500 border border-slate-100">
                      {m.fabricName}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
          <button
            onClick={handleAddWindow}
            className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 p-8 hover:border-teal-400 hover:bg-teal-50/30 transition-colors min-h-[160px]"
          >
            <Plus size={24} className="text-slate-300" />
            <span className="text-sm text-slate-400">Add Window</span>
          </button>
        </div>
      )}
    </div>
  );
};
