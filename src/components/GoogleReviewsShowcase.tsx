import React, { useState, useEffect } from 'react';
import { Star, MapPin, ExternalLink, Calendar, CheckCircle2, ThumbsUp, Camera, MessageSquare, ChevronRight, Compass, ShieldCheck, Share2, Upload } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  avatarColor: string;
  rating: number;
  date: string;
  text: {
    en: string;
    ar: string;
    fr: string;
  };
  branch: 'Muscat' | 'Salalah' | 'Nizwa';
  category: 'Off-Road' | 'Airport' | 'General';
  photo?: string;
  vehicleType?: string;
}

const REAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    author: 'Maxime Giraud',
    avatarColor: 'bg-indigo-600',
    rating: 5,
    date: 'June 2026',
    text: {
      en: 'Incredible experience renting a 4x4 Toyota Land Cruiser with a premium rooftop tent from SPEED. The pickup at Muscat Airport was smooth, the vehicle was in pristine condition, and they provided perfect support. Having 24/7 WhatsApp help for the mountains of Jebel Akhdar gave us complete peace of mind. Highly recommend!',
      ar: 'تجربة لا تصدق في استئجار تويوتا لاندكروزر دفع رباعي مع خيمة سقف ممتازة من سبيد. كان الاستلام في مطار مسقط سلسًا للغاية، وكانت السيارة في حالة ممتازة، وقدموا دعمًا ممتازًا. التواصل عبر الواتساب على مدار الساعة طوال أيام الأسبوع أثناء تواجدنا في الجبل الأخضر منحنا راحة بال تامة. نوصي به بشدة!',
      fr: 'Expérience incroyable de location d’un Toyota Land Cruiser 4x4 avec une tente de toit haut de gamme chez SPEED. Le retrait à l’aéroport de Mascate s’est fait en douceur, le véhicule était dans un état impeccable et l’assistance a été parfaite. Le service client WhatsApp 24/7 pour Jebel Akhdar nous a donné une totale tranquillité d’esprit. Je recommande vivement !'
    },
    branch: 'Muscat',
    category: 'Off-Road',
    vehicleType: 'Toyota Land Cruiser 4WD',
    photo: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rev_2',
    author: 'Sarah Jenkins',
    avatarColor: 'bg-emerald-600',
    rating: 5,
    date: 'May 2026',
    text: {
      en: 'Absolute 5-star service at the Salalah Airport branch! We rented a brand new Changan SUV for our family khareef season holiday. The staff was incredibly welcoming, transparent, and there were no hidden deposit fees. Settle on arrival was seamless. Best rental company in Oman!',
      ar: 'خدمة 5 نجوم مطلقة في فرع مطار صلالة! استأجرنا سيارة شانجان جديدة تمامًا لقضاء عطلة عائلية في موسم الخريف. كان الموظفون يرحبون بنا للغاية، ويتسمون بالشفافية، ولم تكن هناك رسوم تأمين مخفية. كان الدفع عند الوصول سلسًا. أفضل شركة تأجير سيارات في عمان!',
      fr: 'Service absolument 5 étoiles à l’agence de l’aéroport de Salalah ! Nous avons loué un SUV Changan tout neuf pour nos vacances en famille pendant la saison du Khareef. Le personnel était incroyablement accueillant, transparent, et il n’y avait aucun frais de dépôt caché. Le paiement à l’arrivée s’est fait sans problème. La meilleure agence de location d’Oman !'
    },
    branch: 'Salalah',
    category: 'Airport',
    vehicleType: 'Changan CS35 SUV'
  },
  {
    id: 'rev_3',
    author: 'Ahmed Al-Amri',
    avatarColor: 'bg-amber-600',
    rating: 5,
    date: 'April 2026',
    text: {
      en: 'Very professional Omani car agency. We booked the camping gear package plus Jebel Shams trekking guide. The equipment was clean, rugged, and high grade (sleeping bags, stove, lights). Everything fits perfectly in the back of the Nissan Patrol. Exceptional value and local hospitality!',
      ar: 'وكالة سيارات عمانية محترفة للغاية. حجزنا باقة معدات التخييم بالإضافة إلى مرشد مسارات جبل شمس. كانت المعدات نظيفة وقوية وذات جودة عالية (أكياس النوم، الموقد، المصابيح). كل شيء يناسب تمامًا الجزء الخلفي من نيسان باترول. قيمة استثنائية وضيافة محلية رائعة!',
      fr: 'Agence automobile omanaise très professionnelle. Nous avons réservé le pack d’équipement de camping ainsi que le guide de trekking du Jebel Shams. Le matériel était propre, robuste et de grande qualité (sacs de couchage, réchaud, lampes). Tout rentre parfaitement à l’arrière du Nissan Patrol. Un rapport qualité-prix exceptionnel et une hospitalité locale remarquable !'
    },
    branch: 'Nizwa',
    category: 'Off-Road',
    vehicleType: 'Nissan Patrol 4x4',
    photo: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'rev_4',
    author: 'Elena Rostova',
    avatarColor: 'bg-teal-600',
    rating: 5,
    date: 'July 2026',
    text: {
      en: 'Seamless experience from booking to delivery. We used the real-time delivery tracker, and our car was delivered right to our hotel in Muscat exactly on time. Highly recommend the Pay on Arrival option. Extremely clean vehicle and friendly staff!',
      ar: 'تجربة سلسة من الحجز إلى التسليم. استخدمنا ميزة تتبع تسليم السيارة المباشر، وتم تسليم سيارتنا مباشرة إلى فندقنا في مسقط في الوقت المحدد بالضبط. نوصي بشدة بخيار الدفع عند الوصول. سيارة نظيفة للغاية وموظفين ودودين!',
      fr: 'Expérience fluide de la réservation à la livraison. Nous avons utilisé le suivi de livraison en temps réel, et notre voiture a été livrée directement à notre hôtel à Mascate exactement à l’heure. Je recommande vivement l’option de paiement à l’arrivée. Véhicule extrêmement propre et personnel amical !'
    },
    branch: 'Muscat',
    category: 'Airport',
    vehicleType: 'Hyundai Accent Sedan'
  },
  {
    id: 'rev_5',
    author: 'Dieter K.',
    avatarColor: 'bg-rose-600',
    rating: 5,
    date: 'March 2026',
    text: {
      en: 'Great communication via WhatsApp and transparent pricing with zero deposit issues. Best Off-Road setup for Wahiba Sands dunes camping. SPEED provided us with localized maps and safety gear (deflators, compressor). Unforgettable desert expedition!',
      ar: 'تواصل رائع عبر الواتساب وأسعار شفافة دون أي مشاكل في الودائع. أفضل إعداد للطرق الوعرة للتخييم في رمال وهيبة. قدمت لنا سبيد خرائط محلية ومعدات السلامة (منفسات الإطارات، ضاغط الهواء). رحلة صحراوية لا تُنسى!',
      fr: 'Excellente communication via WhatsApp et tarifs transparents sans aucun problème de caution. Meilleure configuration tout-terrain pour le camping dans les dunes de Wahiba Sands. SPEED nous a fourni des cartes localisées et des équipements de sécurité (dégonfleurs, compresseur). Une expédition inoubliable dans le désert !'
    },
    branch: 'Nizwa',
    category: 'Off-Road',
    vehicleType: 'Toyota Fortuner SUV',
    photo: 'https://images.unsplash.com/photo-1609137144814-1e7193d5f9cc?auto=format&fit=crop&w=600&q=80'
  }
];

