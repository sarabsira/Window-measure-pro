import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, ChevronLeft, Save, Plus, Trash2, Info } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { PhotoCaptureModal } from '../components/PhotoCapture/PhotoCaptureModal';
import { windowTypeLabels, furnishingTypeLabels } from '../utils/labels';
import { WindowType, FurnishingType } from '../types';
import type { Measurements, PhotoData } from '../types';

const QUICK_NOTES = [
  'Power outlet below', 'Cornice in way', 'Timber sill', 'Curved bay',
  'Motorised required', 'Safety device needed', 'Child safety required',
  'Heritage window', 'Non-standard shape',
];

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
  hint?: string;
}> = ({ label, value, onChange, hint }) => (
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
    hint={hint}
  />
);

export const WindowMeasurement: React.FC = () => {
  const { id, roomId, windowId } = useParams<{ id: string; roomId: string; windowId: string }>();
  const navigate = useNavigate();
  const { projects, updateWindow, setWindowPhoto, setProcessedImage } = useProjectStore();
  const { addToast } = useUIStore();
  const [showCamera, setShowCamera] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const project = projects.find((p) => p.id === id);
  const room = project?.rooms.find((r) => r.id === roomId);
  const window = room?.windows.find((w) => w.id === windowId);

  const [local, setLocal] = useState(window ? { ...window } : null);

  useEffect(() => {
    if (window) setLocal({ ...window });
  }, [windowId]); // eslint-disable-line

  const save = useCallback(() => {
    if (!local || !id || !roomId || !windowId) return;
    updateWindow(id, roomId, windowId, local);
    setLastSaved(new Date());
  }, [local, id, roomId, windowId, updateWindow]);

  useEffect(() => {
    autoSaveRef.current = setInterval(save, 30000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [save]);

  if (!local || !window || !room || !project) {
    return (
      <div className="p-6 text-slate-400">Window not found.</div>
    );
  }

  const updateMeasurement = (key: keyof Measurements, value: Measurements[keyof Measurements]) => {
    setLocal((prev) => prev ? { ...prev, measurements: { ...prev.measurements, [key]: value } } : prev);
  };

  const handleSave = (andAddAnother = false) => {
    save();
    addToast('Window saved', 'success');
    if (andAddAnother) {
      const { addWindow } = useProjectStore.getState();
      const newId = addWindow(id!, roomId!);
      navigate(`/project/${id}/room/${roomId}/window/${newId}`);
    } else {
      navigate(`/project/${id}/room/${roomId}`);
    }
  };

  const handlePhotoCapture = (photo: PhotoData, processedUrl: string) => {
    setWindowPhoto(id!, roomId!, windowId!, photo);
    setProcessedImage(id!, roomId!, windowId!, processedUrl);
    setLocal((prev) => prev ? { ...prev, photo, processedImageUrl: processedUrl } : prev);
  };

  const m = local.measurements;
  const isCurtain = [FurnishingType.CURTAIN_EYELET, FurnishingType.CURTAIN_PENCIL_PLEAT, FurnishingType.CURTAIN_S_FOLD, FurnishingType.SHEER_CURTAIN].includes(local.furnishingType);
  const isShutter = [FurnishingType.PLANTATION_SHUTTER, FurnishingType.TIMBER_SHUTTER].includes(local.furnishingType);
  const isRoller = [FurnishingType.ROLLER_BLIND, FurnishingType.DUAL_ROLLER].includes(local.furnishingType);
  const isVenetian = local.furnishingType === FurnishingType.VENETIAN_BLIND;
  const isRoman = local.furnishingType === FurnishingType.ROMAN_BLIND;
  const isExternal = [FurnishingType.EXTERNAL_BLIND, FurnishingType.EXTERNAL_AWNING, FurnishingType.OUTDOOR_ROLLER].includes(local.furnishingType);

  const specs = (local.furnishingSpecs || {}) as Record<string, string>;
  const updateSpec = (key: string, value: string) => {
    setLocal((prev) => prev ? { ...prev, furnishingSpecs: { ...(prev.furnishingSpecs || {}), [key]: value } } : prev);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Left: Image panel */}
      <div className="lg:w-[55%] bg-slate-100 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/project/${id}/room/${roomId}`)}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft size={16} /> {room.name}
          </button>
          {lastSaved && (
            <span className="text-xs text-slate-400">
              Auto-saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {local.processedImageUrl ? (
          <div className="relative rounded-xl overflow-hidden bg-white shadow-sm">
            <img
              src={local.processedImageUrl}
              alt="2D drawing"
              className="w-full"
            />
            <button
              onClick={() => setShowCamera(true)}
              className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-slate-600 hover:bg-white shadow-sm"
            >
              Retake
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowCamera(true)}
            className="aspect-[4/3] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-teal-400 hover:bg-teal-50/30 transition-colors bg-white"
          >
            <Camera size={40} className="text-slate-300" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-500">Take Photo</p>
              <p className="text-xs text-slate-400">Converts to 2D technical drawing</p>
            </div>
          </button>
        )}

        {/* Live proportion diagram */}
        {(m.windowWidth || m.windowHeight) && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Preview</p>
            <div className="flex items-center justify-center h-32">
              <div
                className="border-2 border-teal-400 bg-teal-50/30 relative flex items-center justify-center"
                style={{
                  width: `${Math.min(160, ((m.windowWidth || 100) / Math.max(m.windowWidth || 100, m.windowHeight || 100)) * 160)}px`,
                  height: `${Math.min(120, ((m.windowHeight || 100) / Math.max(m.windowWidth || 100, m.windowHeight || 100)) * 120)}px`,
                }}
              >
                <span className="text-xs font-mono text-teal-600">
                  {m.windowWidth ?? '?'}×{m.windowHeight ?? '?'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right: Form panel */}
      <div className="lg:w-[45%] overflow-y-auto bg-white border-l border-slate-100">
        <div className="p-4 pb-32">
          {/* Window tag & type */}
          <div className="mb-6">
            <Input
              label="Window Tag"
              value={local.tag}
              onChange={(e) => setLocal((prev) => prev ? { ...prev, tag: e.target.value } : prev)}
              className="text-lg font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Window Type</label>
              <select
                value={local.windowType}
                onChange={(e) => setLocal((prev) => prev ? { ...prev, windowType: e.target.value as WindowType } : prev)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]"
              >
                {Object.values(WindowType).map((t) => (
                  <option key={t} value={t}>{windowTypeLabels[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Furnishing Type</label>
              <select
                value={local.furnishingType}
                onChange={(e) => setLocal((prev) => prev ? { ...prev, furnishingType: e.target.value as FurnishingType } : prev)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]"
              >
                {Object.values(FurnishingType).map((t) => (
                  <option key={t} value={t}>{furnishingTypeLabels[t]}</option>
                ))}
              </select>
            </div>
          </div>

          <Section title="Opening Dimensions">
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Window Width *" value={m.windowWidth} onChange={(v) => updateMeasurement('windowWidth', v)} />
              <NumInput label="Window Height *" value={m.windowHeight} onChange={(v) => updateMeasurement('windowHeight', v)} />
            </div>
          </Section>

          <Section title="Floor to Ceiling">
            <NumInput label="Ceiling to Floor" value={m.ceilingToFloor} onChange={(v) => updateMeasurement('ceilingToFloor', v)} />
            <NumInput label="Ceiling to Top of Architrave" value={m.ceilingToTopOfArchitrave} onChange={(v) => updateMeasurement('ceilingToTopOfArchitrave', v)} />
            <NumInput label="Bottom of Architrave to Floor" value={m.bottomOfArchitraveToFloor} onChange={(v) => updateMeasurement('bottomOfArchitraveToFloor', v)} />
            {m.ceilingToFloor && m.ceilingToTopOfArchitrave && (
              <p className="text-xs text-teal-600 font-mono bg-teal-50 px-3 py-1.5 rounded-lg">
                Architrave top = {m.ceilingToFloor - m.ceilingToTopOfArchitrave}mm from floor
              </p>
            )}
          </Section>

          <Section title="Architrave Details">
            <div className="grid grid-cols-3 gap-3">
              <NumInput label="Width" value={m.architraveWidth} onChange={(v) => updateMeasurement('architraveWidth', v)} />
              <NumInput label="Projection" value={m.architraveProjection} onChange={(v) => updateMeasurement('architraveProjection', v)} />
              <NumInput label="Recess Depth" value={m.recessDepth} onChange={(v) => updateMeasurement('recessDepth', v)} />
            </div>
          </Section>

          <Section title="Fit Type">
            <div className="flex gap-2">
              {(['inside', 'outside', 'exact'] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => setLocal((prev) => prev ? { ...prev, location: fit } : prev)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors capitalize min-h-[44px] ${
                    local.location === fit
                      ? 'bg-teal-400 border-teal-400 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>
            <div className="flex items-start gap-1.5 text-xs text-slate-400 mt-1">
              <Info size={12} className="mt-0.5 flex-shrink-0" />
              <span>Inside = within recess. Outside = over wall. Exact = to exact opening size.</span>
            </div>
          </Section>

          <Section title="Clearances & Stack">
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Stack Left" value={m.stackingClearanceLeft} onChange={(v) => updateMeasurement('stackingClearanceLeft', v)} />
              <NumInput label="Stack Right" value={m.stackingClearanceRight} onChange={(v) => updateMeasurement('stackingClearanceRight', v)} />
            </div>
            <NumInput label="Drop to Cleats/Obstacle" value={m.dropToCleats} onChange={(v) => updateMeasurement('dropToCleats', v)} />
          </Section>

          <Section title="Operation">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Control Side</label>
                <select
                  value={m.controlSide || ''}
                  onChange={(e) => updateMeasurement('controlSide', (e.target.value || null) as Measurements['controlSide'])}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]"
                >
                  <option value="">Not set</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="centre">Centre</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Opening Direction</label>
                <select
                  value={m.openingDirection || ''}
                  onChange={(e) => updateMeasurement('openingDirection', (e.target.value || null) as Measurements['openingDirection'])}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]"
                >
                  <option value="">Not set</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Furnishing-specific fields */}
          {isRoller && (
            <Section title="Roller Blind Specs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Cassette</label>
                  <select value={specs.cassette || ''} onChange={(e) => updateSpec('cassette', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Open</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Drive Type</label>
                  <select value={specs.drive || ''} onChange={(e) => updateSpec('drive', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Chain</option>
                    <option>Spring</option>
                    <option>Motorised</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Chain Side</label>
                  <select value={specs.chainSide || ''} onChange={(e) => updateSpec('chainSide', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Left</option>
                    <option>Right</option>
                  </select>
                </div>
              </div>
            </Section>
          )}

          {isShutter && (
            <Section title="Shutter Specs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Louvre Size</label>
                  <select value={specs.louvreSize || ''} onChange={(e) => updateSpec('louvreSize', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>63mm</option>
                    <option>89mm</option>
                    <option>114mm</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Mid Rail</label>
                  <select value={specs.midRail || ''} onChange={(e) => updateSpec('midRail', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Style</label>
                  <select value={specs.style || ''} onChange={(e) => updateSpec('style', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Hinged</option>
                    <option>Bi-fold</option>
                  </select>
                </div>
              </div>
            </Section>
          )}

          {isCurtain && (
            <Section title="Curtain Specs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Ceiling Fix</label>
                  <select value={specs.ceilingFix || ''} onChange={(e) => updateSpec('ceilingFix', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Lining</label>
                  <select value={specs.lining || ''} onChange={(e) => updateSpec('lining', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Unlined</option>
                    <option>Lined</option>
                    <option>Blockout</option>
                    <option>Interlining</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumInput label="Extension Left" value={Number(specs.extensionLeft) || null} onChange={(v) => updateSpec('extensionLeft', String(v ?? ''))} />
                <NumInput label="Extension Right" value={Number(specs.extensionRight) || null} onChange={(v) => updateSpec('extensionRight', String(v ?? ''))} />
              </div>
            </Section>
          )}

          {isVenetian && (
            <Section title="Venetian Blind Specs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Slat Width</label>
                  <select value={specs.slatWidth || ''} onChange={(e) => updateSpec('slatWidth', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>25mm</option>
                    <option>35mm</option>
                    <option>50mm</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Tilt Control</label>
                  <select value={specs.tiltControl || ''} onChange={(e) => updateSpec('tiltControl', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Wand</option>
                    <option>Cord</option>
                  </select>
                </div>
              </div>
            </Section>
          )}

          {isRoman && (
            <Section title="Roman Blind Specs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Lining Type</label>
                  <select value={specs.lining || ''} onChange={(e) => updateSpec('lining', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Unlined</option>
                    <option>Lined</option>
                    <option>Blockout</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Chain Side</label>
                  <select value={specs.chainSide || ''} onChange={(e) => updateSpec('chainSide', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Left</option>
                    <option>Right</option>
                  </select>
                </div>
              </div>
            </Section>
          )}

          {isExternal && (
            <Section title="External Specs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Guide Type</label>
                  <select value={specs.guideType || ''} onChange={(e) => updateSpec('guideType', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Channel</option>
                    <option>Wire</option>
                    <option>None</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Motor</label>
                  <select value={specs.motor || ''} onChange={(e) => updateSpec('motor', e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]">
                    <option value="">Select</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
            </Section>
          )}

          <Section title="Notes">
            <textarea
              value={local.specialNotes}
              onChange={(e) => setLocal((prev) => prev ? { ...prev, specialNotes: e.target.value } : prev)}
              rows={3}
              placeholder="Special notes, obstacles, quirks..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            />
            <div className="flex flex-wrap gap-1.5">
              {QUICK_NOTES.map((note) => (
                <button
                  key={note}
                  onClick={() =>
                    setLocal((prev) =>
                      prev
                        ? {
                            ...prev,
                            specialNotes: prev.specialNotes
                              ? `${prev.specialNotes}, ${note}`
                              : note,
                          }
                        : prev
                    )
                  }
                  className="px-2.5 py-1 rounded-full text-xs border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-colors"
                >
                  + {note}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Sticky bottom bar */}
        <div className="fixed bottom-0 right-0 lg:w-[45%] bg-white border-t border-slate-100 p-4 flex gap-2 z-10">
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={16} />}
            onClick={() => {
              if (confirm('Delete this window?')) {
                const { deleteWindow } = useProjectStore.getState();
                deleteWindow(id!, roomId!, windowId!);
                navigate(`/project/${id}/room/${roomId}`);
              }
            }}
          />
          <Button variant="secondary" icon={<Save size={16} />} onClick={() => handleSave(false)} className="flex-1">
            Save
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => handleSave(true)} className="flex-1">
            Save & Add Another
          </Button>
        </div>
      </div>

      <PhotoCaptureModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handlePhotoCapture}
      />
    </div>
  );
};
