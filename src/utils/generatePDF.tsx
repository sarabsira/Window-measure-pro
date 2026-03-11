import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  pdf,
  Font,
} from '@react-pdf/renderer';
import type { Job } from '../types';

Font.register({
  family: 'Helvetica',
  fonts: [],
});

const colors = {
  navy: '#0F1B2D',
  teal: '#2DD4BF',
  tealDark: '#0F766E',
  slate: '#64748B',
  slateLight: '#F1F5F9',
  border: '#E2E8F0',
  white: '#FFFFFF',
  black: '#0F172A',
  red: '#EF4444',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: colors.black,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 36,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.teal,
  },
  headerLeft: {},
  companyName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
    letterSpacing: 1,
  },
  docTitle: {
    fontSize: 10,
    color: colors.slate,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 8,
    color: colors.slate,
  },
  // Client info box
  clientBox: {
    backgroundColor: colors.navy,
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clientCol: {
    flex: 1,
  },
  clientLabel: {
    fontSize: 7,
    color: colors.teal,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  clientValue: {
    fontSize: 9,
    color: colors.white,
    fontFamily: 'Helvetica-Bold',
  },
  clientSub: {
    fontSize: 8,
    color: '#94A3B8',
    marginTop: 1,
  },
  clientDivider: {
    width: 1,
    backgroundColor: '#1E3A5F',
    marginHorizontal: 12,
  },
  // Summary bar
  summaryBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  summaryChip: {
    backgroundColor: colors.slateLight,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  summaryChipLabel: {
    fontSize: 7,
    color: colors.slate,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  summaryChipValue: {
    fontSize: 11,
    color: colors.navy,
    fontFamily: 'Helvetica-Bold',
  },
  // Section heading
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.slate,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },
  // Window card
  windowCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    marginBottom: 14,
    overflow: 'hidden',
  },
  windowCardHeader: {
    backgroundColor: colors.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  windowTag: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: colors.teal,
  },
  windowBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    backgroundColor: '#1E3A5F',
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 7,
    color: colors.teal,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'capitalize',
  },
  windowBody: {
    padding: 12,
  },
  // Measurements grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  metricBox: {
    width: '22%',
    backgroundColor: colors.slateLight,
    borderRadius: 4,
    padding: 6,
  },
  metricLabel: {
    fontSize: 6.5,
    color: colors.slate,
    marginBottom: 2,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.navy,
  },
  metricUnit: {
    fontSize: 7,
    color: colors.slate,
    fontFamily: 'Helvetica',
  },
  // Two col row
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  halfCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 7,
    color: colors.slate,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 8.5,
    color: colors.navy,
  },
  // Notes box
  notesBox: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    borderRadius: 3,
    padding: 8,
    marginTop: 6,
  },
  notesLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#92400E',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8,
    color: '#78350F',
    lineHeight: 1.4,
  },
  // Track notes box
  trackNotesBox: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 3,
    borderLeftColor: colors.teal,
    borderRadius: 3,
    padding: 8,
    marginTop: 6,
  },
  trackNotesLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.tealDark,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  trackNotesText: {
    fontSize: 8,
    color: colors.tealDark,
    lineHeight: 1.4,
  },
  // Photos
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  photo: {
    width: 120,
    height: 90,
    borderRadius: 4,
    objectFit: 'cover',
  },
  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginVertical: 6,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.slate,
  },
  pageNumber: {
    fontSize: 7,
    color: colors.slate,
  },
});

const formatMM = (v: number | null) => (v != null ? `${v}` : '—');

const trackTypeLabel = (t: string | null) => {
  if (t === 'existing') return 'Existing Track';
  if (t === 'new-single') return 'New — Single';
  if (t === 'new-double') return 'New — Double';
  return '—';
};

