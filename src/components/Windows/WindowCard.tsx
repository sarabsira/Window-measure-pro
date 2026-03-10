import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Trash2, Square } from 'lucide-react';
import { Badge } from '../UI/Badge';
import { windowTypeLabels, furnishingTypeLabels } from '../../utils/labels';
import type { WindowMeasurement } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { v4 as uuidv4 } from 'uuid';

interface WindowCardProps {
  window: WindowMeasurement;
  projectId: string;
  roomId: string;
}

function completionScore(w: WindowMeasurement): number {
  const m = w.measurements;
  const fields = [
    m.windowWidth, m.windowHeight, m.ceilingToFloor, m.ceilingToTopOfArchitrave,
    m.bottomOfArchitraveToFloor, m.architraveWidth, m.controlSide,
  ];
  const filled = fields.filter((v) => v !== null && v !== undefined).length;
  const photoScore = w.photo ? 1 : 0;
  return Math.round(((filled + photoScore) / (fields.length + 1)) * 100);
}

export const WindowCard: React.FC<WindowCardProps> = ({ window, projectId, roomId }) => {
  const navigate = useNavigate();
  const { deleteWindow, addWindow } = useProjectStore();
  const { addToast } = useUIStore();
  const completion = completionScore(window);

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const project = useProjectStore.getState().projects.find((p) => p.id === projectId);
    const room = project?.rooms.find((r) => r.id === roomId);
    if (!room) return;
    const newId = uuidv4();
    addWindow(projectId, roomId, {
      ...window,
      id: newId,
      tag: `${window.tag} (copy)`,
      createdAt: new Date(),
    });
    addToast('Window duplicated', 'success');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete window "${window.tag}"?`)) {
      deleteWindow(projectId, roomId, window.id);
      addToast('Window deleted', 'success');
    }
  };

  return (
    <div
      onClick={() => navigate(`/project/${projectId}/room/${roomId}/window/${window.id}`)}
      className="bg-white rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-teal-200 transition-all duration-200 overflow-hidden group"
    >
      {/* Image */}
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        {window.processedImageUrl ? (
          <img
            src={window.processedImageUrl}
            alt={window.tag}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Square size={32} className="text-slate-200" />
          </div>
        )}
        {/* Hover actions */}
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDuplicate}
            className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center shadow text-slate-600 hover:text-teal-600"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center shadow text-slate-600 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-slate-800 text-base">{window.tag}</h3>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant="teal">{windowTypeLabels[window.windowType]}</Badge>
            <Badge variant="default">{furnishingTypeLabels[window.furnishingType]}</Badge>
          </div>
        </div>

        {window.measurements.windowWidth && window.measurements.windowHeight ? (
          <p className="text-xl font-bold font-mono text-teal-600 mb-2">
            {window.measurements.windowWidth} × {window.measurements.windowHeight}
            <span className="text-sm font-normal text-slate-400 ml-1">mm</span>
          </p>
        ) : (
          <p className="text-sm text-slate-300 mb-2 font-mono">Dimensions not set</p>
        )}

        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant={window.location === 'inside' ? 'blue' : window.location === 'outside' ? 'amber' : 'purple'}
          >
            {window.location} fit
          </Badge>
          {window.measurements.controlSide && (
            <Badge variant="default">
              {window.measurements.controlSide} control
            </Badge>
          )}
        </div>

        {/* Completion bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Completion</span>
            <span className="font-mono">{completion}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-400 rounded-full transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>

        {window.specialNotes && (
          <p className="mt-2 text-xs text-slate-400 truncate">{window.specialNotes}</p>
        )}
      </div>
    </div>
  );
};
