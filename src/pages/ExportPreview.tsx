import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { ChevronLeft, FileDown, FileText, Printer } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { Button } from '../components/UI/Button';
import { EmptyState } from '../components/UI/EmptyState';
import { MeasureProPDF } from '../utils/generatePDF';
import { exportProjectCSV } from '../utils/exportCSV';

export const ExportPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useProjectStore();
  const [showPreview, setShowPreview] = useState(false);

  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<FileDown size={32} />}
          title="Project not found"
          description="This project may have been deleted."
          action={{ label: 'Back to Dashboard', onClick: () => navigate('/') }}
        />
      </div>
    );
  }

  const totalWindows = project.rooms.reduce((s, r) => s + r.windows.length, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(`/project/${id}`)}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"
      >
        <ChevronLeft size={16} /> {project.projectName}
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">Export</h1>
      <p className="text-slate-400 text-sm mb-8">
        {project.rooms.length} rooms · {totalWindows} windows
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* PDF Download */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <FileDown size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Download PDF</h3>
            <p className="text-xs text-slate-400 mt-1">Full project report with photos and measurements</p>
          </div>
          <PDFDownloadLink
            document={<MeasureProPDF project={project} />}
            fileName={`${project.projectName.replace(/\s+/g, '-')}-measure-sheet.pdf`}
          >
            {({ loading }) => (
              <Button loading={loading} icon={<FileDown size={16} />} className="w-full">
                {loading ? 'Generating...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Printer size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Preview PDF</h3>
            <p className="text-xs text-slate-400 mt-1">View the PDF in your browser before downloading</p>
          </div>
          <Button
            variant="secondary"
            icon={<Printer size={16} />}
            onClick={() => setShowPreview(!showPreview)}
            className="w-full"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>

        {/* CSV Export */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Export CSV</h3>
            <p className="text-xs text-slate-400 mt-1">Import into quoting software</p>
          </div>
          <Button
            variant="secondary"
            icon={<FileText size={16} />}
            onClick={() => exportProjectCSV(project)}
            className="w-full"
          >
            Download CSV
          </Button>
        </div>
      </div>

      {/* PDF Preview */}
      {showPreview && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
            PDF Preview
          </div>
          <PDFViewer width="100%" height={700} style={{ border: 'none' }}>
            <MeasureProPDF project={project} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
};
