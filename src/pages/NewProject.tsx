import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';

const VILLAGES = [
  { name: 'Bert Sutcliffe', suburb: 'Birkenhead' },
  { name: 'Bruce McLaren', suburb: 'Howick' },
  { name: 'Edmund Hillary', suburb: 'Remuera' },
  { name: 'Evelyn Page', suburb: 'Orewa' },
  { name: 'Grace Joel', suburb: 'St Heliers' },
  { name: 'Keith Park', suburb: 'Hobsonville' },
  { name: 'Logan Campbell', suburb: 'Greenlane' },
  { name: 'Miriam Corban', suburb: 'Henderson' },
  { name: 'Murray Halberg', suburb: 'Lynfield' },
  { name: 'Possum Bourne', suburb: 'Pukekohe' },
  { name: 'William Sanders', suburb: 'Devonport' },
];

export const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { createJob } = useProjectStore();
  const { addToast } = useUIStore();

  const [village, setVillage] = React.useState('');
  const [residentName, setResidentName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [unitNumber, setUnitNumber] = React.useState('');
  const [consultantName, setConsultantName] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!village) e.village = 'Please select a village';
    if (!residentName.trim()) e.residentName = 'Resident name is required';
    if (!unitNumber.trim()) e.unitNumber = 'Unit number is required';
    if (!consultantName.trim()) e.consultantName = 'Consultant name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const id = createJob({
      village,
      resident: { name: residentName.trim(), email: email.trim(), phone: phone.trim(), unitNumber: unitNumber.trim() },
      consultantName: consultantName.trim(),
    });
    addToast('Job created', 'success');
    navigate(`/job/${id}`);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"
      >
        <ChevronLeft size={16} /> Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">New Job</h1>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        {/* Village */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Village *</label>
          <select
            value={village}
            onChange={(e) => { setVillage(e.target.value); setErrors((err) => ({ ...err, village: '' })); }}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white ${errors.village ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
          >
            <option value="">Select a village...</option>
            {VILLAGES.map((v) => (
              <option key={v.name} value={`${v.name} – ${v.suburb}`}>
                {v.name} – {v.suburb}
              </option>
            ))}
          </select>
          {errors.village && <p className="text-xs text-red-500">{errors.village}</p>}
        </div>

        {/* Resident Details */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Resident Details</h2>
          <div className="space-y-3">
            <Input
              label="Resident Name *"
              value={residentName}
              onChange={(e) => { setResidentName(e.target.value); setErrors((err) => ({ ...err, residentName: '' })); }}
              error={errors.residentName}
              placeholder="Full name"
            />
            <Input
              label="Unit Number *"
              value={unitNumber}
              onChange={(e) => { setUnitNumber(e.target.value); setErrors((err) => ({ ...err, unitNumber: '' })); }}
              error={errors.unitNumber}
              placeholder="e.g. 42"
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="resident@email.com"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+64 21 xxx xxxx"
            />
          </div>
        </div>

        {/* Consultant */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Consultant</h2>
          <Input
            label="Consultant Name *"
            value={consultantName}
            onChange={(e) => { setConsultantName(e.target.value); setErrors((err) => ({ ...err, consultantName: '' })); }}
            error={errors.consultantName}
            placeholder="Your full name"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button icon={<ChevronRight size={16} />} onClick={handleSubmit}>
          Start Measuring
        </Button>
      </div>
    </div>
  );
};
