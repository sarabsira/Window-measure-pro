import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';

const steps = ['Project Info', 'Client Details', 'Property Address', 'Rooms'];

const SUGGESTED_ROOMS = [
  'Living Room', 'Master Bedroom', 'Bedroom 2', 'Bedroom 3',
  'Kitchen', 'Dining Room', 'Study', 'Bathroom', 'Ensuite',
  'Laundry', 'Hallway', 'Lounge', 'Rumpus Room', 'Outdoor Area',
];

const step1Schema = z.object({
  projectName: z.string().min(1, 'Project name is required'),
  consultantName: z.string().min(1, 'Consultant name is required'),
  consultantEmail: z.string().email('Invalid email').or(z.literal('')),
  consultantPhone: z.string().min(1, 'Phone is required'),
  consultantCompany: z.string().min(1, 'Company is required'),
});

const step2Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').or(z.literal('')),
  phone: z.string(),
  company: z.string().optional(),
});

const step3Schema = z.object({
  streetNumber: z.string().min(1, 'Street number is required'),
  streetName: z.string().min(1, 'Street name is required'),
  suburb: z.string(),
  city: z.string().min(1, 'City is required'),
  postcode: z.string(),
  country: z.string(),
  specialNotes: z.string(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { createProject } = useProjectStore();
  const { addToast } = useUIStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [rooms, setRooms] = useState<string[]>(['Living Room']);
  const [customRoom, setCustomRoom] = useState('');
  const [formData, setFormData] = useState({
    step1: {} as Step1Data,
    step2: {} as Step2Data,
    step3: {} as Step3Data,
  });

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });
  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { country: 'New Zealand', specialNotes: '' },
  });

  const handleNext = async () => {
    if (currentStep === 0) {
      const valid = await form1.trigger();
      if (!valid) return;
      setFormData((d) => ({ ...d, step1: form1.getValues() }));
    } else if (currentStep === 1) {
      const valid = await form2.trigger();
      if (!valid) return;
      setFormData((d) => ({ ...d, step2: form2.getValues() }));
    } else if (currentStep === 2) {
      const valid = await form3.trigger();
      if (!valid) return;
      setFormData((d) => ({ ...d, step3: form3.getValues() }));
    }
    setCurrentStep((s) => s + 1);
  };

  const handleSubmit = () => {
    if (rooms.length === 0) {
      addToast('Please add at least one room', 'error');
      return;
    }
    const id = createProject({
      projectName: formData.step1.projectName,
      consultant: {
        name: formData.step1.consultantName,
        email: formData.step1.consultantEmail,
        phone: formData.step1.consultantPhone,
        company: formData.step1.consultantCompany,
      },
      client: {
        firstName: formData.step2.firstName,
        lastName: formData.step2.lastName,
        email: formData.step2.email,
        phone: formData.step2.phone,
        company: formData.step2.company,
      },
      address: {
        streetNumber: formData.step3.streetNumber,
        streetName: formData.step3.streetName,
        suburb: formData.step3.suburb,
        city: formData.step3.city,
        postcode: formData.step3.postcode,
        country: formData.step3.country || 'New Zealand',
      },
      rooms,
      specialNotes: formData.step3.specialNotes,
    });
    addToast('Project created!', 'success');
    navigate(`/project/${id}`);
  };

  const toggleRoom = (name: string) => {
    setRooms((r) =>
      r.includes(name) ? r.filter((x) => x !== name) : [...r, name]
    );
  };

  const addCustomRoom = () => {
    const name = customRoom.trim();
    if (name && !rooms.includes(name)) {
      setRooms((r) => [...r, name]);
      setCustomRoom('');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-slate-800">New Project</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i < currentStep
                    ? 'bg-teal-400 text-white'
                    : i === currentStep
                    ? 'bg-[#0F1B2D] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {i < currentStep ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs whitespace-nowrap ${i === currentStep ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < currentStep ? 'bg-teal-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* Step 1 */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Project Info</h2>
            <Input label="Project Name *" error={form1.formState.errors.projectName?.message} {...form1.register('projectName')} placeholder="e.g. Smith Residence" />
            <Input label="Consultant Name *" error={form1.formState.errors.consultantName?.message} {...form1.register('consultantName')} placeholder="Your full name" />
            <Input label="Consultant Company *" error={form1.formState.errors.consultantCompany?.message} {...form1.register('consultantCompany')} placeholder="Company name" />
            <Input label="Consultant Phone *" error={form1.formState.errors.consultantPhone?.message} {...form1.register('consultantPhone')} placeholder="+64 21 xxx xxx" type="tel" />
            <Input label="Consultant Email" error={form1.formState.errors.consultantEmail?.message} {...form1.register('consultantEmail')} placeholder="you@company.com" type="email" />
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Client Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name *" error={form2.formState.errors.firstName?.message} {...form2.register('firstName')} />
              <Input label="Last Name *" error={form2.formState.errors.lastName?.message} {...form2.register('lastName')} />
            </div>
            <Input label="Email" error={form2.formState.errors.email?.message} {...form2.register('email')} type="email" />
            <Input label="Phone" {...form2.register('phone')} type="tel" />
            <Input label="Company (optional)" {...form2.register('company')} />
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Property Address</h2>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Street No. *" error={form3.formState.errors.streetNumber?.message} {...form3.register('streetNumber')} className="col-span-1" />
              <Input label="Street Name *" error={form3.formState.errors.streetName?.message} {...form3.register('streetName')} className="col-span-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Suburb" {...form3.register('suburb')} />
              <Input label="City *" error={form3.formState.errors.city?.message} {...form3.register('city')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Postcode" {...form3.register('postcode')} />
              <Input label="Country" {...form3.register('country')} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Property Notes</label>
              <textarea
                {...form3.register('specialNotes')}
                rows={3}
                placeholder="Any special notes about the property or site..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 4 - Rooms */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Rooms Setup</h2>
            <p className="text-sm text-slate-400 mb-4">Select rooms to measure (minimum 1 required)</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {SUGGESTED_ROOMS.map((name) => (
                <button
                  key={name}
                  onClick={() => toggleRoom(name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors min-h-[36px] ${
                    rooms.includes(name)
                      ? 'bg-teal-400 border-teal-400 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {rooms.filter((r) => !SUGGESTED_ROOMS.includes(r)).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {rooms
                  .filter((r) => !SUGGESTED_ROOMS.includes(r))
                  .map((name) => (
                    <span
                      key={name}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700"
                    >
                      {name}
                      <button onClick={() => toggleRoom(name)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomRoom()}
                placeholder="Add custom room..."
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 min-h-[44px]"
              />
              <Button variant="secondary" icon={<Plus size={16} />} onClick={addCustomRoom}>
                Add
              </Button>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                <span className="font-semibold">{rooms.length}</span> room{rooms.length !== 1 ? 's' : ''} selected:{' '}
                <span className="text-slate-400">{rooms.join(', ')}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          icon={<ChevronLeft size={16} />}
          onClick={() => (currentStep === 0 ? navigate('/') : setCurrentStep((s) => s - 1))}
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button icon={<ChevronRight size={16} />} onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button icon={<Check size={16} />} onClick={handleSubmit} disabled={rooms.length === 0}>
            Create Project
          </Button>
        )}
      </div>
    </div>
  );
};
