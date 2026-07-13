import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Truck, Play, RefreshCw, Star, Phone, CheckCircle, Navigation, ExternalLink } from 'lucide-react';
import { TRANSLATIONS } from '../data';

interface OmanMapSimulatorProps {
  lang: 'en' | 'ar' | 'fr';
  pickupLocation: string;
  onSimulationComplete?: () => void;
}

export default function OmanMapSimulator({ lang, pickupLocation, onSimulationComplete }: OmanMapSimulatorProps) {
  const t = TRANSLATIONS[lang];
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
  const [driverMessage, setDriverMessage] = useState('');
  
  // Quick Post-Delivery Review states
  const [miniRating, setMiniRating] = useState(5);
  const [miniText, setMiniText] = useState('Outstanding delivery service by Azaan! The vehicle arrived in pristine condition right to my location, fully equipped for our Oman adventure.');
  const [copiedMini, setCopiedMini] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);

  // Landmark coordinates in our custom grid (X: 0-400, Y: 0-300)
  const landmarks = [
    { name: 'Sohar', x: 80, y: 60 },
    { name: 'Muscat (HQ)', x: 190, y: 110, isHQ: true },
    { name: 'Nizwa', x: 150, y: 160 },
    { name: 'Jebel Shams', x: 110, y: 150 },
    { name: 'Sur', x: 290, y: 160 },
    { name: 'Wahiba Sands', x: 240, y: 210 },
    { name: 'Salalah', x: 60, y: 270 }
  ];

  // Map pickup location string to nearest landmark
  const getDestinationLandmark = () => {
    const loc = pickupLocation.toLowerCase();
    if (loc.includes('salalah')) return landmarks[6]; // Salalah
    if (loc.includes('nizwa')) return landmarks[2]; // Nizwa
    if (loc.includes('sohar')) return landmarks[0]; // Sohar
    if (loc.includes('sur')) return landmarks[4]; // Sur
    if (loc.includes('jebel')) return landmarks[3]; // Jebel Shams
    return landmarks[1]; // Muscat
  };

  const destination = getDestinationLandmark();
  const startPoint = landmarks[1]; // Always starts from Muscat HQ

  // Current animated coordinates of the car
  const currentX = startPoint.x + (destination.x - startPoint.x) * (progress / 100);
  const currentY = startPoint.y + (destination.y - startPoint.y) * (progress / 100);

  const trackingLogs = [
    t.trackingLogs.ready,
    t.trackingLogs.loaded,
    t.trackingLogs.departed,
    t.trackingLogs.nearby,
    t.trackingLogs.completed
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 5;
          if (next >= 100) {
            setIsRunning(false);
            if (onSimulationComplete) onSimulationComplete();
            return 100;
          }
          return next;
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isRunning, progress]);

  // Sync log message and status index with progress percentage
  useEffect(() => {
    if (progress === 0) {
      setCurrentStatusIndex(0);
    } else if (progress < 25) {
      setCurrentStatusIndex(1);
    } else if (progress < 60) {
      setCurrentStatusIndex(2);
    } else if (progress < 90) {
      setCurrentStatusIndex(3);
    } else {
      setCurrentStatusIndex(4);
    }
  }, [progress]);

  const handleStartSimulation = () => {
    setProgress(0);
    setIsRunning(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="text-[#4B9CB5] h-5 w-5 animate-pulse" />
            {t.trackingTitle}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Simulated dispatch from Muscat HQ (Al Khuwair) to: <span className="text-teal-400 font-medium">{pickupLocation}</span>
          </p>
        </div>
        <button
          onClick={handleStartSimulation}
          disabled={isRunning}
          className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            isRunning
              ? 'bg-slate-800 text-slate-500 border border-slate-700'
              : 'bg-teal-500 hover:bg-teal-600 text-slate-950 shadow-md shadow-teal-500/10'
          }`}
        >
          {progress > 0 ? (
            <>
              <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
              Re-simulate Delivery
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              Start Live Tracker
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Simulated Map Grid */}
        <div className="lg:col-span-2 relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden h-72 md:h-80 select-none">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

          {/* Compass Rose */}
          <div className="absolute top-3 right-3 opacity-30 flex flex-col items-center">
            <Compass className="h-8 w-8 text-teal-400 animate-spin-slow" />
            <span className="text-[9px] font-mono mt-1">N</span>
          </div>

          <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
            {/* Outline of Oman's coastline (Simulated visual path) */}
            <path
              d="M 50,50 Q 150,20 220,90 T 320,150 T 260,250 T 120,220 T 50,250 Z"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Path from Muscat HQ to destination */}
            {progress > 0 && (
              <line
                x1={startPoint.x}
                y1={startPoint.y}
                x2={destination.x}
                y2={destination.y}
                stroke="#14b8a6"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                className="opacity-50"
              />
            )}

            {/* Landmarks Pins */}
            {landmarks.map((l) => {
              const isSelectedDest = l.name === destination.name;
              return (
                <g key={l.name} transform={`translate(${l.x}, ${l.y})`}>
                  <circle
                    r={l.isHQ ? "6" : "4"}
                    fill={l.isHQ ? "#e11d48" : isSelectedDest ? "#14b8a6" : "#475569"}
                    className={isSelectedDest || l.isHQ ? "animate-pulse" : ""}
                  />
                  <text
                    y="-10"
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-slate-300 font-mono"
                  >
                    {l.name} {l.isHQ ? '(HQ)' : ''}
                  </text>
                </g>
              );
            })}

            {/* Traveling Vehicle Marker */}
            {progress > 0 && (
              <g transform={`translate(${currentX}, ${currentY})`} className="transition-all duration-300">
                <circle r="12" fill="#14b8a6" fillOpacity="0.25" className="animate-ping" />
                <circle r="8" fill="#14b8a6" />
                <g transform="translate(-5, -5)">
                  <Navigation className="h-2.5 w-2.5 text-slate-950 fill-current transform rotate-45" />
                </g>
              </g>
            )}
          </svg>

          {/* Scale Legend */}
          <div className="absolute bottom-2 left-2 bg-slate-900/90 border border-slate-800 rounded px-2 py-0.5 text-[9px] font-mono text-slate-400">
            Scale: 1cm = 45km | GPS: Active
          </div>
        </div>

        {/* Live Status and Driver Dashboard */}
        <div className="flex flex-col justify-between gap-4">
          {/* Driver Details Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-inner">
              AR
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Azaan Al-Rawahi</span>
                <span className="text-[10px] bg-teal-950 border border-teal-800 text-teal-400 px-1.5 py-0.5 rounded font-bold">
                  PRO DRIVER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">SPEED Dispatch Muscat</p>
              <div className="flex items-center gap-1 text-yellow-500 text-xs mt-1">
                <Star className="h-3 w-3 fill-current" />
                <span className="font-bold">4.95</span>
                <span className="text-slate-500 text-[10px]">(1,480 trips)</span>
              </div>
            </div>
          </div>

          {/* Logistics Progress List */}
          <div className="space-y-3.5 flex-1 mt-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Delivery Progress</span>
              <span className="font-mono text-teal-400 font-bold">{progress}%</span>
            </div>
            
            {/* Simple responsive progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Displaying Current Simulated Status Message */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 min-h-[4.5rem] flex items-start gap-2.5">
              {progress === 100 ? (
                <CheckCircle className="text-emerald-400 h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <span className="animate-ping h-2 w-2 rounded-full bg-teal-400 shrink-0 mt-2"></span>
              )}
              <div>
                <p className="text-xs font-semibold text-teal-400">
                  {progress === 100 ? 'Status: Handover Complete' : 'Status: En-Route'}
                </p>
                <p className="text-[11px] text-slate-300 mt-1 italic">
                  "{trackingLogs[currentStatusIndex]}"
                </p>
              </div>
            </div>

            {/* Quick Post-Delivery Review / Google Maps rating prompt */}
            {progress === 100 && (
              <div className="bg-slate-950 border border-teal-850 rounded-xl p-4 space-y-3 mt-1 animate-fade-in shadow-xl shadow-teal-950/10">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold font-display">
                  <Star className="h-4 w-4 fill-current animate-pulse text-amber-400" />
                  <span>Rate Your Dispatch Delivery!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Your premium vehicle was delivered on time. Share your experience directly to Google Maps to help others!
                </p>

                {/* Rating Stars Selector */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setMiniRating(star)}
                      className="text-amber-400 hover:scale-110 active:scale-95 transition cursor-pointer"
                      title={`${star} Stars`}
                    >
                      <Star className={`h-5.5 w-5.5 ${star <= miniRating ? 'fill-current text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>

                {/* mini review description text */}
                <textarea
                  rows={2}
                  value={miniText}
                  onChange={(e) => setMiniText(e.target.value)}
                  placeholder="Draft your quick review..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-sans"
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => setSavedLocally(true)}
                    className={`flex-1 font-bold text-[10px] py-2 rounded-lg border transition cursor-pointer ${
                      savedLocally
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                    }`}
                  >
                    {savedLocally ? '✓ Review Saved!' : 'Save Locally'}
                  </button>
                  <button
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(miniText);
                        setCopiedMini(true);
                        setTimeout(() => setCopiedMini(false), 4000);
                      } catch (err) {
                        console.error('Failed to copy', err);
                      }
                      window.open('https://maps.app.goo.gl/U4TzcEJ8WDdzx7XX6', '_blank');
                    }}
                    className="flex-1 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold text-[10px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-teal-500/10"
                  >
                    {copiedMini ? 'Copied & Redirecting!' : 'Copy & Post to Maps'}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
                {savedLocally && (
                  <p className="text-[9px] text-emerald-400 text-center font-mono">
                    ✓ Feedback logged. Open Google Maps to make it public!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Dispatch WhatsApp Link */}
          <a
            href="https://wa.me/96893070770?text=Hello%20SPEED%20I%20am%20tracking%20my%20car%20delivery"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-slate-850 hover:bg-emerald-950/40 text-white font-medium text-xs rounded-lg py-2 text-center flex items-center justify-center gap-2 border border-slate-700 hover:border-emerald-500/40 transition"
          >
            <svg className="h-4 w-4 fill-current text-[#25D366]" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.478 5.357 1.479 5.437 0 9.859-4.42 9.862-9.859.002-2.636-1.023-5.111-2.884-6.974C17.26 1.936 14.78 1.9 12.012 1.9c-5.44 0-9.863 4.419-9.866 9.86 0 2.128.556 4.195 1.61 6.012l-.995 3.633 3.731-.978zm11.367-7.234c-.3-.15-1.772-.875-2.046-.975-.275-.1-.475-.15-.674.15-.199.3-.773.975-.948 1.175-.175.2-.35.225-.65.075-1.205-.6-2.099-1.077-2.933-2.51-.219-.375.219-.348.627-1.156.075-.15.038-.282-.019-.394-.056-.113-.475-1.144-.65-1.569-.171-.413-.342-.356-.475-.362-.122-.006-.263-.008-.403-.008-.14 0-.368.053-.56.263-.193.21-.738.72-7.38.72s1.147 1.417 1.302 1.625c.156.208 2.229 3.403 5.4 4.767.753.325 1.341.519 1.8.663.757.241 1.448.207 1.993.125.607-.09 1.772-.725 2.022-1.391.25-.666.25-1.238.175-1.391-.075-.153-.275-.253-.575-.403z"/>
            </svg>
            Contact Dispatch (+968 9307 0770)
          </a>
        </div>
      </div>
    </div>
  );
}
