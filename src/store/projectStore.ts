import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Project,
  Room,
  WindowMeasurement,
  ClientDetails,
  ConsultantDetails,
  AddressDetails,
  PhotoData,
} from '../types';
import { WindowType, FurnishingType } from '../types';

interface NewProjectData {
  projectName: string;
  client: ClientDetails;
  consultant: ConsultantDetails;
  address: AddressDetails;
  rooms: string[];
  specialNotes?: string;
}

interface ProjectStore {
  projects: Omit<Project, 'totalWindows'>[];
  activeProjectId: string | null;
  activeRoomId: string | null;
  activeWindowId: string | null;

  createProject: (data: NewProjectData) => string;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'totalWindows'>>) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  addRoom: (projectId: string, roomName: string) => string;
  updateRoom: (projectId: string, roomId: string, data: Partial<Room>) => void;
  deleteRoom: (projectId: string, roomId: string) => void;
  addWindow: (projectId: string, roomId: string, windowData?: Partial<WindowMeasurement>) => string;
  updateWindow: (projectId: string, roomId: string, windowId: string, data: Partial<WindowMeasurement>) => void;
  deleteWindow: (projectId: string, roomId: string, windowId: string) => void;
  setWindowPhoto: (projectId: string, roomId: string, windowId: string, photoData: PhotoData) => void;
  setProcessedImage: (projectId: string, roomId: string, windowId: string, imageUrl: string) => void;
  getProject: (id: string) => Omit<Project, 'totalWindows'> | undefined;
  getTotalWindows: (projectId: string) => number;
}

const defaultMeasurements = () => ({
  windowWidth: null,
  windowHeight: null,
  ceilingToFloor: null,
  ceilingToTopOfArchitrave: null,
  bottomOfArchitraveToFloor: null,
  architraveWidth: null,
  architraveProjection: null,
  recessDepth: null,
  stackingClearanceLeft: null,
  stackingClearanceRight: null,
  dropToCleats: null,
  controlSide: null,
  openingDirection: null,
  notes: '',
});

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      activeRoomId: null,
      activeWindowId: null,

      createProject: (data) => {
        const id = uuidv4();
        const now = new Date();
        const newProject: Omit<Project, 'totalWindows'> = {
          id,
          projectName: data.projectName,
          createdAt: now,
          updatedAt: now,
          status: 'active',
          client: data.client,
          consultant: data.consultant,
          address: { ...data.address, country: data.address.country || 'New Zealand' },
          rooms: data.rooms.map((name) => ({
            id: uuidv4(),
            name,
            windows: [],
          })),
          specialNotes: data.specialNotes || '',
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: id,
        }));
        return id;
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        }));
      },

      setActiveProject: (id) => {
        set({ activeProjectId: id, activeRoomId: null, activeWindowId: null });
      },

      addRoom: (projectId, roomName) => {
        const roomId = uuidv4();
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  rooms: [...p.rooms, { id: roomId, name: roomName, windows: [] }],
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
        return roomId;
      },

      updateRoom: (projectId, roomId, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  rooms: p.rooms.map((r) => (r.id === roomId ? { ...r, ...data } : r)),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },

      deleteRoom: (projectId, roomId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  rooms: p.rooms.filter((r) => r.id !== roomId),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },

      addWindow: (projectId, roomId, windowData) => {
        const windowId = uuidv4();
        const project = get().projects.find((p) => p.id === projectId);
        const room = project?.rooms.find((r) => r.id === roomId);
        const windowCount = room?.windows.length || 0;
        const newWindow: WindowMeasurement = {
          id: windowId,
          tag: `W${windowCount + 1}`,
          windowType: WindowType.SINGLE_HUNG,
          furnishingType: FurnishingType.ROLLER_BLIND,
          location: 'inside',
          measurements: defaultMeasurements(),
          photo: null,
          processedImageUrl: null,
          specialNotes: '',
          createdAt: new Date(),
          ...windowData,
        };
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  rooms: p.rooms.map((r) =>
                    r.id === roomId
                      ? { ...r, windows: [...r.windows, newWindow] }
                      : r
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
        return windowId;
      },

      updateWindow: (projectId, roomId, windowId, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  rooms: p.rooms.map((r) =>
                    r.id === roomId
                      ? {
                          ...r,
                          windows: r.windows.map((w) =>
                            w.id === windowId ? { ...w, ...data } : w
                          ),
                        }
                      : r
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },

      deleteWindow: (projectId, roomId, windowId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  rooms: p.rooms.map((r) =>
                    r.id === roomId
                      ? { ...r, windows: r.windows.filter((w) => w.id !== windowId) }
                      : r
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },

      setWindowPhoto: (projectId, roomId, windowId, photoData) => {
        get().updateWindow(projectId, roomId, windowId, { photo: photoData });
      },

      setProcessedImage: (projectId, roomId, windowId, imageUrl) => {
        get().updateWindow(projectId, roomId, windowId, { processedImageUrl: imageUrl });
      },

      getProject: (id) => get().projects.find((p) => p.id === id),

      getTotalWindows: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return 0;
        return project.rooms.reduce((sum, room) => sum + room.windows.length, 0);
      },
    }),
    {
      name: 'measurepro-projects',
    }
  )
);