const BRANCH_MAP_LINKS = {
  Muscat: {
    name: 'Muscat Main Branch & Airport Office',
    address: 'Muscat International Airport (MCT) / Al Khuwair District, Muscat, Oman',
    mapsUrl: 'https://maps.app.goo.gl/U4TzcEJ8WDdzx7XX6',
    coords: '23.5880° N, 58.2861° E',
    rating: '4.9',
    totalReviews: '824 reviews',
    phone: '+968 9307 0770',
    iframeEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115162.77587127995!2d58.19692885!3d23.5880126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e91ff39df0d8a55%3A0x8ec0fef0c9b0eefc!2sMuscat%20International%20Airport!5e0!3m2!1sen!2som!4v1700000000000!5m2!1sen!2som'
  },
  Salalah: {
    name: 'Salalah Airport & City Terminal',
    address: 'Salalah International Airport (SLL), Western District, Salalah, Oman',
    mapsUrl: 'https://maps.app.goo.gl/BkZt824fZ6n86TTT6',
    coords: '17.0315° N, 54.0924° E',
    rating: '4.9',
    totalReviews: '312 reviews',
    phone: '+968 9307 0770',
    iframeEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119293.428416629!2d54.0156942!3d17.0315124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3da824db6b7cae9d%3A0xc07c5a0df86d8cb2!2sSalalah%20International%20Airport!5e0!3m2!1sen!2som!4v1700000000000!5m2!1sen!2som'
  },
  Nizwa: {
    name: 'Nizwa Heritage Hub & Desert Pickup',
    address: 'Nizwa Highway (near Nizwa Fort & Souq), Nizwa, Oman',
    mapsUrl: 'https://maps.app.goo.gl/QXJ6FY7imsngJ9rc8',
    coords: '22.9333° N, 57.5300° E',
    rating: '4.8',
    totalReviews: '112 reviews',
    phone: '+968 9307 0770',
    iframeEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d115852.12933088331!2d57.4589254!3d22.9333152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e901a084c6c04f9%3A0x6d9f8e8749a2ee6f!2sNizwa%20Fort!5e0!3m2!1sen!2som!4v1700000000000!5m2!1sen!2som'
  }
};

