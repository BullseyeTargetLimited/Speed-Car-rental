import React, { useState } from 'react';
import { 
  Car, 
  Check, 
  HelpCircle, 
  TrendingDown, 
  Sparkles, 
  Info, 
  ShieldCheck, 
  ArrowRight, 
  MessageCircle,
  Percent
} from 'lucide-react';
import { VEHICLES } from '../data';
import { Language } from '../types';

interface PriceComparisonProps {
  lang: Language;
  onSelectVehicle: (id: string) => void;
}

export default function PriceComparison({ lang, onSelectVehicle }: PriceComparisonProps) {
  const [selectedCategory, setSelectedCategory] = useState<'4WD' | 'SUV' | 'Sedan'>('4WD');
  const [days, setDays] = useState<number>(7);

  // Realistic average competitor rates in OMR for July 2026
  const competitorData = {
    '4WD': {
      speed: 42.5,
      zahara: 54.0,
      europcar: 58.5,
      budget: 52.0,
      hertz: 61.0,
      representative: 'Toyota Landcruiser V8 or Mitsubishi Pajero 4WD'
    },
    'SUV': {
      speed: 21.0,
      zahara: 29.5,
      europcar: 32.0,
      budget: 27.5,
      hertz: 34.0,
      representative: 'Kia Sportage or Haval H9 family SUV'
    },
    'Sedan': {
      speed: 11.5,
      zahara: 16.5,
      europcar: 18.0,
      budget: 15.0,
      hertz: 19.5,
      representative: 'Hyundai Accent or Changan Alsvin Sedan'
    }
  };

  const activeCategoryData = competitorData[selectedCategory];

  // Dynamic calculations
  const speedTotal = activeCategoryData.speed * days;
  const averageCompetitorRate = (activeCategoryData.zahara + activeCategoryData.europcar + activeCategoryData.budget + activeCategoryData.hertz) / 4;
  const competitorTotalAvg = averageCompetitorRate * days;
  const totalSavings = competitorTotalAvg - speedTotal;
  const savingsPercent = Math.round((totalSavings / competitorTotalAvg) * 100);

  // Find corresponding vehicle from VEHICLES array
  const matchedVehicles = VEHICLES.filter(v => {
    if (selectedCategory === '4WD') return v.category === '4WD' || v.category === 'Premium' && v.seats >= 7;
    if (selectedCategory === 'SUV') return v.category === 'SUV';
    return v.category === 'Sedan';
  });

  return (
    <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-5 md:p-8 shadow-sm space-y-8 text-stone-800 animate-fade-in">
      
      {/* Header and Value Proposition */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="space-y-1.5">
          <span className="text-xs font-mono text-[#2D7A82] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Direct Omani Market Intelligence
          </span>
          <h3 className="text-2xl font-black text-stone-900 font-display">
            Transparent Pricing Comparison
          </h3>
          <p className="text-xs text-stone-600 max-w-xl">
            Inspired by Zahara Tours and international Omani providers, we compare our direct rates transparently. Zero airport surcharge, zero hidden mileage limits, and complimentary camping prep.
          </p>
        </div>

        {/* Live Saving Callout */}
        <div className="bg-[#EBF5F6] border border-[#BCE1E5] rounded-xl p-4 flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 bg-[#2D7A82] text-white rounded-full flex items-center justify-center font-bold">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-500 font-mono uppercase block font-bold">SPEED Average Advantage</span>
            <p className="text-sm font-extrabold text-[#1F5F66] flex items-center gap-1">
              Save {savingsPercent}% Over Airport Desks
            </p>
          </div>
        </div>
      </div>

      {/* Select category and slider */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Selection Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block mb-2 font-bold">
              1. Select Vehicle Class
            </label>
            <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-xl">
              {(['4WD', 'SUV', 'Sedan'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-[#2D7A82] text-white shadow'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {cat === '4WD' ? 'Wild 4x4' : cat === 'SUV' ? 'Mid SUV' : 'Eco Sedan'}
                </button>
              ))}
            </div>
            <p className="text-[10.5px] text-stone-500 font-mono mt-2 italic text-center">
              Sample Class: {activeCategoryData.representative}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block font-bold">
                2. Rental Lease Duration
              </label>
              <span className="text-xs font-extrabold text-[#2D7A82] font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                {days} Days
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#2D7A82]"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>1 Day</span>
              <span>15 Days</span>
              <span>30 Days (Monthly Lease)</span>
            </div>
          </div>

          {/* Quick Savings Card */}
          <div className="bg-[#FAF5EE] border border-[#E9D9C3] rounded-xl p-4 space-y-2.5">
            <span className="text-[10px] font-mono text-[#C47E5A] font-black uppercase tracking-wider block">
              Estimated Net Cash Savings
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#C47E5A] font-display">
                {totalSavings.toFixed(1)} OMR
              </span>
              <span className="text-xs text-stone-500">
                (~{(totalSavings * 2.6).toFixed(0)} USD)
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              That's enough saved to fully cover premium Jebel Shams mountain camping gear or 3 extra nights of wild desert overlanding guides!
            </p>
          </div>
        </div>

        {/* Visual Pricing Chart */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-xl p-5 md:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h4 className="text-xs font-mono text-stone-500 uppercase font-bold">
              Comparison: Base Daily Rate (OMR / Day)
            </h4>
            <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded font-mono text-stone-500">
              Rates Verified July 2026
            </span>
          </div>

          {/* Side-by-side bar chart */}
          <div className="space-y-4">
            
            {/* SPEED (Our rate) */}
            <div className="space-y-1.5 group">
              <div className="flex justify-between text-xs">
                <span className="font-extrabold text-stone-900 flex items-center gap-1.5">
                  🛡️ SPEED Adventure Rental
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-mono px-1.5 rounded font-bold uppercase">
                    Guaranteed Low Price
                  </span>
                </span>
                <span className="font-extrabold text-[#2D7A82]">{activeCategoryData.speed.toFixed(1)} OMR/Day</span>
              </div>
              <div className="h-6 bg-stone-100 rounded-md overflow-hidden relative border border-stone-200/40">
                <div 
                  className="h-full bg-gradient-to-r from-[#2D7A82] to-[#3B9EA8] transition-all duration-500 rounded-r-md flex items-center pl-3"
                  style={{ width: `${(activeCategoryData.speed / 65) * 100}%` }}
                >
                  <span className="text-[10px] text-white font-bold font-mono">Us</span>
                </div>
              </div>
            </div>

            {/* Zahara Tours */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Zahara Tours Oman (Car Rent division)</span>
                <span>{activeCategoryData.zahara.toFixed(1)} OMR/Day</span>
              </div>
              <div className="h-4 bg-stone-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-stone-400 transition-all duration-500 rounded-r"
                  style={{ width: `${(activeCategoryData.zahara / 65) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Europcar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Europcar Oman (Airport Rates)</span>
                <span>{activeCategoryData.europcar.toFixed(1)} OMR/Day</span>
              </div>
              <div className="h-4 bg-stone-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-stone-400 transition-all duration-500 rounded-r"
                  style={{ width: `${(activeCategoryData.europcar / 65) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Budget Car Rental Oman</span>
                <span>{activeCategoryData.budget.toFixed(1)} OMR/Day</span>
              </div>
              <div className="h-4 bg-stone-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-stone-400 transition-all duration-500 rounded-r"
                  style={{ width: `${(activeCategoryData.budget / 65) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Hertz */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Hertz Oman Airport Desk</span>
                <span>{activeCategoryData.hertz.toFixed(1)} OMR/Day</span>
              </div>
              <div className="h-4 bg-stone-100 rounded overflow-hidden">
                <div 
                  className="h-full bg-stone-400 transition-all duration-500 rounded-r"
                  style={{ width: `${(activeCategoryData.hertz / 65) * 100}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* Pricing Inclusions Checkmarks */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Full CDW Theft Cover & basic insurance included</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Unlimited Kilometers for mountain tracks</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Free airport or hotel delivery anywhere in Muscat</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Hardshell rooftop tent compatible fleet (SPEED exclusive)</span>
            </div>
          </div>

        </div>

      </div>

      {/* Interactive Selection Guide from the Matched Fleet */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-stone-900 font-display">
            Recommended Active Fleet Options for Your Class
          </h4>
          <span className="text-xs text-stone-500">Based on standard occupancy & wilderness rating</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matchedVehicles.slice(0, 3).map(v => (
            <div 
              key={v.id}
              className="bg-white border border-stone-200 hover:border-[#2D7A82] rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group transition"
            >
              <div className="h-32 overflow-hidden relative bg-stone-100">
                <img 
                  src={v.image} 
                  alt={`${v.manufacturer} ${v.make}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 right-2 bg-stone-900/85 text-white font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase">
                  {v.category}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h5 className="text-xs text-stone-400 font-mono font-bold uppercase">{v.manufacturer}</h5>
                  <h4 className="text-sm font-extrabold text-stone-900 mt-0.5">{v.make} ({v.seats} Seats)</h4>
                </div>
                
                <div className="flex justify-between items-center text-xs border-t border-stone-100 pt-2.5">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">OUR RATE</span>
                    <span className="text-sm font-bold text-[#2D7A82]">{v.pricePerDay} OMR <span className="text-[10px] font-normal text-stone-500">/day</span></span>
                  </div>
                  <button
                    onClick={() => onSelectVehicle(v.id)}
                    className="bg-[#2D7A82] hover:bg-[#1F5F66] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    Select vehicle <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
