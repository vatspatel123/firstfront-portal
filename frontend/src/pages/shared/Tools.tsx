import { useState, useRef } from 'react'
import { ArrowLeft, Calculator, Weight, Sun, Cable, Wind, Building2, FileImage, Download } from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

type ToolId = 'steel' | 'solar' | 'cable' | 'wind' | 'structure' | 'pdfmerge' | null

const tools = [
  { id: 'steel' as ToolId, name: 'Steel Weight Calculator', desc: 'Calculate steel weight for mounting structures', icon: Weight, status: 'live', color: 'bg-blue-50 text-blue-600' },
  { id: 'solar' as ToolId, name: 'Solar Capacity Calculator', desc: 'Estimate system size from roof area', icon: Sun, status: 'live', color: 'bg-amber-50 text-amber-600' },
  { id: 'cable' as ToolId, name: 'Cable Size Calculator', desc: 'Determine cable size with voltage drop', icon: Cable, status: 'live', color: 'bg-green-50 text-green-600' },
  { id: 'wind' as ToolId, name: 'Wind Load Calculator', desc: 'IS 875 wind pressure for STAAD Pro', icon: Wind, status: 'live', color: 'bg-purple-50 text-purple-600' },
  { id: 'pdfmerge' as ToolId, name: 'Merge Images to PDF', desc: 'Combine multiple images into a single PDF', icon: FileImage, status: 'live', color: 'bg-rose-50 text-rose-600' },
  { id: 'structure' as ToolId, name: 'Structure Load Estimator', desc: 'Total structure load with panel + wind', icon: Building2, status: 'coming', color: 'bg-slate-50 text-slate-600' },
]