const PDFDocument: React.FC<{ job: Job }> = ({ job }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <Document title={`Curtain Measurement — ${job.village} — ${job.resident.name}`}>
      {/* ── Cover / Client Info Page ── */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>Curtain Measure Pro</Text>
            <Text style={styles.docTitle}>Window Measurement Report</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
        </View>

        {/* Client box */}
        <View style={styles.clientBox}>
          <View style={styles.clientCol}>
            <Text style={styles.clientLabel}>Site / Village</Text>
            <Text style={styles.clientValue}>{job.village}</Text>
          </View>
          <View style={styles.clientDivider} />
          <View style={styles.clientCol}>
            <Text style={styles.clientLabel}>Resident</Text>
            <Text style={styles.clientValue}>{job.resident.name}</Text>
            {job.resident.unitNumber ? (
              <Text style={styles.clientSub}>Unit {job.resident.unitNumber}</Text>
            ) : null}
            {job.resident.phone ? (
              <Text style={styles.clientSub}>{job.resident.phone}</Text>
            ) : null}
            {job.resident.email ? (
              <Text style={styles.clientSub}>{job.resident.email}</Text>
            ) : null}
          </View>
          <View style={styles.clientDivider} />
          <View style={styles.clientCol}>
            <Text style={styles.clientLabel}>Consultant</Text>
            <Text style={styles.clientValue}>{job.consultantName}</Text>
          </View>
        </View>

        {/* Summary chips */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryChipLabel}>Total Windows</Text>
            <Text style={styles.summaryChipValue}>{job.windows.length}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryChipLabel}>Photos</Text>
            <Text style={styles.summaryChipValue}>
              {job.windows.reduce((acc, w) => acc + (w.photos?.length ?? 0), 0)}
            </Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryChipLabel}>Job Created</Text>
            <Text style={styles.summaryChipValue}>
              {new Date(job.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Window cards */}
        <Text style={styles.sectionTitle}>Window Measurements</Text>

        {job.windows.map((w) => {
          const m = w.measurements;
          const photos = w.photos ?? [];
          return (
            <View key={w.id} style={styles.windowCard} wrap={false}>
              {/* Card header */}
              <View style={styles.windowCardHeader}>
                <Text style={styles.windowTag}>{w.tag}</Text>
                <View style={styles.windowBadges}>
                  {m.curtainType && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{m.curtainType}</Text>
                    </View>
                  )}
                  {m.controlSide && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{m.controlSide} control</Text>
                    </View>
                  )}
                  {m.trackType && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{trackTypeLabel(m.trackType)}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Card body */}
              <View style={styles.windowBody}>
                {/* Measurement grid */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Width</Text>
                    <Text style={styles.metricValue}>
                      {formatMM(m.width)} <Text style={styles.metricUnit}>mm</Text>
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Height</Text>
                    <Text style={styles.metricValue}>
                      {formatMM(m.height)} <Text style={styles.metricUnit}>mm</Text>
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Stack L</Text>
                    <Text style={styles.metricValue}>
                      {formatMM(m.stackLeft)} <Text style={styles.metricUnit}>mm</Text>
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Stack R</Text>
                    <Text style={styles.metricValue}>
                      {formatMM(m.stackRight)} <Text style={styles.metricUnit}>mm</Text>
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Track Ht.</Text>
                    <Text style={styles.metricValue}>
                      {formatMM(m.trackHeightAboveFrame)} <Text style={styles.metricUnit}>mm</Text>
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Floor Red.</Text>
                    <Text style={styles.metricValue}>
                      {formatMM(m.reductionFromFloor)} <Text style={styles.metricUnit}>mm</Text>
                    </Text>
                  </View>
                </View>

                {/* Fabric row */}
                <View style={styles.divider} />
                <View style={styles.row}>
                  <View style={styles.halfCol}>
                    <Text style={styles.fieldLabel}>Fabric</Text>
                    <Text style={styles.fieldValue}>{m.fabricName || '—'}</Text>
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.fieldLabel}>Lining</Text>
                    <Text style={styles.fieldValue}>{m.liningType || '—'}</Text>
                  </View>
                </View>

                {/* Track notes */}
                {m.trackNotes ? (
                  <View style={styles.trackNotesBox}>
                    <Text style={styles.trackNotesLabel}>Track Notes</Text>
                    <Text style={styles.trackNotesText}>{m.trackNotes}</Text>
                  </View>
                ) : null}

                {/* Window notes */}
                {m.windowNotes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Window Notes</Text>
                    <Text style={styles.notesText}>{m.windowNotes}</Text>
                  </View>
                ) : null}

                {/* Photos */}
                {photos.length > 0 && (
                  <>
                    <Text style={[styles.fieldLabel, { marginTop: 8, marginBottom: 4 }]}>
                      Photos ({photos.length})
                    </Text>
                    <View style={styles.photosGrid}>
                      {photos.map((src, idx) => (
                        <Image key={idx} src={src} style={styles.photo} />
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {job.village} — {job.resident.name} — {job.consultantName}
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export async function generateAndDownloadPDF(job: Job): Promise<void> {
  const blob = await pdf(<PDFDocument job={job} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = job.resident.name.replace(/[^a-z0-9]/gi, '_');
  const safeVillage = job.village.replace(/[^a-z0-9]/gi, '_');
  a.download = `curtain-measure_${safeVillage}_${safeName}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
