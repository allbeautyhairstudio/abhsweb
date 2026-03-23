'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, ArrowRight, ArrowLeft, Send, Upload, X, Camera, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionPage } from '@/components/motion';

// --- Option data ---

const serviceOptions = [
  { value: 'haircut-style', label: 'Haircut & Style' },
  { value: 'low-maintenance-color', label: 'Low Maintenance Color' },
  { value: 'dimensional-color', label: 'Lived in Dimensional Color' },
  { value: 'mini-service', label: 'Mini Service' },
  { value: 'other-not-sure', label: 'Other/Not sure yet' },
];

const hairTextureOptions = [
  { value: 'straight', label: 'Straight' },
  { value: 'curly', label: 'Curly' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'frizzy-kinky', label: 'Frizzy/Kinky' },
  { value: 'coily', label: 'Coily' },
];

const hairLengthOptions = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
];

const hairDensityOptions = [
  { value: 'fine', label: 'Fine' },
  { value: 'medium', label: 'Medium' },
  { value: 'thick', label: 'Thick' },
  { value: 'very-thick', label: 'Very Thick' },
  { value: 'coarse', label: 'Coarse' },
];

const hairConditionOptions = [
  { value: 'hair-loss', label: 'Hair Loss' },
  { value: 'split-ends', label: 'Split Ends' },
  { value: 'itchy-scalp', label: 'Itchy Scalp' },
  { value: 'dandruff', label: 'Dandruff' },
  { value: 'heat-damage', label: 'Heat Damage' },
  { value: 'breakage', label: 'Breakage' },
  { value: 'other', label: 'Other' },
];

const stylingDescriptionOptions = [
  { value: 'low-maintenance', label: 'I prefer low-maintenance, longer-lasting services' },
  { value: 'grows-out-well', label: "I'm open to investing in hair that grows out well" },
  { value: 'simple-predictable', label: 'I like to keep things simple and predictable' },
  { value: 'frequent-visits', label: 'I enjoy frequent salon visits and detailed upkeep' },
];

const dailyRoutineOptions = [
  { value: 'wash-and-go', label: 'Wash & go' },
  { value: 'style-when-needed', label: 'I style it only when I need to' },
  { value: 'blow-dryer-brush', label: "I'm pretty good with a blow-dryer & brush" },
  { value: 'hot-tools-daily', label: 'I style my hair most days using hot tools' },
  { value: 'enjoys-styling', label: 'My hair is part of my daily routine and I enjoy styling it' },
];

const shampooFrequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'every-other-day', label: 'Every other day' },
  { value: '2-3x-week', label: '2\u20133x a week' },
  { value: 'once-week', label: 'Once a week' },
  { value: 'less-than-weekly', label: 'Less than weekly' },
];

const hairHistoryOptions = [
  { value: 'box-color', label: 'Box Color' },
  { value: 'henna', label: 'Henna' },
  { value: 'professional-color', label: 'Professional Color' },
  { value: 'splat', label: 'Splat' },
  { value: 'manic-panic', label: 'Manic Panic' },
  { value: 'previous-lightening', label: 'Previous Lightening' },
  { value: 'keratin', label: 'Keratin Treatment' },
  { value: 'perm', label: 'Perm' },
  { value: 'relaxer', label: 'Relaxer' },
  { value: 'never-colored', label: 'I have never colored my hair' },
];

const colorReactionOptions = [
  { value: 'itching', label: 'Itching' },
  { value: 'burning', label: 'Burning' },
  { value: 'swelling', label: 'Swelling' },
  { value: 'sores-blisters', label: 'Sores/Blisters' },
  { value: 'rash-hives', label: 'Rash/Hives' },
  { value: 'other', label: 'Other' },
  { value: 'no-reaction', label: "No, I haven't" },
  { value: 'not-sure', label: 'Not sure' },
];

const maintenanceFrequencyOptions = [
  { value: '3-5-weeks', label: '3-5 weeks' },
  { value: '6-8-weeks', label: '6-8 weeks' },
  { value: '10-12-weeks', label: '10-12 weeks' },
  { value: 'every-6-months', label: 'Every 6 Months' },
  { value: 'once-a-year', label: 'Once a Year' },
];

const availabilityOptions = [
  { value: 'tue-morning', label: 'Tue morning' },
  { value: 'tue-afternoon', label: 'Tue afternoon' },
  { value: 'wed-morning', label: 'Wed morning' },
  { value: 'wed-afternoon', label: 'Wed afternoon' },
  { value: 'thu-morning', label: 'Thu morning' },
  { value: 'thu-afternoon', label: 'Thu afternoon' },
  { value: 'flexible', label: 'Flexible \u2014 any opening' },
];

const contactPreferences = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other' },
];

