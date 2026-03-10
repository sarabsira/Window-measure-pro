import type { Project } from '../types';
import { windowTypeLabels, furnishingTypeLabels } from './labels';

export function exportProjectCSV(project: Omit<Project, 'totalWindows'>): void {
  const headers = [
    'Room', 'Tag', 'Window Type', 'Furnishing Type', 'Fit Type',
    'Width (mm)', 'Height (mm)', 'Ceiling to Floor (mm)',
    'C to Top Architrave (mm)', 'Bot Architrave to Floor (mm)',
    'Architrave Width (mm)', 'Architrave Projection (mm)', 'Recess Depth (mm)',
    'Stack Left (mm)', 'Stack Right (mm)', 'Drop to Cleats (mm)',
    'Control Side', 'Opening Direction', 'Notes',
  ];

  const rows: string[][] = [];
  project.rooms.forEach((room) => {
    room.windows.forEach((w) => {
      const m = w.measurements;
      rows.push([
        room.name,
        w.tag,
        windowTypeLabels[w.windowType],
        furnishingTypeLabels[w.furnishingType],
        w.location,
        String(m.windowWidth ?? ''),
        String(m.windowHeight ?? ''),
        String(m.ceilingToFloor ?? ''),
        String(m.ceilingToTopOfArchitrave ?? ''),
        String(m.bottomOfArchitraveToFloor ?? ''),
        String(m.architraveWidth ?? ''),
        String(m.architraveProjection ?? ''),
        String(m.recessDepth ?? ''),
        String(m.stackingClearanceLeft ?? ''),
        String(m.stackingClearanceRight ?? ''),
        String(m.dropToCleats ?? ''),
        m.controlSide ?? '',
        m.openingDirection ?? '',
        w.specialNotes,
      ]);
    });
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.projectName.replace(/\s+/g, '-')}-measurements.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