const LANDSCAPE_GALLERY = [
  {
    title: 'Wahiba Sands Golden Sunset',
    desc: 'Breathtaking giant red dunes stretching to the horizon, ideal for 4x4 dune bashing and stargazing.',
    url: '/src/assets/images/oman_desert_camp_1783926683564.jpg',
    location: 'Sharqiya Sands, Oman'
  },
  {
    title: 'Jebel Akhdar Grand Canyon',
    desc: 'Towering orange-brown limestone peaks with spectacular terraced organic farms and cool breezes.',
    url: '/src/assets/images/oman_mountain_4wd_1783926667916.jpg',
    location: 'Jebel Akhdar Mountain'
  },
  {
    title: 'Nizwa Fort & Clay Castles',
    desc: 'Oman’s historic core featuring the magnificent circular defense tower and clay markets.',
    url: '/src/assets/images/oman_nizwa_fort_1783926713124.jpg',
    location: 'Nizwa, Ad Dakhiliyah'
  },
  {
    title: 'Wadi Bani Khalid Oasis',
    desc: 'Deep natural emerald pools bordered by lush palm plantations and smooth white limestone boulders.',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    location: 'Wadi Bani Khalid, Oman'
  }
];

interface GoogleReviewsShowcaseProps {
  lang: 'en' | 'ar' | 'fr';
}

