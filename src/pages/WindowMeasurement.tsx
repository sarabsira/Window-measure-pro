import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, Plus, Trash2, Camera, X, Image } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import type { CurtainMeasurements, CurtainType, ControlSide, TrackType } from '../types';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-teal-400" />
      {title}
    </h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const NumInput: React.FC<{
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}> = ({ label, value, onChange }) => (
  <Input
    label={label}
    type="text"
    inputMode="numeric"
    value={value ?? ''}
    onChange={(e) => {
      const v = e.target.value;
      onChange(v === '' ? null : Number(v));
    }}
    unit="mm"
  />
);

const Toggle: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div>
    <p className="text-sm font-medium text-slate-700 mb-1.5">{label}</p>
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors min-h-[44px] min-w-[80px] ${
            value === opt.value
              ? 'bg-teal-400 border-teal-400 text-white'
              : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

const TextArea: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-none"
    />
  </div>
);

export const WindowMeasurement: React.FC = () => {
  const { id, windowId } = useParams<{ id: string; windowId: string }>();
  const navigate = useNavigate();
  const { jobs, updateWindow, deleteWindow, addWindow } = useProjectStore();
  const { addToast } = useUIStore();
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const job = jobs.find((j) => j.id === id);
  const win = job?.windows.find((w) => w.id === windowId);

  const [local, setLocal] = useState(win ? { ...win } : null);

  useEffect(() => {
    if (win) setLocal({ ...win });
  }, [windowId]); // eslint-disable-line

  const save = useCallback(() => {
    if (!local || !id || !windowId) return;
    updateWindow(id, windowId, local);
    setLastSaved(new Date());
  }, [local, id, windowId, updateWindow]);

  useEffect(() => {
    autoSaveRef.current = setInterval(save, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [save]);

  if (!local || !win || !job) {
    return <div className="p-6 text-slate-400">Window not found.</div>;
  }

  const updateM = (key: keyof CurtainMeasurements, value: CurtainMeasurements[keyof CurtainMeasurements]) => {
    setLocal((prev) => prev ? { ...prev, measurements: { ...prev.measurements, [key]: value } } : prev);
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setLocal((prev) => prev ? { ...prev, photos: [...(prev.photos ?? []), dataUrl] } : prev);
      };
      reader.readAsDataURL(file);
    });
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleRemovePhoto = (idx: number) => {
    setLocal((prev) => prev ? { ...prev, photos: prev.photos.filter((_, i) => i !== idx) } : prev);
  };

  const handleSave = (andAddAnother = false) => {
    save();
    addToast('Window saved', 'success');
    if (andAddAnother) {
      const newId = addWindow(id!);
      navigate(`/job/${id}/window/${newId}`);
    } else {
      navigate(`/job/${id}`);
    }
  };

  const handleDelete = () => {
    if (confirm(`Delete window ${local.tag}?`)) {
      deleteWindow(id!, windowId!);
      navigate(`/job/${id}`);
    }
  };

  const m = local.measurements;
  const photos = local.photos ?? [];

  return (
    <div className="max-w-xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(`/job/${id}`)}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600"
        >
          <ChevronLeft size={16} /> {job.village}
        </button>
        {lastSaved && (
          <span className="text-xs text-slate-400">
            Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {/* Window tag */}
        <div className="mb-6">
          <Input
            label="Window Tag"
            value={local.tag}
            onChange={(e) => setLocal((prev) => prev ? { ...prev, tag: e.target.value } : prev)}
          />
        </div>

        {/* Photos */}
        <Section title="Photos">
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {photos.map((src, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                  <img src={src} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handleAddPhoto}
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors text-sm"
            >
              <Image size={16} /> Upload Photo
            </button>
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.setAttribute('capture', 'environment');
                  fileInputRef.current.click();
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors text-sm"
            >
              <Camera size={16} /> Take Photo
            </button>
          </div>
        </Section>

        {/* Live preview */}
        {(m.width || m.height) && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center justify-center h-28">
            <div
              className="border-2 border-teal-400 bg-teal-50/50 flex items-center justify-center"
              style={{
                width: `${Math.min(160, ((m.width || 100) / Math.max(m.width || 100, m.height || 100)) * 160)}px`,
                height: `${Math.min(100, ((m.height || 100) / Math.max(m.width || 100, m.height || 100)) * 100)}px`,
              }}
            >
              <span className="text-xs font-mono text-teal-600">{m.width ?? '?'} × {m.height ?? '?'}</span>
            </div>
          </div>
        )}

        <Section title="Dimensions">
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Width *" value={m.width} onChange={(v) => updateM('width', v)} />
            <NumInput label="Height *" value={m.height} onChange={(v) => updateM('height', v)} />
          </div>
        </Section>

        <Section title="Track / Stack Details">
          <Toggle
            label="Track"
            options={[
              { value: 'existing', label: 'Existing Track' },
              { value: 'new-single', label: 'New — Single' },
              { value: 'new-double', label: 'New — Double' },
            ]}
            value={m.trackType}
            onChange={(v) => updateM('trackType', v as TrackType)}
          />
          <TextArea
            label="Track Notes"
            value={m.trackNotes}
            onChange={(v) => updateM('trackNotes', v)}
            placeholder="Any special notes about the track..."
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <NumInput label="Stack Left" value={m.stackLeft} onChange={(v) => updateM('stackLeft', v)} />
            <NumInput label="Stack Right" value={m.stackRight} onChange={(v) => updateM('stackRight', v)} />
          </div>
          <NumInput
            label="Track Height Above Frame"
            value={m.trackHeightAboveFrame}
            onChange={(v) => updateM('trackHeightAboveFrame', v)}
          />
        </Section>

        <Section title="Floor Clearance">
          <NumInput
            label="Reduction from Floor"
            value={m.reductionFromFloor}
            onChange={(v) => updateM('reductionFromFloor', v)}
          />
        </Section>

        <Section title="Curtain Configuration">
          <Toggle
            label="Curtain Type"
            options={[
              { value: 'single', label: 'Single' },
              { value: 'pair', label: 'Pair' },
            ]}
            value={m.curtainType}
            onChange={(v) => updateM('curtainType', v as CurtainType)}
          />
          <Toggle
            label="Control Side"
            options={[
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
            ]}
            value={m.controlSide}
            onChange={(v) => updateM('controlSide', v as ControlSide)}
          />
        </Section>

        <Section title="Fabric & Lining">
          <Input
            label="Fabric Name"
            value={m.fabricName}
            onChange={(e) => updateM('fabricName', e.target.value)}
            placeholder="e.g. Warwick Halo"
          />
          <Input
            label="Lining Type"
            value={m.liningType}
            onChange={(e) => updateM('liningType', e.target.value)}
            placeholder="e.g. Blockout, Unlined"
          />
        </Section>

        <Section title="Window Notes">
          <TextArea
            label="Special Notes for this Window"
            value={m.windowNotes}
            onChange={(v) => updateM('windowNotes', v)}
            placeholder="Any special instructions, access issues, or notes specific to this window..."
            rows={4}
          />
        </Section>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white border-t border-slate-100 p-4 flex gap-2">
        <Button variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={handleDelete} />
        <Button variant="secondary" icon={<Save size={16} />} onClick={() => handleSave(false)} className="flex-1">
          Save
        </Button>
        <Button icon={<Plus size={16} />} onClick={() => handleSave(true)} className="flex-1">
          Save & Add Another
        </Button>
      </div>
    </div>
  );
};
