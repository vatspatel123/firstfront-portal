import { useState, useRef, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Check, Sun, FileSearch, Building2, FileText, Search, Upload, MapPin, Home, Monitor, Factory, X } from 'lucide-react'
import toast from 'react-hot-toast'
import API from '../../utils/api'
import { SERVICE_TYPES } from '../../utils/constants'

const steps = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Site Details' },
  { id: 3, label: 'Upload Files' },
  { id: 4, label: 'Confirm' },
]

const propertyTypes = [
  { id: 'residential', label: 'Residential', icon: Home },
  { id: 'commercial', label: 'Commercial', icon: Monitor },
  { id: 'industrial', label: 'Industrial', icon: Factory },
]

const serviceIcons: Record<string, typeof Sun> = {
  'pre-plan': Sun,
  'detailed': FileSearch,
  'mw-scale': Building2,
  'ceig': FileText,
  'shadow': Search,
}

export default function NewProjectWizard() {
  const [step, setStep] = useState(1)
  const [service, setService] = useState('')
  const [property, setProperty] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const selectedService = SERVICE_TYPES.find(s => s.id === service)
      const res = await API.post('/api/projects/', {
        name: `${selectedService?.name || 'Solar Design'} - ${location}`,
        location,
        capacity,
        project_type: property,
        services_required: selectedService?.name || service,
        notes: `Property: ${property}. Files uploaded: ${files.length}.`,
      })
      const projectId = res.data.id

      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData()
          formData.append('file', file)
          await API.post(`/api/files/upload/${projectId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
      }

      setShowSuccess(true)
      toast.success('Project submitted successfully!')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to submit project. Please try again.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Project Submitted Successfully!</h2>
          <p className="text-sm text-slate-500 mb-6">Our team has received your request. We'll start the data review within 24 hours.</p>
          <button onClick={() => { setStep(1); setService(''); setProperty(''); setLocation(''); setCapacity(''); setFiles([]); setShowSuccess(false) }}
            className="bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-all duration-200 font-medium">Create Another Project</button>
        </div>
      </div>
    )
  }

  const canNext = () => {
    if (step === 1) return service !== ''
    if (step === 2) return property !== '' && location !== '' && capacity !== ''
    if (step === 3) return true
    return true
  }

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    setFiles(prev => [...prev, ...arr])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }, [])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Start a New Project</h1>
        <p className="text-sm text-slate-500 mt-1">Tell us about your solar site and we'll handle the rest.</p>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step > s.id ? 'bg-blue-600 text-white' :
              step === s.id ? 'bg-blue-600 text-white' :
              'bg-slate-100 text-slate-400'
            }`}>
              {step > s.id ? <Check className="h-4 w-4" /> : s.id}
            </div>
            <span className={`text-sm hidden sm:block ${step === s.id ? 'font-medium text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${step > s.id ? 'bg-blue-600' : 'bg-slate-100'}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Step 1: Service Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Choose your service type</h2>
            <div className="grid gap-3">
              {SERVICE_TYPES.map((s) => {
                const Icon = serviceIcons[s.id]
                const selected = service === s.id
                return (
                  <button key={s.id} onClick={() => setService(s.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      <p className="text-sm text-slate-500">{s.desc}</p>
                    </div>
                    {selected && <Check className="h-5 w-5 text-blue-600" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Site Details */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Tell us about your site</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Property Type</label>
              <div className="grid grid-cols-3 gap-3">
                {propertyTypes.map((p) => {
                  const Icon = p.icon
                  const selected = property === p.id
                  return (
                    <button key={p.id} onClick={() => setProperty(p.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        selected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'
                      }`}>
                      <Icon className={`h-6 w-6 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className={`text-sm ${selected ? 'font-medium text-blue-700' : 'text-slate-500'}`}>{p.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="City, State" className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 py-2.5 pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">System Capacity</label>
              <input type="text" value={capacity} onChange={e => setCapacity(e.target.value)}
                placeholder="e.g. 10 kW, 50 kW, 200 kW" className="w-full rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 px-4 py-2.5" />
            </div>
          </div>
        )}

        {/* Step 3: Upload Files */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Upload Site Files</h2>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragging
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                  : 'border-slate-200 hover:border-blue-500/50 hover:bg-slate-50'
              }`}
            >
              <Upload className={`h-10 w-10 mx-auto mb-3 transition-colors ${dragging ? 'text-blue-500' : 'text-slate-300'}`} />
              <p className="font-medium text-slate-900">
                {dragging ? 'Drop files here!' : 'Drop files here or click to browse'}
              </p>
              <p className="text-sm text-slate-500 mt-1">Site photos, KML files, site plans (max 25 MB each)</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">{files.length} file(s) selected</p>
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-900 truncate">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i) }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400">You can always upload more files after submission.</p>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Confirm Your Details</h2>
            <div className="space-y-3">
              {[
                { label: 'Service', value: SERVICE_TYPES.find(s => s.id === service)?.name || service },
                { label: 'Property Type', value: propertyTypes.find(p => p.id === property)?.label || property },
                { label: 'Location', value: location },
                { label: 'Capacity', value: capacity },
                { label: 'Files', value: `${files.length} file(s) uploaded` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className="text-sm font-medium text-slate-900">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={submitting}
            className={`flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all ${step === 1 ? 'invisible' : ''}`}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={() => {
            if (step < 4) setStep(s => s + 1)
            else handleSubmit()
          }} disabled={!canNext() || submitting}
            className="bg-blue-600 text-white rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2">
            {submitting ? 'Submitting...' : step === 4 ? 'Submit Project' : 'Continue'}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