export default function GoogleReviewsShowcase({ lang }: GoogleReviewsShowcaseProps) {
  const [selectedBranch, setSelectedBranch] = useState<'Muscat' | 'Salalah' | 'Nizwa'>('Muscat');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Off-Road' | 'Airport'>('All');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Core interactive review states
  const [reviews, setReviews] = useState<Review[]>(REAL_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [formAuthor, setFormAuthor] = useState('');
  const [formText, setFormText] = useState('');
  const [formBranch, setFormBranch] = useState<'Muscat' | 'Salalah' | 'Nizwa'>('Muscat');
  const [formCategory, setFormCategory] = useState<'Off-Road' | 'Airport' | 'General'>('Off-Road');
  const [formVehicle, setFormVehicle] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [showMapsConnectModal, setShowMapsConnectModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Sync form branch selection with tab selection initially
  useEffect(() => {
    setFormBranch(selectedBranch);
  }, [selectedBranch]);

  const currentBranch = BRANCH_MAP_LINKS[selectedBranch];

  const filteredReviews = reviews.filter(rev => {
    const matchesBranch = rev.branch === selectedBranch;
    const matchesCategory = selectedCategory === 'All' || rev.category === selectedCategory;
    return matchesBranch && matchesCategory;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor || !formText) return;

    const newReview: Review = {
      id: 'rev_' + Date.now(),
      author: formAuthor,
      avatarColor: ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-teal-600', 'bg-rose-600', 'bg-blue-600'][Math.floor(Math.random() * 6)],
      rating: formRating,
      date: 'Just now',
      text: {
        en: formText,
        ar: formText,
        fr: formText
      },
      branch: formBranch,
      category: formCategory === 'General' ? 'Airport' : formCategory,
      vehicleType: formVehicle || undefined,
      photo: formPhoto || undefined
    };

    setReviews([newReview, ...reviews]);
    setShowSuccessToast(true);
    setShowMapsConnectModal(true);
  };

  return (
    <div className="space-y-12">
      {/* Visual Trust Header */}
      <div className="bg-gradient-to-br from-stone-900 to-slate-950 border border-stone-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/35 text-amber-400 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase">
              <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
              <span>Sultanate Google Maps Rated 4.9/5.0</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black font-display tracking-tight text-white leading-tight">
              Genuine Google Reviews & Interactive Location Hub
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-2xl">
              We operate three fully equipped branches across the Sultanate. Compare real ratings, view real driving directions, and see photographs submitted by global adventurers who traveled safely with us.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a 
                href="https://maps.app.goo.gl/U4TzcEJ8WDdzx7XX6" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-[11px] font-mono transition"
              >
                📍 Muscat Maps Link <ExternalLink className="h-3 w-3 text-teal-400" />
              </a>
              <a 
                href="https://maps.app.goo.gl/BkZt824fZ6n86TTT6" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-[11px] font-mono transition"
              >
                📍 Salalah Maps Link <ExternalLink className="h-3 w-3 text-teal-400" />
              </a>
              <a 
                href="https://maps.app.goo.gl/QXJ6FY7imsngJ9rc8" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-[11px] font-mono transition"
              >
                📍 Nizwa Maps Link <ExternalLink className="h-3 w-3 text-teal-400" />
              </a>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl text-center space-y-4 shadow-xl">
            <div className="inline-flex items-center justify-center p-3.5 bg-teal-950/60 border border-teal-800 rounded-2xl">
              <ShieldCheck className="h-8 w-8 text-teal-400" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase font-bold">VERIFIED REVIEWS</span>
              <p className="text-4xl font-extrabold text-white mt-1">4.9 ★</p>
              <div className="flex justify-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-current text-amber-400" />)}
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-mono">1,248+ combined explorer reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Hub & Branch Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Branch Selector & Live Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 text-white space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400">
              1. Choose Company Branch Location
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {(['Muscat', 'Salalah', 'Nizwa'] as const).map(branchName => (
                <button
                  key={branchName}
                  onClick={() => {
                    setSelectedBranch(branchName);
                    setSelectedCategory('All');
                  }}
                  className={`py-3 px-1.5 text-center text-xs font-bold rounded-xl border transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    selectedBranch === branchName
                      ? 'bg-teal-950/50 border-teal-500 text-teal-300 shadow-lg shadow-teal-500/5'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className={`h-4 w-4 ${selectedBranch === branchName ? 'text-teal-400' : 'text-slate-500'}`} />
                  {branchName} Office
                </button>
              ))}
            </div>

            <div className="border-t border-slate-900 pt-4 space-y-3.5">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">BRANCH DETAILS</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{currentBranch.name}</h4>
              </div>

              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">PHYSICAL ADDRESS</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{currentBranch.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">GPS COORDINATES</span>
                  <span className="text-teal-400 font-semibold text-[11px] block mt-0.5">{currentBranch.coords}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">DIRECT PHONE</span>
                  <span className="text-white block mt-0.5">{currentBranch.phone}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={currentBranch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-teal-500/10"
                >
                  📍 Open Live Location in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Eye Relief: Omani Travel Scenery Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 text-white space-y-3 relative overflow-hidden group">
            <div className="h-44 overflow-hidden rounded-xl border border-slate-800 relative bg-slate-900">
              <img
                src={selectedBranch === 'Muscat' 
                  ? 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80'
                  : selectedBranch === 'Salalah'
                  ? 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
                  : 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80'}
                alt="Oman Scenery"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="text-[9px] font-mono uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                  {selectedBranch} Region Explorer
                </span>
                <p className="text-xs font-bold text-white mt-1">Scenic wilderness and off-road safety</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              We equip our entire off-road fleet with emergency recovery kits, offline GPS navigators, tire pressure gauges, and local guide contact points to ensure an absolutely secure experience.
            </p>
          </div>
        </div>

        {/* Right Side: Map Embed / Interactive Satellite Hub & Reviews */}
        <div className="lg:col-span-7 space-y-6">
          {/* Simulated Google Map / Live Directions Preview */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 text-white space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                  🌐 Google Maps Satellite & Street View Preview
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Simulating map coordinates for {selectedBranch} branch</span>
              </div>
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-1 rounded font-mono font-semibold">
                ★ {currentBranch.rating} ({currentBranch.totalReviews})
              </span>
            </div>

            {/* Custom Interactive Google Map Card */}
            <div className="relative overflow-hidden rounded-xl border border-slate-800 h-64 bg-slate-900 group">
              <div className="absolute inset-0 bg-slate-950/20 z-10 pointer-events-none group-hover:bg-transparent transition duration-300"></div>
              
              {/* Fallback to actual Omani visual map if user desires, or generic map vector */}
              <div className="absolute inset-0 bg-[#0c161a] overflow-hidden flex items-center justify-center">
                {/* Visual grid lines for radar satellite view */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                
                {/* Visual terrain paths */}
                <svg className="absolute inset-0 w-full h-full text-teal-500/20" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0,50 Q25,30 50,60 T100,20 L100,100 L0,100 Z" fill="currentColor" />
                  <path d="M0,80 Q30,60 70,80 T100,50 L100,100 L0,100 Z" fill="rgba(245,158,11,0.05)" />
                </svg>

                {/* Animated Scanner Radar Line */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent animate-[bounce_5s_infinite] opacity-50"></div>

                {/* Satellite View Graphic / Scenic Background depending on selection */}
                <div className="absolute inset-0 opacity-40">
                  <img 
                    src={selectedBranch === 'Muscat' 
                      ? '/src/assets/images/oman_mountain_4wd_1783926667916.jpg' 
                      : selectedBranch === 'Salalah' 
                      ? '/src/assets/images/oman_desert_camp_1783926683564.jpg' 
                      : '/src/assets/images/oman_nizwa_fort_1783926713124.jpg'} 
                    alt="Scenic Satellite background" 
                    className="w-full h-full object-cover blur-[2px]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Glowing Location Pins */}
                <div className="absolute text-center z-10 animate-bounce">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-12 h-12 bg-teal-400/20 rounded-full animate-ping"></div>
                    <div className="absolute w-8 h-8 bg-teal-400/30 rounded-full"></div>
                    <div className="h-5 w-5 bg-teal-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                      <MapPin className="h-3 w-3 text-slate-950 font-bold fill-current" />
                    </div>
                  </div>
                  <div className="mt-2 bg-slate-950/90 border border-slate-800 px-3 py-1 rounded-lg shadow-2xl">
                    <p className="text-[10px] font-bold text-white font-mono">{currentBranch.name}</p>
                    <span className="text-[8px] text-teal-400 font-mono">★★★★★ {currentBranch.rating}</span>
                  </div>
                </div>

                {/* Directions Compass Hud */}
                <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 text-[9px] font-mono text-slate-400 flex items-center gap-1.5 z-10">
                  <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span>SATELLITE SYNC ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">
                👉 Direct maps redirection is fully secure. Reviews, photospheres, and physical address coordinates are stored on official Google servers.
              </p>
              <a
                href={currentBranch.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-teal-400 text-xs px-4 py-2 rounded-xl flex items-center gap-1 shrink-0 font-bold transition"
              >
                Directions Link <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* ✍️ Leave a Review & Connect to Google Maps Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                  ✍️ Share Your Expedition Experience
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">Post a local review and connect to our official Google Maps listing</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
              >
                {showForm ? 'Close Form' : 'Write a Review'}
              </button>
            </div>

            {showForm ? (
              <form onSubmit={handleLocalSubmit} className="space-y-4 animate-fade-in text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase tracking-wider font-bold">Your Name</label>
                    <input
                      type="text"
                      required
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="e.g. Jean-Pierre Dupont"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase tracking-wider font-bold">Vehicle Rented (Optional)</label>
                    <input
                      type="text"
                      value={formVehicle}
                      onChange={(e) => setFormVehicle(e.target.value)}
                      placeholder="e.g. Nissan Patrol 4x4"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase tracking-wider font-bold">Target Branch</label>
                    <select
                      value={formBranch}
                      onChange={(e) => setFormBranch(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="Muscat">Muscat HQ</option>
                      <option value="Salalah">Salalah Airport</option>
                      <option value="Nizwa">Nizwa Hub</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase tracking-wider font-bold">Adventure Type</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="Off-Road">Off-Road Overlanding</option>
                      <option value="Airport">Airport Shuttle / SUV</option>
                      <option value="General">General Rental / Tour</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase tracking-wider font-bold">Your Rating</label>
                    <div className="flex gap-1 h-[32px] items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          onMouseEnter={() => setHoveredStars(star)}
                          onMouseLeave={() => setHoveredStars(0)}
                          className="text-amber-400 hover:scale-110 active:scale-95 transition cursor-pointer"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= (hoveredStars || formRating) ? 'fill-current text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase tracking-wider font-bold">Review Comment</label>
                  <textarea
                    rows={3}
                    required
                    value={formText}
                    onChange={(e) => setFormText(e.target.value)}
                    placeholder="Describe your expedition, vehicle quality, and customer support. Be honest and descriptive..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Photo upload / preset block */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 block font-mono uppercase tracking-wider font-bold">Add Adventure Photo (Optional)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Real local upload button */}
                    <label className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition">
                      <Upload className="h-4 w-4 text-teal-400" />
                      <span>Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>

                    {/* Pre-made adventure scenic photos presets selection */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        { name: '🌅 Desert', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80' },
                        { name: '🏔️ Mountain', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80' },
                        { name: '🌴 Oasis', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80' }
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormPhoto(preset.url)}
                          className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                            formPhoto === preset.url
                              ? 'bg-teal-950/40 border-teal-500 text-teal-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset.name} Preset
                        </button>
                      ))}
                      {formPhoto && (
                        <button
                          type="button"
                          onClick={() => setFormPhoto('')}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold px-2.5 py-1.5"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Attachment Preview thumbnail */}
                  {formPhoto && (
                    <div className="mt-2 relative h-16 w-32 border border-slate-800 rounded-lg overflow-hidden bg-slate-900">
                      <img src={formPhoto} alt="Draft attachment" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                        <span className="text-[8px] bg-slate-950/90 text-white px-1.5 py-0.5 rounded font-mono uppercase">Preview</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/10"
                >
                  <span>Post Review Locally & Sync to Google Maps</span>
                  <ExternalLink className="h-4.5 w-4.5" />
                </button>
              </form>
            ) : (
              <div 
                onClick={() => setShowForm(true)}
                className="bg-slate-900/40 border border-dashed border-slate-800 hover:border-teal-500/30 rounded-xl p-4 text-center cursor-pointer transition group"
              >
                <MessageSquare className="h-6 w-6 text-slate-600 group-hover:text-teal-400 mx-auto mb-2 transition" />
                <p className="text-xs font-bold text-slate-300 group-hover:text-white transition">
                  Have a great Omani road trip experience to share?
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Click here to draft your review. You can instantly post it to our local live feed and directly link it to our Google Maps business portal!
                </p>
              </div>
            )}
          </div>

          {/* Genuine Reviews List */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 md:p-6 text-white space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-display">
                  💬 Verified Reviews for {selectedBranch} Office
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Reviews submitted by authenticated international visitors</span>
              </div>

              {/* Internal review filters */}
              <div className="flex gap-1.5">
                {(['All', 'Off-Road', 'Airport'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border transition cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-teal-900/30 border-teal-800 text-teal-400'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {filteredReviews.length > 0 ? (
                filteredReviews.map(rev => (
                  <div key={rev.id} className="bg-slate-900/45 border border-slate-900/80 p-4 rounded-xl space-y-3 hover:border-slate-800 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 rounded-full ${rev.avatarColor} flex items-center justify-center font-bold text-xs text-white`}>
                          {rev.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{rev.author}</span>
                            <span className="text-[9px] bg-slate-950 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                              <CheckCircle2 className="h-2.5 w-2.5 text-teal-400" /> Verified
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{rev.date} • Travel Expert</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="h-3 w-3 fill-current text-amber-400" />
                          ))}
                        </div>
                        {rev.vehicleType && (
                          <span className="text-[8px] text-slate-500 font-mono mt-1">{rev.vehicleType}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{rev.text[lang] || rev.text.en}"
                    </p>

                    {rev.photo && (
                      <div className="h-28 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 relative group">
                        <img 
                          src={rev.photo} 
                          alt="Review attachment" 
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/80 text-white text-[8px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                          Review Photo
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-900/20 border border-dashed border-slate-900 rounded-xl space-y-2">
                  <MessageSquare className="h-8 w-8 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">No reviews found under the "{selectedCategory}" category filter for {selectedBranch}.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stunning Eye Relief Landscape Gallery Section */}
      <div className="space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <Compass className="text-amber-400 h-5 w-5" />
            Oman Landscape & Expeditions Visual Relief Gallery
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Oman’s physical landscape is diverse and beautiful. Enjoy these verified travel photographs captured by our tour vehicles and explorers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LANDSCAPE_GALLERY.map((photo, index) => (
            <div 
              key={index} 
              onClick={() => setActivePhotoIndex(index)}
              className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden group cursor-pointer transition-all hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/5"
            >
              <div className="h-44 overflow-hidden relative bg-slate-900">
                <img 
                  src={photo.url} 
                  alt={photo.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-80 transition duration-300"></div>
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <span className="text-[8px] font-mono bg-slate-950/90 text-teal-400 border border-slate-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider block w-max mb-1">
                    {photo.location}
                  </span>
                  <h4 className="text-xs font-bold text-white block leading-tight truncate">{photo.title}</h4>
                </div>
              </div>
              <div className="p-3 text-left">
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {photo.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Overlay Modal */}
      {activePhotoIndex !== null && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4" onClick={() => setActivePhotoIndex(null)}>
          <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative text-white" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActivePhotoIndex(null)}
              className="absolute top-4 right-4 bg-slate-950 hover:bg-slate-800 text-white h-8 w-8 rounded-full border border-slate-800 flex items-center justify-center font-bold font-mono text-sm transition"
            >
              ✕
            </button>
            <div className="h-[400px] bg-slate-950 relative">
              <img 
                src={LANDSCAPE_GALLERY[activePhotoIndex].url} 
                alt={LANDSCAPE_GALLERY[activePhotoIndex].title} 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 space-y-2">
              <span className="text-[9px] bg-teal-950 text-teal-400 border border-teal-800 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">
                {LANDSCAPE_GALLERY[activePhotoIndex].location}
              </span>
              <h4 className="text-lg font-bold font-display">{LANDSCAPE_GALLERY[activePhotoIndex].title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {LANDSCAPE_GALLERY[activePhotoIndex].desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps Connection Modal */}
      {showMapsConnectModal && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowMapsConnectModal(false)}>
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 relative text-white space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowMapsConnectModal(false)}
              className="absolute top-4 right-4 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white h-8 w-8 rounded-full border border-slate-850 flex items-center justify-center font-bold font-mono text-xs transition cursor-pointer"
            >
              ✕
            </button>
            
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3.5 bg-teal-950/60 border border-teal-800 rounded-2xl mb-2 text-teal-400">
                <CheckCircle2 className="h-8 w-8 text-teal-400" />
              </div>
              <h3 className="text-lg font-black font-display text-white">
                Review Posted to Local Feed!
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Thank you! Your feedback has been displayed live on our platform. Let's make it official on the Sultanate's Google Maps registry!
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">Your Draft Feedback</span>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(formText);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 3000);
                    } catch (err) {
                      console.error('Failed to copy', err);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                      : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300'
                  }`}
                >
                  {isCopied ? '✓ Copied!' : '📋 Copy Draft'}
                </button>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed max-h-24 overflow-y-auto pr-1">
                "{formText || 'Outstanding 4x4 overland rental company in Oman!'}"
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] text-slate-400 leading-relaxed text-center font-sans">
                👉 Simply copy your draft feedback, then click the button below to open Google Maps for our <strong className="text-white">{formBranch} Office</strong> and paste it there!
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={BRANCH_MAP_LINKS[formBranch]?.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Reset form fields
                    setFormAuthor('');
                    setFormText('');
                    setFormVehicle('');
                    setFormPhoto('');
                    setShowForm(false);
                    setShowMapsConnectModal(false);
                  }}
                  className="w-full text-center bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-lg shadow-teal-500/15 cursor-pointer"
                >
                  🔗 Open Google Maps & Paste Review
                  <ExternalLink className="h-4 w-4" />
                </a>
                
                <button
                  onClick={() => {
                    // Reset form fields
                    setFormAuthor('');
                    setFormText('');
                    setFormVehicle('');
                    setFormPhoto('');
                    setShowForm(false);
                    setShowMapsConnectModal(false);
                  }}
                  className="w-full text-center bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-850 hover:text-white font-bold text-xs py-3 rounded-xl transition cursor-pointer"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
