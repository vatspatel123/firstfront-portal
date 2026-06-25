import { useState } from 'react'
import { ArrowLeft, Calculator, Info, Weight, Sun, Cable, Wind, Building2 } from 'lucide-react'
import { clsx } from 'clsx'

type ToolId = 'steel' | 'solar' | 'cable' | 'wind' | 'structure' | null

const tools = [
  { id: 'steel' as ToolId, name: 'Steel Weight Calculator', desc: 'Calculate steel weight for mounting structures', icon: Weight, status: 'live', color: 'bg-blue-50 text-blue-600' },
  { id: 'solar' as ToolId, name: 'Solar Capacity Calculator', desc: 'Estimate system size from roof area', icon: Sun, status: 'live', color: 'bg-amber-50 text-amber-600' },
  { id: 'cable' as ToolId, name: 'Cable Size Calculator', desc: 'Determine cable size with voltage drop', icon: Cable, status: 'live', color: 'bg-green-50 text-green-600' },
  { id: 'wind' as ToolId, name: 'Wind Load Calculator', desc: 'STAAD wind pressure analysis', icon: Wind, status: 'coming', color: 'bg-purple-50 text-purple-600' },
  { id: 'structure' as ToolId, name: 'Structure Load Estimator', desc: 'Total structure load with panel + wind', icon: Building2, status: 'coming', color: 'bg-rose-50 text-rose-600' },
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

function ComingSoon({ name, desc, icon: Icon }: { name: string; desc: string; icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <Icon className="h-10 w-10 text-slate-300" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{name}</h3>
      <p className="text-slate-500 mb-4 max-w-md">{desc}</p>
      <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        Coming Soon
      </span>
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
          {active === 'wind' && <ComingSoon name={selected.name} desc="Wind pressure calculations per IS 875 for STAAD Pro structural analysis. Supports terrain categories, height factors, and gust effects." icon={selected.icon} />}
          {active === 'structure' && <ComingSoon name={selected.name} desc="Calculate total dead load + wind load on mounting structures. Includes panel weight, rail weight, and safety factors." icon={selected.icon} />}
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
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">More tools coming soon</p>
          <p className="text-blue-600 mt-1">Wind Load Calculator for STAAD Pro and Structure Load Estimator are under development. These will support IS 875 standards and automated structure sizing.</p>
        </div>
      </div>
    </div>
  )
}