function SteelCalculator() {
  const [diameter, setDiameter] = useState('12')
  const [length, setLength] = useState('6')
  const [quantity, setQuantity] = useState('100')
  const d = parseFloat(diameter) || 0
  const l = parseFloat(length) || 0
  const q = parseFloat(quantity) || 0
  const unitWeight = d > 0 ? (d * d) / 162.2 : 0
  const totalWeight = unitWeight * l * q
  const totalCost = totalWeight * 65

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bar Diameter (mm)</label>
          <select value={diameter} onChange={e => setDiameter(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            {[6,8,10,12,16,20,25,28,32].map(d => <option key={d} value={d}>{d} mm</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Length (m)</label>
          <input type="number" value={length} onChange={e => setLength(e.target.value)} min="0.1" step="0.5"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (pcs)</label>
          <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-600 font-medium">Unit Weight</p>
          <p className="text-2xl font-bold text-blue-800">{unitWeight.toFixed(3)} <span className="text-sm font-normal">kg/m</span></p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-slate-600 font-medium">Total Weight</p>
          <p className="text-2xl font-bold text-slate-800">{totalWeight.toFixed(2)} <span className="text-sm font-normal">kg</span></p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-green-600 font-medium">Est. Cost (@ ₹65/kg)</p>
          <p className="text-2xl font-bold text-green-800">₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700 mb-1">Formula</p>
        <p>Unit Weight = d² / 162.2 (kg/m) &nbsp;|&nbsp; Total = Unit Weight × Length × Quantity</p>
      </div>
    </div>
  )
}

function SolarCalculator() {
  const [area, setArea] = useState('500')
  const [efficiency, setEfficiency] = useState('18')
  const [sunHours, setSunHours] = useState('5')
  const a = parseFloat(area) || 0
  const e = parseFloat(efficiency) || 0
  const h = parseFloat(sunHours) || 0
  const capacity = a * (e / 100) * 0.2
  const dailyGen = capacity * h
  const annualGen = dailyGen * 365
  const annualSavings = annualGen * 6
  const panels = Math.floor(capacity * 1000 / 550)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Roof Area (m²)</label>
          <input type="number" value={area} onChange={e => setArea(e.target.value)} min="10"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Panel Efficiency (%)</label>
          <select value={efficiency} onChange={e => setEfficiency(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            {[16,17,18,19,20,21,22].map(e => <option key={e} value={e}>{e}%</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Peak Sun Hours</label>
          <select value={sunHours} onChange={e => setSunHours(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            {[4,4.5,5,5.5,6,6.5,7].map(h => <option key={h} value={h}>{h} hrs</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-amber-600 font-medium">System Size</p>
          <p className="text-2xl font-bold text-amber-800">{capacity.toFixed(1)} <span className="text-sm font-normal">kWp</span></p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-600 font-medium">Daily Generation</p>
          <p className="text-2xl font-bold text-blue-800">{dailyGen.toFixed(0)} <span className="text-sm font-normal">kWh</span></p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-green-600 font-medium">Panels Needed</p>
          <p className="text-2xl font-bold text-green-800">{panels}</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-purple-600 font-medium">Annual Savings</p>
          <p className="text-2xl font-bold text-purple-800">₹{(annualSavings / 100000).toFixed(1)}L</p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700 mb-1">Formula</p>
        <p>Capacity (kWp) = Area × Efficiency × 0.2 kWp/m² &nbsp;|&nbsp; Daily Gen = Capacity × Peak Sun Hours</p>
      </div>
    </div>
  )
}

function CableCalculator() {
  const [current, setCurrent] = useState('50')
  const [distance, setDistance] = useState('100')
  const [voltage, setVoltage] = useState('415')
  const [maxDrop, setMaxDrop] = useState('3')
  const I = parseFloat(current) || 0
  const L = parseFloat(distance) || 0
  const V = parseFloat(voltage) || 0
  const dropPct = parseFloat(maxDrop) || 3
  const vDrop = V * dropPct / 100
  const rho = 0.0175
  const size = vDrop > 0 ? (2 * L * I * rho) / vDrop : 0
  const sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120]
  const recommended = sizes.find(s => s >= size) || 120
  const actualDrop = (2 * L * I * rho) / recommended

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Current (A)</label>
          <input type="number" value={current} onChange={e => setCurrent(e.target.value)} min="1"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Distance (m)</label>
          <input type="number" value={distance} onChange={e => setDistance(e.target.value)} min="1"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Voltage (V)</label>
          <select value={voltage} onChange={e => setVoltage(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            {[230, 415].map(v => <option key={v} value={v}>{v}V</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Max Drop (%)</label>
          <select value={maxDrop} onChange={e => setMaxDrop(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            {[2,3,4,5].map(d => <option key={d} value={d}>{d}%</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-green-600 font-medium">Required Size</p>
          <p className="text-2xl font-bold text-green-800">{size.toFixed(2)} <span className="text-sm font-normal">mm²</span></p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-slate-600 font-medium">Recommended</p>
          <p className="text-2xl font-bold text-slate-800">{recommended} <span className="text-sm font-normal">mm² (Cu)</span></p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-amber-600 font-medium">Actual Voltage Drop</p>
          <p className="text-2xl font-bold text-amber-800">{actualDrop.toFixed(2)} <span className="text-sm font-normal">V ({(actualDrop/V*100).toFixed(2)}%)</span></p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700 mb-1">Formula (Copper Conductor)</p>
        <p>Size = (2 × L × I × ρ) / V<sub>drop</sub> &nbsp;|&nbsp; ρ = 0.0175 Ω·mm²/m &nbsp;|&nbsp; V<sub>drop</sub> = V<sub>supply</sub> × Drop%</p>
      </div>
    </div>
  )
}

function WindLoadCalculator() {
  const [windZone, setWindZone] = useState('2')
  const [height, setHeight] = useState('10')
  const [terrainCategory, setTerrainCategory] = useState('2')
  const [importanceFactor, setImportanceFactor] = useState('1.0')
  const [gustFactor, setGustFactor] = useState('1.0')

  const Vb = parseFloat(windZone) * 10
  const h = parseFloat(height) || 10
  const tc = parseInt(terrainCategory) || 2
  const k1 = parseFloat(importanceFactor) || 1.0
  const k3 = parseFloat(gustFactor) || 1.0

  const terrainFactors: Record<number, { k2: number[] }> = {
    1: { k2: [1.05, 1.05, 1.05, 1.05, 1.05, 1.05] },
    2: { k2: [0.91, 0.91, 1.00, 1.05, 1.12, 1.17] },
    3: { k2: [0.75, 0.75, 0.85, 0.95, 1.05, 1.11] },
    4: { k2: [0.62, 0.62, 0.73, 0.84, 0.96, 1.03] },
  }

  const heightBreakpoints = [0, 10, 15, 20, 30, 50, 100]
  let k2Index = 0
  for (let i = 1; i < heightBreakpoints.length; i++) {
    if (h >= heightBreakpoints[i - 1] && h < heightBreakpoints[i]) {
      k2Index = i - 1
      break
    }
    if (h >= heightBreakpoints[i - 1]) k2Index = i - 1
  }

  const k2 = terrainFactors[tc]?.k2[k2Index] || 1.0
  const designWindPressure = 0.6 * Vb * Vb * k1 * k2 * k3
  const peakVelocity = Math.sqrt(designWindPressure / 0.6)

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-sm text-purple-800">
        <p className="font-medium">IS 875 (Part 3) — Design Wind Pressure</p>
        <p className="text-purple-600 mt-1">P<sub>z</sub> = 0.6 × V<sub>b</sub>² × k₁ × k₂ × k₃ (N/m²)</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Wind Zone</label>
          <select value={windZone} onChange={e => setWindZone(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            {[1,2,3,4,5].map(z => <option key={z} value={z}>Zone {z} ({z*10} m/s)</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Height (m)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} min="1" step="5"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Terrain Category</label>
          <select value={terrainCategory} onChange={e => setTerrainCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="1">Cat 1 — Open sea</option>
            <option value="2">Cat 2 — Open terrain</option>
            <option value="3">Cat 3 — Urban/suburban</option>
            <option value="4">Cat 4 — Dense urban</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">k₁ (Importance)</label>
          <select value={importanceFactor} onChange={e => setImportanceFactor(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="1.0">1.0 — General</option>
            <option value="1.08">1.08 — Important</option>
            <option value="1.15">1.15 — Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">k₃ (Gust)</label>
          <select value={gustFactor} onChange={e => setGustFactor(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="1.0">1.0 — No gust</option>
            <option value="1.05">1.05 — Low gust</option>
            <option value="1.10">1.10 — High gust</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-600 font-medium">Basic Wind Speed</p>
          <p className="text-2xl font-bold text-blue-800">{Vb} <span className="text-sm font-normal">m/s</span></p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-purple-600 font-medium">k₂ Factor</p>
          <p className="text-2xl font-bold text-purple-800">{k2.toFixed(2)}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-amber-600 font-medium">Design Pressure</p>
          <p className="text-2xl font-bold text-amber-800">{designWindPressure.toFixed(1)} <span className="text-sm font-normal">N/m²</span></p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-green-600 font-medium">Peak Velocity Pressure</p>
          <p className="text-2xl font-bold text-green-800">{peakVelocity.toFixed(1)} <span className="text-sm font-normal">Pa</span></p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-700 mb-1">IS 875 (Part 3:2015) Formula</p>
        <p>P<sub>z</sub> = 0.6 × V<sub>b</sub>² × k₁ × k₂ × k₃ — where V<sub>b</sub> = basic wind speed, k₁ = probability factor, k₂ = terrain/height factor, k₃ = gust factor</p>
      </div>
    </div>
  )
}

function PdfMergeTool() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [merging, setMerging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const imageFiles = selected.filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      toast.error('Please select image files (JPG, PNG, etc.)')
      return
    }
    setFiles(prev => [...prev, ...imageFiles])
    imageFiles.forEach(f => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPreviews(prev => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(f)
    })
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const mergeToPdf = async () => {
    if (files.length === 0) return
    setMerging(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 10
      const usableWidth = pageWidth - 2 * margin
      const usableHeight = pageHeight - 2 * margin

      for (let i = 0; i < files.length; i++) {
        if (i > 0) pdf.addPage()
        const imgData = previews[i]
        const img = new Image()
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const ratio = Math.min(usableWidth / img.width, usableHeight / img.height)
            const w = img.width * ratio
            const h = img.height * ratio
            const x = margin + (usableWidth - w) / 2
            const y = margin + (usableHeight - h) / 2
            pdf.addImage(imgData, 'JPEG', x, y, w, h)
            resolve()
          }
          img.src = imgData
        })
      }

      pdf.save('merged-report.pdf')
      toast.success(`PDF created with ${files.length} page(s)`)
    } catch {
      toast.error('Failed to create PDF')
    } finally {
      setMerging(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-blue-400/50 transition-all duration-200 cursor-pointer"
        onClick={() => inputRef.current?.click()}>
        <FileImage className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-600 mb-1">Click to select images or drag & drop</p>
        <p className="text-xs text-slate-400">Supports JPG, PNG, WebP — will be merged into a single PDF</p>
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFiles} />
      </div>

      {files.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} alt={`Page ${i + 1}`} className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button onClick={() => removeFile(i)} className="bg-white text-red-600 text-xs px-3 py-1 rounded-lg font-medium">Remove</button>
                </div>
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Page {i + 1}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{files.length} image(s) selected</p>
            <button onClick={mergeToPdf} disabled={merging}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50">
              <Download className="h-4 w-4" />
              {merging ? 'Creating PDF...' : 'Merge to PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Tools() {
  const [active, setActive] = useState<ToolId>(null)
  const selected = tools.find(t => t.id === active)

  if (active && selected) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => setActive(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Back to Tools
        </button>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', selected.color)}>
              <selected.icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{selected.name}</h2>
              <p className="text-sm text-slate-500">{selected.desc}</p>
            </div>
          </div>
          {active === 'steel' && <SteelCalculator />}
          {active === 'solar' && <SolarCalculator />}
          {active === 'cable' && <CableCalculator />}
          {active === 'wind' && <WindLoadCalculator />}
          {active === 'pdfmerge' && <PdfMergeTool />}
          {active === 'structure' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                <Building2 className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Structure Load Estimator</h3>
              <p className="text-slate-500 mb-4 max-w-md">Calculate total dead load + wind load on mounting structures.</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Coming Soon
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Engineering Tools</h1>
        <p className="text-sm text-slate-500 mt-1">Quick calculators for solar design and structural estimation</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <button key={tool.id} onClick={() => tool.status === 'live' && setActive(tool.id)}
            className={clsx(
              'bg-white rounded-2xl border border-slate-200 p-6 text-left transition-all duration-200',
              tool.status === 'live' ? 'hover:shadow-md cursor-pointer' : 'opacity-75 cursor-default'
            )}>
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', tool.color)}>
              <tool.icon className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{tool.name}</h3>
            <p className="text-sm text-slate-500 mb-3">{tool.desc}</p>
            {tool.status === 'live' ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                <Calculator className="h-3 w-3" /> Open Calculator
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Coming Soon
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
