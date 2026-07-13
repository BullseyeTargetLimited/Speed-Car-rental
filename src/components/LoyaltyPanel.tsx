import React, { useState } from 'react';
import { Award, ShieldCheck, Gift, Compass, Flame, ArrowUpRight } from 'lucide-react';
import { TRANSLATIONS } from '../data';

export default function LoyaltyPanel({ lang }: { lang: 'en' | 'ar' | 'fr' }) {
  const t = TRANSLATIONS[lang];
  const [estDays, setEstDays] = useState(12);
  const [estTours, setEstTours] = useState(2);

  // Rewards calculation formulas
  const totalPoints = estDays * 120 + estTours * 450;
  
  let currentTier = 'Bronze Scout';
  let tierColor = 'from-amber-600 to-amber-800';
  let tierPercent = 30;
  let rewardDiscount = '5%';
  let perk = 'Free GPS Navigator';

  if (totalPoints >= 3000) {
    currentTier = 'Sultanate Platinum Elite';
    tierColor = 'from-purple-500 via-indigo-600 to-teal-500';
    tierPercent = 100;
    rewardDiscount = '20%';
    perk = 'Free Hard-Shell Rooftop Tent & VIP Muscat Airport Meet-and-Greet';
  } else if (totalPoints >= 1500) {
    currentTier = 'Desert Gold Commander';
    tierColor = 'from-yellow-500 to-amber-600';
    tierPercent = 75;
    rewardDiscount = '15%';
    perk = 'Complimentary Portable Stove with 4 butane canisters & Priority Delivery';
  } else if (totalPoints >= 600) {
    currentTier = 'Mountain Silver Explorer';
    tierColor = 'from-slate-300 to-slate-500';
    tierPercent = 50;
    rewardDiscount = '10%';
    perk = 'Set of 2 Premium Camping Chairs and priority support';
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl text-white">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <Award className="text-yellow-500 h-6 w-6 animate-bounce" />
        <div>
          <h3 className="text-xl font-bold tracking-tight">{t.loyaltyTitle}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            17 Years of rewarding frequent explorers and corporate drivers in Oman.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tier status illustration */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">YOUR ESTIMATED TIER</span>
              <ShieldCheck className="text-teal-400 h-4 w-4" />
            </div>
            
            <div className={`p-4 rounded-lg bg-gradient-to-r ${tierColor} text-white font-bold relative overflow-hidden`}>
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
                <Award className="h-32 w-32" />
              </div>
              <p className="text-lg tracking-tight uppercase">{currentTier}</p>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-extrabold">{totalPoints}</span>
                <span className="text-xs font-medium text-white/80">SPEED Points</span>
              </div>
            </div>

            {/* Progress bar to next tier */}
            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Tier Milestone Progress</span>
                <span>{totalPoints} / 3,000 pts</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-400 to-teal-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${tierPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Exclusive Rental Discount:</span>
              <span className="font-bold text-teal-400">{rewardDiscount} OFF</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Outdoor Adventure Perk:</span>
              <span className="font-bold text-yellow-400 text-right">{perk}</span>
            </div>
          </div>
        </div>

        {/* Loyalty Calculator */}
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-teal-400 uppercase tracking-wide mb-3 flex items-center gap-1">
              <Gift className="h-4 w-4" />
              Calculate Your Perks
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Enter your planned travel frequency with SPEED to see which tier and complimentary camping accessories you immediately qualify for.
            </p>

            <div className="space-y-4">
              {/* Est days slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-300">Estimated Rental Days / Year</span>
                  <span className="text-teal-400 font-bold">{estDays} days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="45"
                  value={estDays}
                  onChange={(e) => setEstDays(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                />
                <span className="text-[10px] text-slate-500 font-mono">Earns 120 points per day + standard insurance discount</span>
              </div>

              {/* Est tours slider */}
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-slate-300">Oman Tours / Safaris Booked</span>
                  <span className="text-teal-400 font-bold">{estTours} tours</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={estTours}
                  onChange={(e) => setEstTours(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-1 bg-slate-800 rounded-lg appearance-none"
                />
                <span className="text-[10px] text-slate-500 font-mono">Earns 450 points per tour package + free camping bundle eligibility</span>
              </div>
            </div>
          </div>

          <div className="mt-5 bg-teal-950/40 border border-teal-900/60 rounded-lg p-3 text-xs flex items-start gap-2 text-teal-300">
            <Gift className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Loyalty Reward Dispatch Note</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Reward credits are automatically loaded onto your mobile phone number. Use the same phone number (+968) during checkout to unlock these priority upgrades.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
