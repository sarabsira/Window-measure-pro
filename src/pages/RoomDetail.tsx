import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, Edit2, Check, Square } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/UI/Button';
import { EmptyState } from '../components/UI/EmptyState';
import { WindowCard } from '../components/Windows/WindowCard';

export const RoomDetail: React.FC = () => {
  const { id, roomId } = useParams<{ id: string; roomId: string }>();
  const navigate = useNavigate();
  const { projects, addWindow, updateRoom } = useProjectStore();
  const { addToast } = useUIStore();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const project = projects.find((p) => p.id === id);
  const room = project?.rooms.find((r) => r.id === roomId);

  if (!room || !project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Square size={32} />}
          title="Room not found"
          description="This room may have been deleted."
          action={{ label: 'Back to Project', onClick: () => navigate(`/project/${id}`) }}
        />
      </div>
    );
  }

  const handleAddWindow = () => {
    const windowId = addWindow(project.id, room.id);
    navigate(`/project/${project.id}/room/${room.id}/window/${windowId}`);
  };

  const handleRenameRoom = () => {
    const name = nameInput.trim();
    if (name) {
      updateRoom(project.id, room.id, { name });
      addToast('Room renamed', 'success');
    }
    setEditingName(false);
  };

  const totalCompletion =
    room.windows.length > 0
      ? Math.round(
          room.windows.reduce((sum, w) => {
            const filled = [
              w.measurements.windowWidth,
              w.measurements.windowHeight,
              w.measurements.ceilingToFloor,
              w.measurements.controlSide,
            ].filter(Boolean).length;
            return sum + (filled / 4) * 100;
          }, 0) / room.windows.length
        )
      : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(`/project/${id}`)}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"
      >
        <ChevronLeft size={16} /> {project.projectName}
      </button>

      {/* Room Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameRoom();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                className="text-2xl font-bold rounded-lg border border-teal-400 px-2 py-1 focus:outline-none"
              />
              <button onClick={handleRenameRoom} className="p-1.5 rounded-lg bg-teal-400 text-white">
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">{room.name}</h1>
              <button
                onClick={() => { setNameInput(room.name); setEditingName(true); }}
                className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
        <Button icon={<Plus size={18} />} onClick={handleAddWindow}>
          Add Window
        </Button>
      </div>

      {/* Summary bar */}
      {room.windows.length > 0 && (
        <div className="bg-[#0F1B2D] rounded-xl p-4 mb-6 text-white flex items-center gap-6">
          <div>
            <div className="text-2xl font-bold font-mono text-teal-400">{room.windows.length}</div>
            <div className="text-xs text-slate-400">windows</div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Room completion</span>
              <span className="font-mono">{totalCompletion}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-400 rounded-full transition-all"
                style={{ width: `${totalCompletion}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Window grid */}
      {room.windows.length === 0 ? (
        <EmptyState
          icon={<Square size={32} />}
          title="No windows yet"
          description="Add your first window to start measuring"
          action={{ label: 'Add Window', onClick: handleAddWindow }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {room.windows.map((w) => (
            <WindowCard
              key={w.id}
              window={w}
              projectId={project.id}
              roomId={room.id}
            />
          ))}
          {/* Add more card */}
          <button
            onClick={handleAddWindow}
            className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 p-8 hover:border-teal-400 hover:bg-teal-50/30 transition-colors min-h-[200px]"
          >
            <Plus size={24} className="text-slate-300" />
            <span className="text-sm text-slate-400">Add Window</span>
          </button>
        </div>
      )}
    </div>
  );
};
