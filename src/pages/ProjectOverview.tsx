import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  MapPin,
  User,
  Phone,
  Mail,
  ChevronLeft,
  Edit2,
  Trash2,
  Square,
  FileDown,
} from 'lucide-react';
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

export const ProjectOverview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, addRoom, deleteRoom, setActiveProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [newRoomName, setNewRoomName] = useState('');
  const [adding, setAdding] = useState(false);

  const project = projects.find((p) => p.id === id);

  React.useEffect(() => {
    if (id) setActiveProject(id);
  }, [id, setActiveProject]);

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<Square size={32} />}
          title="Project not found"
          description="This project may have been deleted."
          action={{ label: 'Back to Dashboard', onClick: () => navigate('/') }}
        />
      </div>
    );
  }

  const totalWindows = project.rooms.reduce((s, r) => s + r.windows.length, 0);

  const handleAddRoom = () => {
    const name = newRoomName.trim();
    if (!name) return;
    const roomId = addRoom(project.id, name);
    setNewRoomName('');
    setAdding(false);
    addToast(`Room "${name}" added`, 'success');
    navigate(`/project/${project.id}/room/${roomId}`);
  };

  const handleDeleteRoom = (roomId: string, roomName: string) => {
    if (confirm(`Delete room "${roomName}" and all its windows?`)) {
      deleteRoom(project.id, roomId);
      addToast('Room deleted', 'success');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"
      >
        <ChevronLeft size={16} /> All Projects
      </button>

      {/* Project Header */}
      <div className="bg-[#0F1B2D] rounded-2xl p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{project.projectName}</h1>
              <Badge variant={statusColors[project.status]}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-1 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <User size={14} className="text-teal-400" />
                <span>{project.client.firstName} {project.client.lastName}</span>
                {project.client.company && <span className="text-slate-400">· {project.client.company}</span>}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-teal-400" />
                <span>
                  {project.address.streetNumber} {project.address.streetName},{' '}
                  {project.address.suburb && `${project.address.suburb}, `}
                  {project.address.city}
                </span>
              </div>
              {project.client.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-teal-400" />
                  <span>{project.client.phone}</span>
                </div>
              )}
              {project.client.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-teal-400" />
                  <span>{project.client.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm text-slate-300 shrink-0">
            <div>
              <span className="text-slate-400 text-xs">Consultant</span>
              <p className="font-medium">{project.consultant.name}</p>
              <p className="text-xs text-slate-400">{project.consultant.company}</p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="secondary"
                icon={<FileDown size={14} />}
                onClick={() => navigate(`/project/${project.id}/export`)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Export PDF
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<Edit2 size={14} />}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Edit
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-white/10 text-sm font-mono">
          <span className="text-teal-400 font-semibold">{project.rooms.length}</span>
          <span className="text-slate-400">rooms</span>
          <span className="text-teal-400 font-semibold">{totalWindows}</span>
          <span className="text-slate-400">windows</span>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Rooms</h2>
        <Button
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => setAdding(true)}
        >
          Add Room
        </Button>
      </div>

      {adding && (
        <div className="flex gap-2 mb-4">
          <input
            autoFocus
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddRoom();
              if (e.key === 'Escape') setAdding(false);
            }}
            placeholder="Room name..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]"
          />
          <Button onClick={handleAddRoom}>Add</Button>
          <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      )}

      {project.rooms.length === 0 ? (
        <EmptyState
          icon={<Square size={32} />}
          title="No rooms yet"
          description="Add a room to start measuring windows"
          action={{ label: 'Add First Room', onClick: () => setAdding(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {project.rooms.map((room) => (
            <Card
              key={room.id}
              hoverable
              onClick={() => navigate(`/project/${project.id}/room/${room.id}`)}
              className="group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-800">{room.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRoom(room.id, room.name);
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="text-2xl font-bold font-mono text-slate-800 mb-1">
                {room.windows.length}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                window{room.windows.length !== 1 ? 's' : ''}
              </p>

              {/* Window thumbnails */}
              {room.windows.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {room.windows.slice(0, 6).map((w) => (
                    <div
                      key={w.id}
                      className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center"
                    >
                      {w.processedImageUrl ? (
                        <img
                          src={w.processedImageUrl}
                          alt={w.tag}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Square size={12} className="text-slate-400" />
                      )}
                    </div>
                  ))}
                  {room.windows.length > 6 && (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-mono">
                      +{room.windows.length - 6}
                    </div>
                  )}
                </div>
              )}

              <Button
                size="sm"
                variant="ghost"
                icon={<Plus size={14} />}
                className="w-full justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/project/${project.id}/room/${room.id}`);
                }}
              >
                Add Window
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
