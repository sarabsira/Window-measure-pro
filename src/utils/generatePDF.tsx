import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { format } from 'date-fns';
import type { Project, WindowMeasurement } from '../types';
import { windowTypeLabels, furnishingTypeLabels } from './labels';

Font.register({
  family: 'Helvetica',
  fonts: [],
});

const TEAL = '#2DD4BF';
const NAVY = '#0F1B2D';
const GREY = '#64748B';
const LIGHT_GREY = '#F8FAFC';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
  },
  pageHeader: {
    backgroundColor: NAVY,
    padding: '16 24',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  pageHeaderSub: {
    color: '#94A3B8',
    fontSize: 8,
  },
  tealBar: {
    height: 4,
    backgroundColor: TEAL,
  },
  body: {
    padding: '24 32',
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 4,
  },
  coverSub: {
    fontSize: 11,
    color: GREY,
    letterSpacing: 2,
    marginBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 8,
    color: TEAL,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  fieldLabel: {
    fontSize: 9,
    color: GREY,
    width: 140,
  },
  fieldValue: {
    fontSize: 9,
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    padding: '6 8',
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: '5 8',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRowAlt: {
    backgroundColor: LIGHT_GREY,
  },
  tableCell: {
    fontSize: 8,
    color: NAVY,
  },
  tableCellGrey: {
    fontSize: 8,
    color: GREY,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    right: 32,
    fontSize: 8,
    color: GREY,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    marginBottom: 4,
    height: 40,
  },
  signatureLabel: {
    fontSize: 8,
    color: GREY,
  },
  windowDetailContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  windowImage: {
    width: '50%',
    aspectRatio: 1,
    objectFit: 'contain',
  },
  windowMeasurements: {
    flex: 1,
  },
  measureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  measureLabel: {
    fontSize: 8,
    color: GREY,
  },
  measureValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  notesBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: LIGHT_GREY,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: TEAL,
  },
  notesText: {
    fontSize: 8,
    color: NAVY,
  },
  roomHeader: {
    backgroundColor: '#F1F5F9',
    padding: '5 8',
    marginTop: 8,
  },
  roomHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
});

const PageHeader: React.FC<{ project: Project | Omit<Project, 'totalWindows'>; subtitle: string }> = ({ project, subtitle }) => (
  <View>
    <View style={styles.pageHeader}>
      <View>
        <Text style={styles.pageHeaderTitle}>{project.projectName}</Text>
        <Text style={styles.pageHeaderSub}>
          {project.client.firstName} {project.client.lastName} · {project.address.city}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.pageHeaderSub, { color: TEAL }]}>MeasurePro</Text>
        <Text style={styles.pageHeaderSub}>{subtitle}</Text>
      </View>
    </View>
    <View style={styles.tealBar} />
  </View>
);

const MeasureRow: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
  value != null && value !== '' ? (
    <View style={styles.measureRow}>
      <Text style={styles.measureLabel}>{label}</Text>
      <Text style={styles.measureValue}>{typeof value === 'number' ? `${value}mm` : value}</Text>
    </View>
  ) : null
);

