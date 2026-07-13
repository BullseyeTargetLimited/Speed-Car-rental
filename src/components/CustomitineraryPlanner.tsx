import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Leaf, 
  Users, 
  ShieldCheck, 
  Flame, 
  ChevronRight, 
  Sparkles, 
  RefreshCw, 
  Send,
  HelpCircle,
  Clock,
  Heart
} from 'lucide-react';
import { Language } from '../types';

interface CustomitineraryPlannerProps {
  lang: Language;
  addNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
}

interface CustomRequest {
  id: string;
  name: string;
  destinations: string[];
  travelers: number;
  duration: number;
  style: string;
  status: 'Received' | 'Consultant Assigned' | 'Guide Matched' | 'Equipped' | 'Dispatched';
  assignedConsultant: string;
  assignedGuide: string;
  co2OffsetKg: number;
  bedouinDirectAidOmr: number;
  localGuideHours: number;
  currentLog: string;
}

export default function CustomitineraryPlanner({ lang, addNotification }: CustomitineraryPlannerProps) {
  const [destinations, setDestinations] = useState<string[]>(['Jebel Shams', 'Wahiba Sands']);
  const [travelers, setTravelers] = useState<number>(2);
  const [duration, setDuration] = useState<number>(5);
  const [style, setStyle] = useState<string>('Wild Camping');
  const [guidePreferred, setGuidePreferred] = useState<boolean>(true);
  const [customNotes, setCustomNotes] = useState<string>('');
  
  // Custom requests managed in the session
  const [activeRequests, setActiveRequests] = useState<CustomRequest[]>([
    {
      id: 'REQ-4819',
      name: 'Dr. Amjad Al-Busaidi - Nizwa & Desert Expedition',
      destinations: ['Nizwa', 'Wahiba Sands'],
      travelers: 2,
      duration: 5,
      style: 'Glamping & Culture',
      status: 'Guide Matched',
      assignedConsultant: 'Azaan Al-Rawahi',
      assignedGuide: 'Salim Al-Wahibi (Bedouin Specialist)',
      co2OffsetKg: 280,
      bedouinDirectAidOmr: 45.0,
      localGuideHours: 40,
      currentLog: 'Assigned Salem Al-Wahibi to lead deep sand dunes crossing. Landcruiser roof tent fitted.'
    }
  ]);

  const allDestinations = [
    { name: 'Jebel Shams', desc: 'Dramatic canyons, cooler alpine heights' },
    { name: 'Wahiba Sands', desc: 'Majestic golden dunes, bedouin heritage' },
    { name: 'Nizwa Fort', desc: 'Ancient clay castle, souqs & history' },
    { name: 'Wadi Shab', desc: 'Lime-gorge emerald swimming oases' },
    { name: 'Salalah (Khareef)', desc: 'Misty tropical waterfalls (Southern region)' },
    { name: 'Sur Coastal Basin', desc: 'Sea turtle nesting sanctuaries' }
  ];

  const handleToggleDest = (name: string) => {
    setDestinations(prev => 
      prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]
    );
  };

  // SightsTours style impact calculator
  const calculateImpact = () => {
    const baseCo2PerDay = 18.5; // kg of CO2 per day for standard overland 4x4
    const guideHoursPerDay = guidePreferred ? 8 : 0;
    const directAidPerDay = style === 'Wild Camping' ? 5 : 12; // OMR given directly to mountain/desert communities

    const co2OffsetKg = Math.round(baseCo2PerDay * duration * (travelers / 2));
    const localGuideHours = guideHoursPerDay * duration;
    const bedouinDirectAidOmr = directAidPerDay * duration;

    return {
      co2OffsetKg,
      localGuideHours,
      bedouinDirectAidOmr,
      equivalentGhafTrees: Math.ceil(co2OffsetKg / 22), // 1 Ghaf tree offsets approx 22kg/year
    };
  };

  const impact = calculateImpact();

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (destinations.length === 0) {
      addNotification('⚠️ Select Destinations', 'Please choose at least one scenic destination for your route!', 'warning');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newReq: CustomRequest = {
      id: `REQ-${randomNum}`,
      name: `Custom Oman ${style} (${destinations.join(' & ')})`,
      destinations: [...destinations],
      travelers,
      duration,
      style,
      status: 'Received',
      assignedConsultant: 'Azaan Al-Rawahi',
      assignedGuide: guidePreferred ? 'Yousef Al-Balushi (Cultural Naturalist)' : 'Self-Drive Solo Nav',
      co2OffsetKg: impact.co2OffsetKg,
      bedouinDirectAidOmr: impact.bedouinDirectAidOmr,
      localGuideHours: impact.localGuideHours,
      currentLog: 'Custom request received at Muscat HQ. Initializing route clearance & guide roster check.'
    };

    setActiveRequests(prev => [newReq, ...prev]);
    addNotification(
      '🌟 Sightseeing Request Logged!',
      `Your customized itinerary inquiry #${newReq.id} was dispatched. Watch the tracker below to see how our team manages it!`,
      'success'
    );
  };

  // Simulating request progress (Muscat HQ managing state)
  const handleSimulateProgress = (reqId: string) => {
    setActiveRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      
      let nextStatus = r.status;
      let log = r.currentLog;
      
      if (r.status === 'Received') {
        nextStatus = 'Consultant Assigned';
        log = 'Matched with Azaan Al-Rawahi. Reviewing weather reports for Jabal Akhdar canyon tracks.';
      } else if (r.status === 'Consultant Assigned') {
        nextStatus = 'Guide Matched';
        log = 'Allocated Omani Certified Guide. Standard safety transponder activated.';
      } else if (r.status === 'Guide Matched') {
        nextStatus = 'Equipped';
        log = 'Expedition vehicle prepped: Hardshell rooftop tent sanitized, dual-zone cool box stocked.';
      } else if (r.status === 'Equipped') {
        nextStatus = 'Dispatched';
        log = 'Cleared for dispatch! Handover checklist dispatched to airport meet-&-greet team.';
      } else {
        nextStatus = 'Received';
        log = 'Recycled simulation: inquiry reset to received stage.';
      }

      addNotification(`📦 State Updated #${reqId}`, `Status changed to: ${nextStatus}`, 'info');

      return {
        ...r,
        status: nextStatus,
        currentLog: log
      };
    }));
  };

  return (
    <div className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl p-5 md:p-8 shadow-sm space-y-8 text-stone-800 animate-fade-in">
      
      {/* Header with visual introduction */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start border-b border-stone-200 pb-5">
        <div className="space-y-1.5 flex-1">
          <span className="text-xs font-mono text-[#2D7A82] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-[#C47E5A] animate-spin-slow" /> Inspired by Sights Tours Oman
          </span>
          <h3 className="text-2xl font-black text-stone-900 font-display">
            Custom Wilderness Expedition Planner
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
            Design your ideal multi-day journey into the absolute quiet of Oman's canyons and golden dunes. Tell us what you want to see, and watch our Muscat fleet HQ manage all logistical steps in real-time.
          </p>
        </div>

        {/* Heritage Trust Badge */}
        <div className="bg-[#FAF0E6] border border-[#ECD7C0] rounded-xl p-3.5 flex items-center gap-3 shrink-0 lg:max-w-xs">
          <div className="h-9 w-9 rounded-full bg-[#C47E5A] text-white flex items-center justify-center font-bold">
            <Heart className="h-4 w-4 fill-current text-white" />
          </div>
          <div>
            <span className="text-[10px] text-[#C47E5A] font-mono uppercase block font-black">Sights Eco-Impact</span>
            <p className="text-[11px] text-stone-700 leading-tight">
              100% Carbon Offset program & Direct Aid for Omani local rural guide cooperatives.
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Planner Form */}
        <form onSubmit={handleSubmitRequest} className="lg:col-span-7 space-y-6 bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
          <h4 className="text-sm font-extrabold text-stone-950 font-display flex items-center gap-1.5 border-b border-stone-100 pb-2.5">
            <Sparkles className="text-[#2D7A82] h-4 w-4" /> 1. Sketch Your Route & Style
          </h4>

          {/* Destinations Grid Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block font-bold">
              Scenic Escaping Spots (Select Multiples)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allDestinations.map(d => {
                const isSelected = destinations.includes(d.name);
                return (
                  <button
                    type="button"
                    key={d.name}
                    onClick={() => handleToggleDest(d.name)}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer flex items-start gap-2.5 ${
                      isSelected 
                        ? 'bg-[#EBF5F6] border-[#2D7A82] text-[#1F5F66] ring-1 ring-[#2D7A82]/50'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200/80 text-stone-700'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => {}} // Controlled by button click
                      className="mt-0.5 accent-[#2D7A82] shrink-0 pointer-events-none" 
                    />
                    <div>
                      <p className="text-xs font-bold leading-tight">{d.name}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">{d.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block mb-1.5 font-bold">
                Expedition Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full text-xs font-semibold bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:border-[#2D7A82] transition"
              >
                <option value="Wild Camping">Wild Camping (Rooftop Tent 4x4)</option>
                <option value="Glamping & Culture">Luxury Glamping & Historical Forts</option>
                <option value="Trekking Lodge">Alpine Canyons Trekking Lodges</option>
                <option value="Solo Overland">Self-Drive Pure Desolate Trails</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block mb-1.5 font-bold">
                Travelers & Days
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2 py-1">
                  <Users className="h-3.5 w-3.5 text-stone-400 mr-1.5" />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={travelers}
                    onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                    className="w-full bg-transparent text-xs font-bold outline-none text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400 font-bold shrink-0 ml-1">Pax</span>
                </div>
                <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2 py-1">
                  <Clock className="h-3.5 w-3.5 text-stone-400 mr-1.5" />
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 2)}
                    className="w-full bg-transparent text-xs font-bold outline-none text-stone-800"
                  />
                  <span className="text-[10px] text-stone-400 font-bold shrink-0 ml-1">Days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guide selection */}
          <div className="flex items-center justify-between bg-stone-50 p-3 rounded-lg border border-stone-200/60">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-stone-900">Include Certified Omani Local Guide</p>
              <p className="text-[10px] text-stone-500">Native guides directly supporting isolated bedouin encampments</p>
            </div>
            <input 
              type="checkbox"
              checked={guidePreferred}
              onChange={(e) => setGuidePreferred(e.target.checked)}
              className="h-4 w-4 accent-[#2D7A82] cursor-pointer"
            />
          </div>

          {/* Custom specifications notes */}
          <div>
            <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block mb-1.5 font-bold">
              Special Wilderness Requests
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Include specific coffee brewing pots, sleeping bag parameters, or airport arrivals details..."
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 outline-none focus:border-[#2D7A82] placeholder-stone-400 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D7A82] hover:bg-[#1F5F66] text-white font-bold text-xs py-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-teal-700/10"
          >
            <Send className="h-3.5 w-3.5" /> Dispatch Custom Expedition Inquiry
          </button>
        </form>

        {/* Right Side: Impact Statement & Active Requests managed list */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* SightsTours Inspired Real Impact Indicator */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-mono text-stone-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <Leaf className="text-emerald-600 h-4 w-4" /> 2. Environmental & Local Impact HUD
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-extrabold text-stone-900">CO2 Offsetting Certificate</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Portion of fees funded to plant local desert flora
                  </p>
                </div>
                <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold px-2 py-0.5 rounded">
                  {impact.co2OffsetKg} kg Offset
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-extrabold text-stone-900">Direct Bedouin & Mountain Aid</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Funding distributed direct to rural campsite hosts
                  </p>
                </div>
                <span className="text-xs font-mono bg-[#FAF0E6] text-[#C47E5A] border border-amber-100 font-extrabold px-2 py-0.5 rounded">
                  {impact.bedouinDirectAidOmr.toFixed(1)} OMR
                </span>
              </div>

              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-extrabold text-stone-900">Omani Youth Employment Hours</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Guaranteed wage hours for young certified guides
                  </p>
                </div>
                <span className="text-xs font-mono bg-blue-50 text-blue-800 border border-blue-100 font-extrabold px-2 py-0.5 rounded">
                  {impact.localGuideHours} Hrs Work
                </span>
              </div>
            </div>

            {/* Impact Metric Callout */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-3 flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <p className="text-[10.5px] text-stone-700 leading-relaxed">
                By embarking on this {duration}-day expedition, you fund the planting of <strong className="text-emerald-700">{impact.equivalentGhafTrees} Ghaf trees</strong> in the Sultanate’s national reserves, effectively carbon-neutralizing your full overland kilometers!
              </p>
            </div>
          </div>

          {/* How It is Managed: Operations Terminal */}
          <div className="bg-stone-900 text-stone-100 border border-stone-800 rounded-xl p-5 space-y-4 shadow-md relative">
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-mono text-teal-400 font-extrabold uppercase tracking-widest block">
                3. Operations Hub: How Request is Managed
              </h4>
              <p className="text-[10px] text-stone-400 leading-tight">
                Watch our Muscat fleet operations team action custom route logistics in real-time.
              </p>
            </div>

            {/* Managed requests loop */}
            <div className="space-y-4">
              {activeRequests.map(r => (
                <div key={r.id} className="bg-stone-950 rounded-lg p-3.5 border border-stone-800 space-y-3.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-stone-400 font-bold">{r.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase ${
                      r.status === 'Received' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      r.status === 'Consultant Assigned' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                      r.status === 'Guide Matched' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                      r.status === 'Equipped' ? 'bg-teal-950 text-teal-400 border border-teal-800' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  {/* Visual Stepper */}
                  <div className="flex items-center justify-between text-[8px] font-mono text-stone-500 border-t border-b border-stone-900 py-1.5">
                    <span className={r.status !== 'Received' ? 'text-teal-400 font-bold' : 'text-stone-500'}>1. Received</span>
                    <ChevronRight className="h-2.5 w-2.5 text-stone-700" />
                    <span className={['Consultant Assigned', 'Guide Matched', 'Equipped', 'Dispatched'].includes(r.status) ? 'text-teal-400 font-bold' : 'text-stone-500'}>2. Matched</span>
                    <ChevronRight className="h-2.5 w-2.5 text-stone-700" />
                    <span className={['Guide Matched', 'Equipped', 'Dispatched'].includes(r.status) ? 'text-teal-400 font-bold' : 'text-stone-500'}>3. Guided</span>
                    <ChevronRight className="h-2.5 w-2.5 text-stone-700" />
                    <span className={['Equipped', 'Dispatched'].includes(r.status) ? 'text-teal-400 font-bold' : 'text-stone-500'}>4. Equipped</span>
                    <ChevronRight className="h-2.5 w-2.5 text-stone-700" />
                    <span className={r.status === 'Dispatched' ? 'text-emerald-400 font-bold' : 'text-stone-500'}>5. Go</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-mono">Assigned Admin:</span>
                      <span className="text-stone-300 font-semibold">{r.assignedConsultant}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-mono">Wilderness Guide:</span>
                      <span className="text-stone-300 font-semibold">{r.assignedGuide}</span>
                    </div>
                    <div className="mt-2 bg-stone-900 rounded p-2 border border-stone-850">
                      <span className="text-[9px] font-mono text-teal-400 block uppercase tracking-wider font-bold">Latest Operational Update:</span>
                      <p className="text-[11px] text-stone-200 mt-0.5 leading-relaxed font-mono">"{r.currentLog}"</p>
                    </div>
                  </div>

                  {/* Simulator Trigger */}
                  <button
                    type="button"
                    onClick={() => handleSimulateProgress(r.id)}
                    className="w-full bg-stone-800 hover:bg-stone-700 text-teal-400 text-[10px] font-mono font-bold py-1.5 rounded border border-stone-700 flex items-center justify-center gap-1 cursor-pointer transition"
                  >
                    <RefreshCw className="h-3 w-3 animate-spin-slow" /> Advance Logistics Stage
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