// --- Types ---

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface FormData {
  first_name: string;
  last_name: string;
  pronouns: string;
  email: string;
  phone: string;
  preferred_contact: string[];
  hair_love_hate: string;
  service_interest: string[];
  hair_texture: string;
  hair_length: string;
  hair_density: string;
  hair_condition: string[];
  styling_description: string;
  daily_routine: string;
  shampoo_frequency: string;
  hair_history: string[];
  color_reaction: string[];
  product_shampoo: string;
  product_conditioner: string;
  product_hair_spray: string;
  product_dry_shampoo: string;
  product_heat_protector: string;
  product_other: string;
  what_you_want: string;
  maintenance_frequency: string;
  availability: string[];
  medical_info: string;
  referral_source: string;
  consent: boolean;
  _honey: string;
}

// --- Helpers ---

function RadioGroup({
  name,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (name: string, value: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={`grid gap-2 ${columns === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`px-4 py-3 rounded-lg text-sm cursor-pointer transition-colors border min-h-[44px] flex items-center ${
            value === opt.value
              ? 'bg-forest-500 text-white border-forest-500'
              : 'bg-white text-warm-500 border-warm-200 hover:border-warm-300'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(name, opt.value)}
            className="sr-only"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function PillGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`px-4 py-2 rounded-full text-sm cursor-pointer transition-colors min-h-[44px] flex items-center ${
            value === opt.value
              ? 'bg-forest-500 text-white'
              : 'bg-warm-100 text-warm-500 hover:bg-warm-200'
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(name, opt.value)}
            className="sr-only"
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({
  name,
  options,
  values,
  onChange,
  columns = 2,
}: {
  name: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (name: string, values: string[]) => void;
  columns?: 2 | 3;
}) {
  function toggle(val: string) {
    if (values.includes(val)) {
      onChange(name, values.filter((v) => v !== val));
    } else {
      onChange(name, [...values, val]);
    }
  }

  return (
    <div className={`grid gap-2 ${columns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`px-4 py-3 rounded-lg text-sm cursor-pointer transition-colors border min-h-[44px] flex items-center gap-2 ${
            values.includes(opt.value)
              ? 'bg-forest-500 text-white border-forest-500'
              : 'bg-white text-warm-500 border-warm-200 hover:border-warm-300'
          }`}
        >
          <input
            type="checkbox"
            checked={values.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="sr-only"
          />
          <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
            values.includes(opt.value)
              ? 'bg-white/20 border-white/40'
              : 'border-warm-300'
          }`}>
            {values.includes(opt.value) && <CheckCircle size={12} />}
          </span>
          {opt.label}
        </label>
      ))}
    </div>
  );
}

// --- Main Component ---

export default function NewClientFormPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<'idle' | 'sending' | 'uploading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selfieFiles, setSelfieFiles] = useState<File[]>([]);
  const [inspoFiles, setInspoFiles] = useState<File[]>([]);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const inspoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    pronouns: '',
    email: '',
    phone: '',
    preferred_contact: [],
    hair_love_hate: '',
    service_interest: [],
    hair_texture: '',
    hair_length: '',
    hair_density: '',
    hair_condition: [],
    styling_description: '',
    daily_routine: '',
    shampoo_frequency: '',
    hair_history: [],
    color_reaction: [],
    product_shampoo: '',
    product_conditioner: '',
    product_hair_spray: '',
    product_dry_shampoo: '',
    product_heat_protector: '',
    product_other: '',
    what_you_want: '',
    maintenance_frequency: '',
    availability: [],
    medical_info: '',
    referral_source: '',
    consent: false,
    _honey: '',
  });

  // --- Handlers ---

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  }

  function handleRadio(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  }

  function handleCheckboxGroup(name: string, values: string[]) {
    setFormData((prev) => ({ ...prev, [name]: values }));
    if (errors[name]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  }

  function handleFileAdd(type: 'selfie' | 'inspo', newFiles: FileList | null) {
    if (!newFiles) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const valid: File[] = [];
    const fileErrors: string[] = [];

    Array.from(newFiles).forEach((f) => {
      if (!allowed.includes(f.type) && !f.name.toLowerCase().endsWith('.heic')) {
        fileErrors.push(`${f.name}: must be JPG, PNG, WebP, or HEIC`);
      } else if (f.size > maxSize) {
        fileErrors.push(`${f.name}: must be under 10MB`);
      } else {
        valid.push(f);
      }
    });

    if (type === 'selfie') {
      const combined = [...selfieFiles, ...valid].slice(0, 3);
      setSelfieFiles(combined);
    } else {
      const combined = [...inspoFiles, ...valid].slice(0, 3);
      setInspoFiles(combined);
    }

    if (fileErrors.length > 0) {
      setErrors((prev) => ({ ...prev, photos: fileErrors.join('. ') }));
    } else if (errors.photos) {
      setErrors((prev) => { const next = { ...prev }; delete next.photos; return next; });
    }
  }

  function removeFile(type: 'selfie' | 'inspo', index: number) {
    if (type === 'selfie') {
      setSelfieFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setInspoFiles((prev) => prev.filter((_, i) => i !== index));
    }
  }

  // --- Validation ---

  function validateStep(s: Step): boolean {
    const newErrors: Record<string, string> = {};

    if (s === 1) {
      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        newErrors.email = 'Please enter a valid email';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (formData.preferred_contact.length === 0) newErrors.preferred_contact = 'Please select one';
    }

    if (s === 2) {
      if (formData.service_interest.length === 0) newErrors.service_interest = 'Please select a service';
      if (!formData.hair_texture) newErrors.hair_texture = 'Please select your texture';
      if (!formData.hair_length) newErrors.hair_length = 'Please select your length';
      if (!formData.hair_density) newErrors.hair_density = 'Please select your density';
      if (formData.hair_condition.length === 0) newErrors.hair_condition = 'Select at least one';
    }

    if (s === 3) {
      if (!formData.styling_description) newErrors.styling_description = 'Please select one';
      if (!formData.daily_routine) newErrors.daily_routine = 'Please select one';
      if (!formData.shampoo_frequency) newErrors.shampoo_frequency = 'Please select one';
    }

    if (s === 4) {
      if (formData.hair_history.length === 0) newErrors.hair_history = 'Select at least one';
      if (formData.color_reaction.length === 0) newErrors.color_reaction = 'Please select one';
    }

    if (s === 5) {
      if (!formData.what_you_want.trim()) newErrors.what_you_want = 'Please share what you\u2019re hoping for';
      if (!formData.maintenance_frequency) newErrors.maintenance_frequency = 'Please select one';
      if (formData.availability.length === 0) newErrors.availability = 'Select at least one';
    }

    // Step 6 (photos) has no required fields

    if (s === 7) {
      if (!formData.consent) newErrors.consent = 'You must agree to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 7) as Step);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 50);
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1) as Step);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 50);
  }

  // --- Submit ---

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData._honey) return;
    if (!validateStep(step)) return;

    setErrors({});
    setStatus('sending');

    try {
      // Phase 1: Submit text fields
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          pronouns: formData.pronouns || undefined,
          email: formData.email,
          phone: formData.phone,
          preferred_contact: formData.preferred_contact,
          hair_love_hate: formData.hair_love_hate || undefined,
          service_interest: formData.service_interest,
          hair_texture: formData.hair_texture,
          hair_length: formData.hair_length,
          hair_density: formData.hair_density,
          hair_condition: formData.hair_condition,
          styling_description: formData.styling_description,
          daily_routine: formData.daily_routine,
          shampoo_frequency: formData.shampoo_frequency,
          hair_history: formData.hair_history,
          color_reaction: formData.color_reaction,
          product_shampoo: formData.product_shampoo || undefined,
          product_conditioner: formData.product_conditioner || undefined,
          product_hair_spray: formData.product_hair_spray || undefined,
          product_dry_shampoo: formData.product_dry_shampoo || undefined,
          product_heat_protector: formData.product_heat_protector || undefined,
          product_other: formData.product_other || undefined,
          what_you_want: formData.what_you_want,
          maintenance_frequency: formData.maintenance_frequency,
          availability: formData.availability,
          medical_info: formData.medical_info || undefined,
          referral_source: formData.referral_source || undefined,
          consent: formData.consent,
        }),
      });

      if (!res.ok) {
        setStatus('error');
        return;
      }

      const { clientId } = await res.json();

      // Phase 2: Upload photos if any
      const allPhotos = [...selfieFiles, ...inspoFiles];
      if (allPhotos.length > 0 && clientId) {
        setStatus('uploading');
        const fd = new FormData();
        selfieFiles.forEach((f) => fd.append('selfies', f));
        inspoFiles.forEach((f) => fd.append('inspiration', f));

        await fetch(`/api/intake/upload?clientId=${clientId}`, {
          method: 'POST',
          body: fd,
        });
        // Photo upload failure is non-blocking — client data is already saved
      }

      setStatus('success');
      router.push('/book');
    } catch {
      setStatus('error');
    }
  }

  // --- Karli's opening (before form) ---

  if (!showForm) {
    return (
      <MotionPage>
      <div className="flex flex-col">
        <section className="relative py-14 sm:py-20 overflow-hidden">
          <Image
            src="/scizzors.webp"
            alt=""
            fill
            className="object-cover object-[center_55%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/85" />
          <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">            <h1 className="font-serif text-3xl sm:text-4xl text-warm-800 mb-3">
              New Client Form
            </h1>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="bg-blush-50/60 rounded-2xl p-6 sm:p-10 border border-warm-100">
              <p className="text-warm-600 leading-relaxed mb-4">
                Hey there -- I&apos;m so glad you&apos;re here.
              </p>
              <p className="text-warm-600 leading-relaxed mb-4">
                This form helps me understand you, your hair, and how it fits into your real life.
                My approach is rooted in intentional design, low-maintenance results, and hair that
                grows out beautifully -- not hair that constantly asks more of you.
              </p>
              <p className="text-warm-600 leading-relaxed mb-4">
                Please fill this out as thoughtfully and honestly as possible. This allows me to
                recommend services that feel aligned, sustainable, and realistic for your lifestyle
                and maintenance preferences.
              </p>
              <p className="text-warm-600 leading-relaxed mb-4">
                <strong className="text-warm-700">Consultations are required</strong> for most color
                services and transformations.{' '}
                <strong className="text-warm-700">Haircut appointments</strong> do not require a
                separate consultation.
              </p>
              <p className="text-warm-600 leading-relaxed mb-6">
                I can&apos;t wait to learn more about you.
              </p>
              <p className="text-sm text-warm-500 italic mb-8">-- Karli</p>

              <div className="bg-white/70 rounded-xl p-4 sm:p-6 border border-warm-100">
                <p className="text-xs text-warm-500 leading-relaxed mb-3">
                  <Sparkles size={12} className="inline mr-1 text-copper-400" />
                  Your form will be reviewed within <strong>72 hours</strong>. As a neurodivergent
                  business owner, I truly appreciate a gentle follow-up if you haven&apos;t heard
                  back after a few days.
                </p>
                <div className="flex items-center gap-4">
                  <a href="tel:9515416620" className="text-copper-500 hover:text-copper-600 font-medium text-xs">
                    (951) 541-6620
                  </a>
                  <Image
                    src="/images/karli-qr.svg"
                    alt="Scan to save Karli's contact info"
                    width={80}
                    height={80}
                    className="rounded border border-warm-100"
                  />
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => { setShowForm(true); setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 50); }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors text-sm font-medium min-h-[44px]"
                >
                  Let&apos;s Get Started
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      </MotionPage>
    );
  }

  // --- Step labels for progress bar ---

  const stepLabels = [
    'About You', 'Your Hair', 'Personality', 'History',
    'Goals', 'Photos', 'Almost Done',
  ];
  const totalSteps = 7;

  // --- Form ---

  return (
    <MotionPage>
    <div className="flex flex-col">
      {/* Header */}
      <section className="relative py-10 sm:py-14 overflow-hidden">
        <Image
          src="/scizzors.webp"
          alt=""
          fill
          className="object-cover object-[center_55%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/85" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">          <h1 className="font-serif text-2xl sm:text-3xl text-warm-800">
            New Client Form
          </h1>
        </div>
      </section>

      {/* Progress indicator */}
      <div className="bg-blush-50 py-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Mobile: simple bar */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-warm-500 font-medium">
                Step {step} of {totalSteps}: {stepLabels[step - 1]}
              </span>
              <span className="text-xs text-warm-400">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
              <motion.div
                className="h-1 bg-forest-400 rounded-full"
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              />
            </div>
          </div>
          {/* Desktop: step circles */}
          <div className="hidden sm:flex items-center justify-between">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    i + 1 <= step
                      ? 'bg-forest-500 text-white'
                      : 'bg-warm-100 text-warm-400'
                  }`}
                >
                  {i + 1 < step ? <CheckCircle size={13} /> : i + 1}
                </div>
                <span
                  className={`text-xs ${
                    i + 1 <= step ? 'text-warm-600 font-medium' : 'text-warm-400'
                  }`}
                >
                  {label}
                </span>
                {i < totalSteps - 1 && (
                  <div
                    className={`w-4 lg:w-8 h-px mx-1 ${
                      i + 1 < step ? 'bg-forest-400' : 'bg-warm-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <input
                type="text"
                name="_honey"
                value={formData._honey}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
            {/* ===== STEP 1: About You ===== */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-warm-700 mb-1">About You</h2>
                  <p className="text-sm text-warm-400 mb-6">The basics so I can reach you.</p>
                </div>

                <p className="text-xs text-warm-400 italic">
                  Today&apos;s date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-warm-600 mb-1">
                      First Name <span className="text-copper-400">*</span>
                    </label>
                    <input
                      type="text" id="first_name" name="first_name"
                      value={formData.first_name} onChange={handleChange}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500 ${errors.first_name ? 'border-red-300' : 'border-warm-200'}`}
                      placeholder="First name"
                    />
                    {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-warm-600 mb-1">
                      Last Name <span className="text-copper-400">*</span>
                    </label>
                    <input
                      type="text" id="last_name" name="last_name"
                      value={formData.last_name} onChange={handleChange}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500 ${errors.last_name ? 'border-red-300' : 'border-warm-200'}`}
                      placeholder="Last name"
                    />
                    {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="pronouns" className="block text-sm font-medium text-warm-600 mb-1">
                    Pronouns <span className="text-warm-400 text-xs">(leave blank if no preference)</span>
                  </label>
                  <input
                    type="text" id="pronouns" name="pronouns"
                    value={formData.pronouns} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500"
                    placeholder="e.g. she/her, they/them"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-warm-600 mb-1">
                    Email <span className="text-copper-400">*</span>
                  </label>
                  <input
                    type="email" id="email" name="email"
                    value={formData.email} onChange={handleChange}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500 ${errors.email ? 'border-red-300' : 'border-warm-200'}`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-warm-600 mb-1">
                    Phone <span className="text-copper-400">*</span>
                  </label>
                  <input
                    type="tel" id="phone" name="phone"
                    value={formData.phone} onChange={handleChange}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500 ${errors.phone ? 'border-red-300' : 'border-warm-200'}`}
                    placeholder="(555) 123-4567"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    Best way to reach you? <span className="text-copper-400">*</span>
                  </label>
                  <CheckboxGroup
                    name="preferred_contact"
                    options={contactPreferences}
                    values={formData.preferred_contact}
                    onChange={handleCheckboxGroup}
                  />
                  {errors.preferred_contact && <p className="text-xs text-red-500 mt-1">{errors.preferred_contact}</p>}
                </div>
              </div>
            )}

            {/* ===== STEP 2: Your Hair ===== */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-warm-700 mb-1">Your Hair</h2>
                  <p className="text-sm text-warm-400 mb-6">No wrong answers -- this helps me prepare.</p>
                </div>

                <div>
                  <label htmlFor="hair_love_hate" className="block text-sm font-medium text-warm-600 mb-1">
                    Please tell me what you love and hate about your hair currently?
                  </label>
                  <textarea
                    id="hair_love_hate" name="hair_love_hate" rows={3}
                    value={formData.hair_love_hate} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500 resize-y"
                    placeholder="I love the color but hate how flat it is... It never holds a curl..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    What service/s are you interested in? <span className="text-copper-400">*</span>{' '}
                    <span className="text-warm-400 text-xs font-normal">(select all that apply)</span>
                  </label>
                  <CheckboxGroup name="service_interest" options={serviceOptions} values={formData.service_interest} onChange={handleCheckboxGroup} />
                  {errors.service_interest && <p className="text-xs text-red-500 mt-1">{errors.service_interest}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    Hair Type <span className="text-copper-400">*</span>{' '}
                    <span className="text-warm-400 text-xs font-normal">Please select one of the following that best describes your hair</span>
                  </label>
                  <PillGroup name="hair_texture" options={hairTextureOptions} value={formData.hair_texture} onChange={handleRadio} />
                  {errors.hair_texture && <p className="text-xs text-red-500 mt-1">{errors.hair_texture}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    Hair Length <span className="text-copper-400">*</span>
                  </label>
                  <RadioGroup name="hair_length" options={hairLengthOptions} value={formData.hair_length} onChange={handleRadio} />
                  {errors.hair_length && <p className="text-xs text-red-500 mt-1">{errors.hair_length}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    Hair Texture <span className="text-copper-400">*</span>{' '}
                    <span className="text-warm-400 text-xs font-normal">How would you describe your hair texture?</span>
                  </label>
                  <RadioGroup name="hair_density" options={hairDensityOptions} value={formData.hair_density} onChange={handleRadio} />
                  {errors.hair_density && <p className="text-xs text-red-500 mt-1">{errors.hair_density}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    Hair Condition <span className="text-copper-400">*</span>{' '}
                    <span className="text-warm-400 text-xs font-normal">(select all that apply)</span>
                  </label>
                  <CheckboxGroup
                    name="hair_condition" options={hairConditionOptions}
                    values={formData.hair_condition} onChange={handleCheckboxGroup}
                  />
                  {errors.hair_condition && <p className="text-xs text-red-500 mt-1">{errors.hair_condition}</p>}
                </div>
              </div>
            )}

            {/* ===== STEP 3: Hair Personality & Routine ===== */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-warm-700 mb-1">Hair Personality &amp; Routine</h2>
                  <p className="text-sm text-warm-400 mb-6">I design around your actual life -- not a Pinterest board.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    When it comes to your hair, which best describes you? <span className="text-copper-400">*</span>
                  </label>
                  <RadioGroup name="styling_description" options={stylingDescriptionOptions} value={formData.styling_description} onChange={handleRadio} columns={1} />
                  {errors.styling_description && <p className="text-xs text-red-500 mt-1">{errors.styling_description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    What does your day-to-day hair routine usually look like? <span className="text-copper-400">*</span>
                  </label>
                  <RadioGroup name="daily_routine" options={dailyRoutineOptions} value={formData.daily_routine} onChange={handleRadio} />
                  {errors.daily_routine && <p className="text-xs text-red-500 mt-1">{errors.daily_routine}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    How often do you shampoo/condition? <span className="text-copper-400">*</span>
                  </label>
                  <RadioGroup name="shampoo_frequency" options={shampooFrequencyOptions} value={formData.shampoo_frequency} onChange={handleRadio} />
                  {errors.shampoo_frequency && <p className="text-xs text-red-500 mt-1">{errors.shampoo_frequency}</p>}
                </div>
              </div>
            )}

            {/* ===== STEP 4: Hair History ===== */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-warm-700 mb-1">Hair History</h2>
                  <p className="text-sm text-warm-400 mb-6">What your hair has been through matters -- no judgment.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    Let&apos;s talk hair history. Click all that apply within the last 2 years <span className="text-copper-400">*</span>
                  </label>
                  <CheckboxGroup
                    name="hair_history" options={hairHistoryOptions}
                    values={formData.hair_history} onChange={handleCheckboxGroup}
                  />
                  {errors.hair_history && <p className="text-xs text-red-500 mt-1">{errors.hair_history}</p>}
                </div>

                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    If you&apos;ve had <strong>ANYTHING</strong> in your hair -- box dye, henna, bleach,
                    keratin, anything -- please note that this will be brought up in the consultation.
                    Ya girls gotta know what she&apos;s working with!
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    Have you ever had a reaction to color or chemical treatments? <span className="text-copper-400">*</span>
                  </label>
                  <CheckboxGroup name="color_reaction" options={colorReactionOptions} values={formData.color_reaction} onChange={handleCheckboxGroup} />
                  {errors.color_reaction && <p className="text-xs text-red-500 mt-1">{errors.color_reaction}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    What hair products do you currently use? Please specify brand.{' '}
                    <span className="text-warm-400 text-xs font-normal">(optional)</span>
                  </label>
                  <div className="space-y-3">
                    {[
                      { name: 'product_shampoo', label: 'Shampoo' },
                      { name: 'product_conditioner', label: 'Conditioner' },
                      { name: 'product_hair_spray', label: 'Hair Spray' },
                      { name: 'product_dry_shampoo', label: 'Dry Shampoo' },
                      { name: 'product_heat_protector', label: 'Heat Protector' },
                      { name: 'product_other', label: 'Other' },
                    ].map(({ name, label }) => (
                      <div key={name} className="flex items-center gap-3">
                        <label htmlFor={name} className="text-sm text-warm-600 w-28 flex-shrink-0">{label}</label>
                        <input
                          type="text" id={name} name={name}
                          value={(formData as unknown as Record<string, string>)[name] || ''}
                          onChange={handleChange}
                          className="flex-1 px-3 py-2.5 rounded-lg border border-warm-200 text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== STEP 5: Goals & Schedule ===== */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-warm-700 mb-1">Goals &amp; Schedule</h2>
                  <p className="text-sm text-warm-400 mb-6">
                    Don&apos;t worry about having it all figured out -- that&apos;s what I&apos;m here for.
                  </p>
                </div>

                <div>
                  <label htmlFor="what_you_want" className="block text-sm font-medium text-warm-600 mb-1">
                    What are you hoping to get from your cut or color? <span className="text-copper-400">*</span>
                  </label>
                  <p className="text-xs text-warm-400 mb-2">
                    Examples: feeling put together, ease in the mornings, confidence, simplicity, a fresh
                    start, something that fits this season of your life. Something that feels a little more
                    like <em>me</em>.
                  </p>
                  <p className="text-xs text-warm-400 mb-2">
                    There is no right or wrong answer to this question. This just helps me to better
                    customize your look based on your expectations.
                  </p>
                  <textarea
                    id="what_you_want" name="what_you_want" rows={5}
                    value={formData.what_you_want} onChange={handleChange}
                    className={`w-full px-3 py-2.5 rounded-lg border text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500 resize-y ${errors.what_you_want ? 'border-red-300' : 'border-warm-200'}`}
                    placeholder="I want something low maintenance that still looks polished..."
                  />
                  {errors.what_you_want && <p className="text-xs text-red-500 mt-1">{errors.what_you_want}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    How often do you want to visit the salon for maintenance? <span className="text-copper-400">*</span>
                  </label>
                  <RadioGroup name="maintenance_frequency" options={maintenanceFrequencyOptions} value={formData.maintenance_frequency} onChange={handleRadio} />
                  {errors.maintenance_frequency && <p className="text-xs text-red-500 mt-1">{errors.maintenance_frequency}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-2">
                    When are you usually available? <span className="text-copper-400">*</span>{' '}
                    <span className="text-warm-400 text-xs font-normal">(select all that work)</span>
                  </label>
                  <CheckboxGroup
                    name="availability" options={availabilityOptions}
                    values={formData.availability} onChange={handleCheckboxGroup}
                    columns={3}
                  />
                  {errors.availability && <p className="text-xs text-red-500 mt-1">{errors.availability}</p>}
                </div>
              </div>
            )}

            {/* ===== STEP 6: Show Me! ===== */}
            {step === 6 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-warm-700 mb-1">Show Me!</h2>
                  <p className="text-sm text-warm-400 mb-6">
                    Now let&apos;s take a look! Attach some photos of yourself :) lemme see that gorgeous face!
                    Please show how you normally wear your hair. Please take photos in good lighting if possible.
                    Also attach some inspo photos. We&apos;re one step closer to creating the hair of your DREAMS!
                  </p>
                </div>

                {/* Selfie photos */}
                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-1">
                    Selfie Photos <span className="text-warm-400 text-xs font-normal">(front, side, back -- up to 3)</span>
                  </label>
                  <p className="text-xs text-warm-400 mb-3">
                    Show how you normally wear your hair. Good lighting, no filters -- I want to see the real you!
                  </p>

                  {selfieFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {selfieFiles.map((f, i) => (
                        <div key={`selfie-${i}`} className="relative group">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-warm-100 border border-warm-200">
                            <img
                              src={URL.createObjectURL(f)}
                              alt={`Selfie ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('selfie', i)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove selfie ${i + 1}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selfieFiles.length < 3 && (
                    <>
                      <input
                        ref={selfieInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,.heic"
                        multiple
                        onChange={(e) => handleFileAdd('selfie', e.target.files)}
                        className="sr-only"
                        aria-label="Upload selfie photos"
                      />
                      <button
                        type="button"
                        onClick={() => selfieInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-warm-200 text-sm text-warm-500 hover:border-forest-400 hover:text-forest-600 transition-colors min-h-[44px]"
                      >
                        <Camera size={16} />
                        Add Selfie Photo{selfieFiles.length > 0 ? 's' : ''}
                      </button>
                    </>
                  )}
                </div>

                {/* Inspiration photos */}
                <div>
                  <label className="block text-sm font-medium text-warm-600 mb-1">
                    Inspiration Photos <span className="text-warm-400 text-xs font-normal">(up to 3)</span>
                  </label>
                  <p className="text-xs text-warm-400 mb-3">
                    Screenshots from Instagram, Pinterest, or anywhere -- show me what catches your eye.
                  </p>

                  {inspoFiles.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-3">
                      {inspoFiles.map((f, i) => (
                        <div key={`inspo-${i}`} className="relative group">
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-warm-100 border border-warm-200">
                            <img
                              src={URL.createObjectURL(f)}
                              alt={`Inspiration ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('inspo', i)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remove inspiration photo ${i + 1}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {inspoFiles.length < 3 && (
                    <>
                      <input
                        ref={inspoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,.heic"
                        multiple
                        onChange={(e) => handleFileAdd('inspo', e.target.files)}
                        className="sr-only"
                        aria-label="Upload inspiration photos"
                      />
                      <button
                        type="button"
                        onClick={() => inspoInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-warm-200 text-sm text-warm-500 hover:border-forest-400 hover:text-forest-600 transition-colors min-h-[44px]"
                      >
                        <Upload size={16} />
                        Add Inspiration Photo{inspoFiles.length > 0 ? 's' : ''}
                      </button>
                    </>
                  )}
                </div>

                {errors.photos && (
                  <p className="text-xs text-red-500">{errors.photos}</p>
                )}

                <div className="bg-blush-50 rounded-lg p-4 border border-warm-100">
                  <p className="text-xs text-warm-500 leading-relaxed">
                    <strong>Accepted formats:</strong> JPG, PNG, WebP, or HEIC. Max 10MB each.
                    No photos? No worries -- we&apos;ll figure it out together at your appointment.
                  </p>
                </div>
              </div>
            )}

            {/* ===== STEP 7: Almost Done ===== */}
            {step === 7 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-warm-700 mb-1">Almost Done!</h2>
                  <p className="text-sm text-warm-400 mb-6">We&apos;re one step closer to creating the hair of your dreams!</p>
                </div>

                <div>
                  <label htmlFor="medical_info" className="block text-sm font-medium text-warm-600 mb-1">
                    Things I might need to know{' '}
                    <span className="text-warm-400 text-xs">(optional)</span>
                  </label>
                  <p className="text-xs text-warm-400 mb-2">
                    Please tell me any additional information you feel might be important for me to know
                    before your appointment. Be as detailed as possible.
                  </p>
                  <p className="text-xs text-warm-400 mb-2">
                    All these things play a big role in creating your hair goals (example: additional hair
                    history, postpartum and covid hair loss, cancer, thyroid and depression medications, as
                    well as allergies, alopecia, eczema and psoriasis)
                  </p>
                  <textarea
                    id="medical_info" name="medical_info" rows={3}
                    value={formData.medical_info} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500 resize-y"
                    placeholder="I'm on medication that makes my hair thinner, I have a sensitive scalp..."
                  />
                </div>

                <div>
                  <label htmlFor="referral_source" className="block text-sm font-medium text-warm-600 mb-1">
                    How did you find me? <span className="text-warm-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text" id="referral_source" name="referral_source"
                    value={formData.referral_source} onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-lg border border-warm-200 text-sm bg-white text-warm-700 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-copper-500"
                    placeholder="Instagram, a friend, Google..."
                  />
                </div>

                {/* Before-booking info */}
                <div className="bg-blush-50 rounded-xl p-5 border border-warm-100 space-y-3">
                  <h3 className="text-sm font-medium text-warm-700">Before booking, please note:</h3>
                  <ul className="text-xs text-warm-500 space-y-2 leading-relaxed">
                    <li>&bull; All services are charged at an hourly rate</li>
                    <li>&bull; Appointments are available <strong className="text-warm-600">Tuesday--Thursday, 10am--7pm</strong></li>
                    <li>&bull; My work focuses on intentional, low-maintenance results designed to grow out well</li>
                    <li>&bull; I photograph and film most clients, but your privacy is always respected</li>
                    <li>&bull; By submitting this form, you consent to me using photos from our session for portfolio/social media purposes (I&apos;ll always ask before posting)</li>
                    <li>&bull; By submitting this form, you agree to receive text message notifications. You can stop these at any time.</li>
                  </ul>
                  <p className="text-xs text-warm-500 leading-relaxed pt-2 border-t border-warm-100">
                    Upon submitting the form, you will be redirected to Karli&apos;s calendar to book your appointment!
                  </p>
                </div>

                {/* Consent checkbox */}
                <label className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  formData.consent
                    ? 'bg-forest-50 border-forest-200'
                    : errors.consent ? 'bg-white border-red-300' : 'bg-white border-warm-200 hover:border-warm-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, consent: e.target.checked }));
                      if (errors.consent) {
                        setErrors((prev) => { const next = { ...prev }; delete next.consent; return next; });
                      }
                    }}
                    className="mt-0.5 w-5 h-5 rounded border-warm-300 text-forest-500 focus:ring-forest-500 flex-shrink-0"
                  />
                  <span className="text-sm text-warm-600 leading-relaxed">
                    I&apos;ve read the above and I agree to the{' '}
                    <a href="/legal/terms" target="_blank" className="text-forest-500 hover:text-forest-600 underline">Terms of Use</a>
                    {' '}and{' '}
                    <a href="/legal/privacy" target="_blank" className="text-forest-500 hover:text-forest-600 underline">Privacy Policy</a>.
                    Let&apos;s do this! <span className="text-copper-400">*</span>
                  </span>
                </label>
                {errors.consent && <p className="text-xs text-red-500 -mt-4">{errors.consent}</p>}
              </div>
            )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-warm-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-warm-500 hover:text-warm-700 transition-colors min-h-[44px]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm text-warm-500 hover:text-warm-700 transition-colors min-h-[44px]"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors text-sm font-medium min-h-[44px]"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={status === 'sending' || status === 'uploading'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-forest-500 text-white rounded-lg hover:bg-forest-600 transition-colors text-sm font-medium min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? 'Saving...' : status === 'uploading' ? 'Uploading photos...' : (
                    <>Submit <Send size={16} /></>
                  )}
                </button>
              )}
            </div>

            {status === 'error' && (
              <p className="text-sm text-red-500 text-center mt-4">
                Something went wrong. Please try again or reach out at{' '}
                <a href="tel:9515416620" className="text-copper-500 hover:text-copper-600 font-medium">(951) 541-6620</a>.
              </p>
            )}
          </form>

          {/* Reassurance */}
          <div className="mt-10 pt-8 border-t border-warm-100 text-center">            <p className="text-sm text-warm-600 leading-relaxed max-w-sm mx-auto mb-2">
              Thank you for trusting me with your hair -- I don&apos;t take that lightly.
            </p>
            <p className="text-xs text-warm-400 leading-relaxed max-w-sm mx-auto">
              Your information stays between us. I use this to prepare for our
              consultation so we can make the most of our time together.
            </p>
          </div>
        </div>
      </section>
    </div>
    </MotionPage>
  );
}