const WindowDetailPage: React.FC<{
  window: WindowMeasurement;
  projectName: string;
  roomName: string;
  index: number;
  total: number;
  project: Project | Omit<Project, 'totalWindows'>;
}> = ({ window: w, projectName, roomName, index, total, project }) => {
  const m = w.measurements;
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader project={project} subtitle={`${roomName} · ${w.tag}`} />
      <View style={styles.body}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: NAVY }}>{w.tag}</Text>
            <Text style={{ fontSize: 9, color: GREY }}>{roomName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 9, color: GREY }}>{windowTypeLabels[w.windowType]}</Text>
            <Text style={{ fontSize: 9, color: NAVY, fontFamily: 'Helvetica-Bold' }}>{furnishingTypeLabels[w.furnishingType]}</Text>
          </View>
        </View>

        <View style={styles.windowDetailContainer}>
          <View style={{ width: '48%' }}>
            {w.processedImageUrl ? (
              <Image src={w.processedImageUrl} style={{ width: '100%', borderRadius: 4 }} />
            ) : (
              <View style={{ width: '100%', aspectRatio: 1.2, backgroundColor: LIGHT_GREY, borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#CBD5E1' }}>No photo</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>Measurements</Text>
            <MeasureRow label="Width" value={m.windowWidth ? `${m.windowWidth}mm` : null} />
            <MeasureRow label="Height" value={m.windowHeight ? `${m.windowHeight}mm` : null} />
            <MeasureRow label="Ceiling to Floor" value={m.ceilingToFloor} />
            <MeasureRow label="C to Top Architrave" value={m.ceilingToTopOfArchitrave} />
            <MeasureRow label="Bot Architrave to Floor" value={m.bottomOfArchitraveToFloor} />
            <MeasureRow label="Architrave Width" value={m.architraveWidth} />
            <MeasureRow label="Architrave Projection" value={m.architraveProjection} />
            <MeasureRow label="Recess Depth" value={m.recessDepth} />
            <MeasureRow label="Stack Left" value={m.stackingClearanceLeft} />
            <MeasureRow label="Stack Right" value={m.stackingClearanceRight} />
            <MeasureRow label="Drop to Cleats" value={m.dropToCleats} />
            <MeasureRow label="Fit Type" value={w.location} />
            <MeasureRow label="Control Side" value={m.controlSide} />
            <MeasureRow label="Opening Direction" value={m.openingDirection} />
          </View>
        </View>

        {w.specialNotes && (
          <View style={styles.notesBox}>
            <Text style={[styles.sectionLabel, { marginBottom: 2 }]}>Notes</Text>
            <Text style={styles.notesText}>{w.specialNotes}</Text>
          </View>
        )}
      </View>
      <Text style={styles.pageNumber}>Window {index} of {total} · {projectName} · {format(new Date(), 'dd MMM yyyy')}</Text>
    </Page>
  );
};

export const MeasureProPDF: React.FC<{ project: Omit<Project, 'totalWindows'> }> = ({ project }) => {
  const allWindows: { window: WindowMeasurement; roomName: string }[] = project.rooms.flatMap(
    (room) => room.windows.map((w) => ({ window: w, roomName: room.name }))
  );
  const totalWindows = allWindows.length;
  const measureDate = format(new Date(project.createdAt), 'dd MMM yyyy');

  return (
    <Document title={`${project.projectName} - MeasurePro`}>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={[styles.tealBar]} />
        <View style={[styles.body, { flex: 1 }]}>
          <View style={{ marginBottom: 48 }}>
            <Text style={{ fontSize: 9, color: TEAL, fontFamily: 'Helvetica-Bold', letterSpacing: 2, marginBottom: 32 }}>
              MEASUREPRO · WINDOW FURNISHING MEASURE SHEET
            </Text>
            <Text style={styles.coverTitle}>{project.projectName}</Text>
            <Text style={styles.coverSub}>WINDOW FURNISHING MEASURE SHEET</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 32 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>Client</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 }}>
                {project.client.firstName} {project.client.lastName}
              </Text>
              {project.client.company && <Text style={{ fontSize: 9, color: GREY, marginBottom: 2 }}>{project.client.company}</Text>}
              <Text style={{ fontSize: 9, color: GREY, marginBottom: 2 }}>
                {project.address.streetNumber} {project.address.streetName}
                {project.address.suburb ? `, ${project.address.suburb}` : ''}
                {`, ${project.address.city} ${project.address.postcode}`}
              </Text>
              {project.client.phone && <Text style={{ fontSize: 9, color: GREY, marginBottom: 2 }}>{project.client.phone}</Text>}
              {project.client.email && <Text style={{ fontSize: 9, color: GREY }}>{project.client.email}</Text>}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>Consultant</Text>
              <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 }}>
                {project.consultant.name}
              </Text>
              <Text style={{ fontSize: 9, color: GREY, marginBottom: 2 }}>{project.consultant.company}</Text>
              <Text style={{ fontSize: 9, color: GREY, marginBottom: 2 }}>{project.consultant.phone}</Text>
              <Text style={{ fontSize: 9, color: GREY }}>{project.consultant.email}</Text>
            </View>
          </View>

          <View style={{ marginTop: 32, padding: '12 16', backgroundColor: LIGHT_GREY, borderRadius: 4 }}>
            <View style={{ flexDirection: 'row', gap: 32 }}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of Measure</Text>
                <Text style={styles.fieldValue}>{measureDate}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Total Windows</Text>
                <Text style={styles.fieldValue}>{totalWindows}</Text>
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Status</Text>
                <Text style={styles.fieldValue}>{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</Text>
              </View>
            </View>
          </View>

          {project.specialNotes && (
            <View style={[styles.notesBox, { marginTop: 16 }]}>
              <Text style={styles.sectionLabel}>Property Notes</Text>
              <Text style={styles.notesText}>{project.specialNotes}</Text>
            </View>
          )}
        </View>
        <Text style={styles.pageNumber}>Generated by MeasurePro · {format(new Date(), 'dd MMM yyyy')}</Text>
      </Page>

      {/* Summary Table */}
      <Page size="A4" style={styles.page}>
        <PageHeader project={project} subtitle="Project Summary" />
        <View style={styles.body}>
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 16 }}>Project Summary</Text>

          <View style={styles.tableHeader}>
            {['Room', 'Tag', 'Window Type', 'Furnishing', 'W (mm)', 'H (mm)', 'Fit', 'Notes'].map((h, i) => (
              <Text key={h} style={[styles.tableHeaderCell, { flex: i < 2 ? 1.5 : i < 4 ? 2 : 1 }]}>{h}</Text>
            ))}
          </View>

          {project.rooms.map((room) => (
            <React.Fragment key={room.id}>
              <View style={styles.roomHeader}>
                <Text style={styles.roomHeaderText}>{room.name} — {room.windows.length} window{room.windows.length !== 1 ? 's' : ''}</Text>
              </View>
              {room.windows.map((w, i) => (
                <View key={w.id} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>{room.name}</Text>
                  <Text style={[styles.tableCell, { flex: 1.5, fontFamily: 'Helvetica-Bold' }]}>{w.tag}</Text>
                  <Text style={[styles.tableCellGrey, { flex: 2 }]}>{windowTypeLabels[w.windowType]}</Text>
                  <Text style={[styles.tableCellGrey, { flex: 2 }]}>{furnishingTypeLabels[w.furnishingType]}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{w.measurements.windowWidth ?? '—'}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{w.measurements.windowHeight ?? '—'}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{w.location}</Text>
                  <Text style={[styles.tableCellGrey, { flex: 1 }]}>{(w.specialNotes || '—').substring(0, 20)}</Text>
                </View>
              ))}
            </React.Fragment>
          ))}

          <View style={[styles.tableRow, { backgroundColor: '#EEF2FF', marginTop: 4 }]}>
            <Text style={[styles.tableCell, { flex: 1.5, fontFamily: 'Helvetica-Bold' }]}>TOTAL</Text>
            <Text style={[styles.tableCell, { flex: 1.5 }]} />
            <Text style={[styles.tableCell, { flex: 2 }]} />
            <Text style={[styles.tableCell, { flex: 2 }]} />
            <Text style={[styles.tableCell, { flex: 1, fontFamily: 'Helvetica-Bold' }]}>{totalWindows}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]} />
            <Text style={[styles.tableCell, { flex: 1 }]} />
            <Text style={[styles.tableCell, { flex: 1 }]} />
          </View>
        </View>
        <Text style={styles.pageNumber}>Page 2 · {project.projectName}</Text>
      </Page>

      {/* Window detail pages */}
      {allWindows.map(({ window: w, roomName }, i) => (
        <WindowDetailPage
          key={w.id}
          window={w}
          projectName={project.projectName}
          roomName={roomName}
          index={i + 1}
          total={totalWindows}
          project={project}
        />
      ))}

      {/* Sign-off page */}
      <Page size="A4" style={styles.page}>
        <PageHeader project={project} subtitle="Sign-off" />
        <View style={styles.body}>
          <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 8 }}>Measure Confirmation</Text>
          <Text style={{ fontSize: 9, color: GREY, marginBottom: 32 }}>
            I confirm the measurements recorded in this document are accurate to the best of my knowledge.
          </Text>

          <View style={{ flexDirection: 'row', gap: 32 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>Consultant</Text>
              <Text style={{ fontSize: 9, color: NAVY, marginBottom: 24 }}>{project.consultant.name}</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature · Date</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>Client</Text>
              <Text style={{ fontSize: 9, color: NAVY, marginBottom: 24 }}>
                {project.client.firstName} {project.client.lastName}
              </Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature · Date</Text>
            </View>
          </View>

          <View style={[styles.notesBox, { marginTop: 32 }]}>
            <Text style={styles.sectionLabel}>Final Notes</Text>
            <Text style={[styles.notesText, { color: '#CBD5E1' }]}>                                        </Text>
            <Text style={[styles.notesText, { color: '#CBD5E1' }]}>                                        </Text>
          </View>
        </View>
        <Text style={styles.pageNumber}>Generated by MeasurePro · {format(new Date(), 'dd MMM yyyy')}</Text>
      </Page>
    </Document>
  );
};
