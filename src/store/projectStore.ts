import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Job, CurtainWindow, CurtainMeasurements, ResidentDetails } from '../types';

const defaultMeasurements = (): CurtainMeasurements => ({
  width: null,
  height: null,
  stackLeft: null,
  stackRight: null,
  trackHeightAboveFrame: null,
  reductionFromFloor: null,
  curtainType: null,
  controlSide: null,
  fabricName: '',
  liningType: '',
});

interface JobStore {
  jobs: Job[];

  createJob: (data: { village: string; resident: ResidentDetails; consultantName: string }) => string;
  deleteJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;

  addWindow: (jobId: string) => string;
  updateWindow: (jobId: string, windowId: string, data: Partial<CurtainWindow>) => void;
  deleteWindow: (jobId: string, windowId: string) => void;
}

export const useProjectStore = create<JobStore>()(
  persist(
    (set, get) => ({
      jobs: [],

      createJob: ({ village, resident, consultantName }) => {
        const id = uuidv4();
        const now = new Date();
        set((state) => ({
          jobs: [
            ...state.jobs,
            { id, village, resident, consultantName, windows: [], createdAt: now, updatedAt: now },
          ],
        }));
        return id;
      },

      deleteJob: (id) => {
        set((state) => ({ jobs: state.jobs.filter((j) => j.id !== id) }));
      },

      getJob: (id) => get().jobs.find((j) => j.id === id),

      addWindow: (jobId) => {
        const windowId = uuidv4();
        const job = get().jobs.find((j) => j.id === jobId);
        const count = job?.windows.length ?? 0;
        const newWindow: CurtainWindow = {
          id: windowId,
          tag: `W${count + 1}`,
          measurements: defaultMeasurements(),
          createdAt: new Date(),
        };
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === jobId
              ? { ...j, windows: [...j.windows, newWindow], updatedAt: new Date() }
              : j
          ),
        }));
        return windowId;
      },

      updateWindow: (jobId, windowId, data) => {
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  windows: j.windows.map((w) => (w.id === windowId ? { ...w, ...data } : w)),
                  updatedAt: new Date(),
                }
              : j
          ),
        }));
      },

      deleteWindow: (jobId, windowId) => {
        set((state) => ({
          jobs: state.jobs.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  windows: j.windows.filter((w) => w.id !== windowId),
                  updatedAt: new Date(),
                }
              : j
          ),
        }));
      },
    }),
    { name: 'ryman-curtain-jobs' }
  )
);
