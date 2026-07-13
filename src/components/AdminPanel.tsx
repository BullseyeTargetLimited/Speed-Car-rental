import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  FileText,
  Settings,
  RefreshCw,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Plus,
  X,
  ChevronRight,
  Image as ImageIcon,
  DollarSign,
  Activity,
  Briefcase,
  ShieldAlert,
  Sparkles,
  MapPin,
  Calendar,
  TrendingUp,
  Compass,
  User,
  Phone,
  Layers,
  Award,
  ArrowRight,
  ExternalLink,
  Printer,
  Download
} from 'lucide-react';
import { Vehicle, Booking, Language } from '../types';
import { VEHICLES, INSURANCE_PACKAGES, CAMPING_GEAR, TOURISM_PACKAGES, LOCATIONS } from '../data';

interface AdminPanelProps {
  lang: Language;
  vehicles: Vehicle[];
  onUpdateVehicles: (updatedVehicles: Vehicle[]) => void;
  addNotification: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  onDownloadPdf?: (booking: Booking, action?: 'download' | 'print') => void;
}

export default function AdminPanel({ lang, vehicles, onUpdateVehicles, addNotification, onDownloadPdf }: AdminPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('speedoman2009'); // Preset for quick testing
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Core Data Lists
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState<boolean>(false);
  
  // Overrides and dynamic settings states
  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState<boolean>(false);
  const [occupancyFactor, setOccupancyFactor] = useState<number>(1.15);
  
  // Tab states inside the admin console
  const [adminTab, setAdminTab] = useState<'reservations' | 'fleet' | 'settings'>('reservations');
  
  // Modal / Editing states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState<boolean>(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editingVehiclePrice, setEditingVehiclePrice] = useState<string>('');
  const [editingVehicleImage, setEditingVehicleImage] = useState<string>('');

  // Manual Booking Form States
  const [mbName, setMbName] = useState<string>('');
  const [mbEmail, setMbEmail] = useState<string>('');
  const [mbPhone, setMbPhone] = useState<string>('');
  const [mbVehicleId, setMbVehicleId] = useState<string>('');
  const [mbInsuranceId, setMbInsuranceId] = useState<string>('');
  const [mbCampingIds, setMbCampingIds] = useState<string[]>([]);
  const [mbTourId, setMbTourId] = useState<string>('');
  const [mbPickupLoc, setMbPickupLoc] = useState<string>('Muscat International Airport (MCT)');
  const [mbDropoffLoc, setMbDropoffLoc] = useState<string>('Muscat International Airport (MCT)');
  const [mbPickupDate, setMbPickupDate] = useState<string>('2026-07-16');
  const [mbPickupTime, setMbPickupTime] = useState<string>('10:00');
  const [mbDropoffDate, setMbDropoffDate] = useState<string>('2026-07-23');
  const [mbDropoffTime, setMbDropoffTime] = useState<string>('10:00');
  const [mbNeedGps, setMbNeedGps] = useState<boolean>(true);
  const [mbType, setMbType] = useState<'rental' | 'tourism' | 'combo'>('combo');
  const [mbTravelers, setMbTravelers] = useState<number>(2);

  // Check login state on mount
  useEffect(() => {
    const token = sessionStorage.getItem('speed_admin_token') || localStorage.getItem('speed_admin_token');
    if (token === 'speed-admin-token-2026') {
      setIsAuthenticated(true);
      setAuthToken(token);
    }
  }, []);

  // Fetch bookings, fleet configurations and pricing updates when logged in
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
      fetchFleetOverrides();
    }
  }, [isAuthenticated]);

  // Authenticate admin user
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsAuthenticated(true);
          setAuthToken(data.token);
          sessionStorage.setItem('speed_admin_token', data.token);
          addNotification('🔐 Admin Access Granted', 'Logged in successfully to SPEED Oman Logistics Panel', 'success');
        }
      } else {
        const err = await response.json();
        setLoginError(err.error || 'Authentication rejected. Check credentials.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError('Could not contact authentication server. Check server status.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthToken(null);
    sessionStorage.removeItem('speed_admin_token');
    localStorage.removeItem('speed_admin_token');
    addNotification('🔒 Admin Logged Out', 'Admin session terminated safely.', 'info');
  };

  // Fetch reservations from server
  const fetchBookings = async () => {
    if (!authToken && sessionStorage.getItem('speed_admin_token')) return;
    setIsLoadingBookings(true);
    try {
      const token = authToken || sessionStorage.getItem('speed_admin_token');
      const response = await fetch('/api/admin/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBookingsList(data.bookings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Fetch overrides and settings
  const fetchFleetOverrides = async () => {
    try {
      const response = await fetch('/api/admin/vehicles');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const loadedOverrides = data.overrides || {};
          setDynamicPricingEnabled(!!data.settings?.enabled);
          setOccupancyFactor(data.settings?.occupancyFactor || 1.15);

          // Apply overrides to default VEHICLES list
          const merged = VEHICLES.map(v => {
            const override = loadedOverrides[v.id];
            let price = v.pricePerDay;
            let img = v.image;

            if (override) {
              if (override.pricePerDay !== undefined) price = override.pricePerDay;
              if (override.image !== undefined && override.image !== '') img = override.image;
            }

            return {
              ...v,
              pricePerDay: price,
              image: img
            };
          });

          onUpdateVehicles(merged);
        }
      }
    } catch (error) {
      console.error('Failed to fetch vehicle overrides:', error);
    }
  };

  // Update single vehicle override
  const updateVehicleOverride = async (vehicleId: string, customPrice: number, customImg: string) => {
    try {
      const token = authToken || sessionStorage.getItem('speed_admin_token');
      const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pricePerDay: customPrice, image: customImg })
      });

      if (response.ok) {
        addNotification('⚡ Fleet Updated', `Toyota / Expedition specs modified for ${vehicleId.toUpperCase()}`, 'success');
        setEditingVehicleId(null);
        fetchFleetOverrides(); // Refresh list & update UI
      }
    } catch (error) {
      console.error('Error updating vehicle overrides:', error);
      addNotification('⚠️ Error Updating Fleet', 'Communication fail with logistics backend.', 'warning');
    }
  };

  // Reset fleet settings to original data.ts values
  const resetFleetOverrides = async () => {
    try {
      const token = authToken || sessionStorage.getItem('speed_admin_token');
      const response = await fetch('/api/admin/vehicles/reset', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        addNotification('🔄 Fleet Restored', 'All custom pricing and photos cleared back to default catalog.', 'success');
        fetchFleetOverrides();
      }
    } catch (error) {
      console.error('Failed to reset overrides:', error);
    }
  };

  // Update dynamic pricing settings
  const saveDynamicPricingConfig = async (enabled: boolean, factor: number) => {
    try {
      const token = authToken || sessionStorage.getItem('speed_admin_token');
      const response = await fetch('/api/admin/settings/dynamic-pricing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled, occupancyFactor: factor })
      });
      if (response.ok) {
        addNotification('💡 Price Matrix Synchronized', `Dynamic availability pricing is now ${enabled ? 'ENABLED' : 'DISABLED'}`, 'success');
        fetchFleetOverrides();
      }
    } catch (error) {
      console.error('Failed to update dynamic pricing settings:', error);
    }
  };

  // Create manual reservation
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mbName || !mbEmail || !mbPhone) {
      alert('Please fill out Name, Email, and Phone');
      return;
    }

    const hasCar = mbType === 'rental' || mbType === 'combo';
    const hasTour = mbType === 'tourism' || mbType === 'combo';

    if (hasCar && !mbVehicleId) {
      alert('Please select a Vehicle');
      return;
    }

    if (hasCar && !mbInsuranceId) {
      alert('Please select an Insurance Tier');
      return;
    }

    if (hasTour && !mbTourId) {
      alert('Please select a Tour Package');
      return;
    }

    // Rough calculation of price
    const selectedVeh = vehicles.find(v => v.id === mbVehicleId);
    const selectedIns = INSURANCE_PACKAGES.find(i => i.id === mbInsuranceId);
    const selectedTour = TOURISM_PACKAGES.find(t => t.id === mbTourId);

    const vRate = hasCar && selectedVeh ? selectedVeh.pricePerDay : 0;
    const iRate = hasCar && selectedIns ? selectedIns.pricePerDay : 0;
    
    let gearSum = 0;
    if (hasCar) {
      mbCampingIds.forEach(cid => {
        const g = CAMPING_GEAR.find(gear => gear.id === cid);
        if (g) gearSum += g.pricePerDay;
      });
    }

    // Calculate days
    const d1 = new Date(mbPickupDate);
    const d2 = new Date(mbDropoffDate);
    const diff = d2.getTime() - d1.getTime();
    const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));

    const carSubtotal = (vRate + iRate + gearSum) * days;
    const tourSubtotal = hasTour && selectedTour ? selectedTour.pricePerPerson * mbTravelers : 0;
    const subtotal = carSubtotal + tourSubtotal;
    const vatAmount = subtotal * 0.05;
    const total = subtotal + vatAmount;

    const manualBooking: Booking = {
      bookingId: 'SP-MAN-' + Math.floor(100000 + Math.random() * 900000),
      type: mbType,
      vehicleId: hasCar ? mbVehicleId : undefined,
      insurancePackageId: hasCar ? mbInsuranceId : undefined,
      selectedCampingGearIds: hasCar ? mbCampingIds : [],
      tourismPackageId: hasTour ? mbTourId : undefined,
      pickupLocation: mbPickupLoc,
      dropoffLocation: mbDropoffLoc,
      pickupDate: mbPickupDate,
      pickupTime: mbPickupTime,
      dropoffDate: mbDropoffDate,
      dropoffTime: mbDropoffTime,
      needGps: mbNeedGps,
      totalPrice: Number(total.toFixed(2)),
      customerName: mbName,
      customerEmail: mbEmail,
      customerPhone: mbPhone,
      language: 'en',
      status: 'confirmed',
      travelersCount: hasTour ? mbTravelers : undefined,
      rentalDays: days,
      subtotal: Number(subtotal.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2))
    };

    try {
      const token = authToken || sessionStorage.getItem('speed_admin_token');
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ booking: manualBooking })
      });

      if (response.ok) {
        addNotification('📝 Booking Created', `Reservation manual added for ${mbName} (#${manualBooking.bookingId})`, 'success');
        setIsNewBookingModalOpen(false);
        fetchBookings();
        
        // Reset manual booking fields
        setMbName('');
        setMbEmail('');
        setMbPhone('+968 ');
      }
    } catch (error) {
      console.error('Error creating manual booking:', error);
    }
  };

  // Delete Reservation
  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete reservation #${bookingId}? This action is permanent.`)) {
      return;
    }
    try {
      const token = authToken || sessionStorage.getItem('speed_admin_token');
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        addNotification('🗑️ Reservation Deleted', `Booking #${bookingId} has been purged from system.`, 'success');
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to delete booking:', error);
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'pending' | 'confirmed' | 'delivered') => {
    try {
      const token = authToken || sessionStorage.getItem('speed_admin_token');
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ booking: { status: newStatus } })
      });
      if (response.ok) {
        addNotification('📋 Status Synchronized', `Reservation #${bookingId} is now ${newStatus.toUpperCase()}`, 'success');
        setSelectedBooking(prev => prev ? { ...prev, status: newStatus } : null);
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Helper values
  const totalBookingsCount = bookingsList.length;
  const activeBookingsCount = bookingsList.filter(b => b.status === 'confirmed' || b.status === 'delivered').length;
  const totalProjectedIncome = bookingsList.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  // Render Login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-stone-200 shadow-xl rounded-2xl overflow-hidden p-6 text-stone-800 animate-fade-in">
        <div className="text-center space-y-2 mb-6">
          <div className="mx-auto h-12 w-12 bg-[#2D7A82]/10 rounded-full flex items-center justify-center text-[#2D7A82] mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold font-display text-stone-900">Operations Control Portal</h3>
          <p className="text-xs text-stone-500">
            Secure clearance required for SPEED Oman fleet logs and booking schedules.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-600 block">Operator Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#2D7A82] focus:border-[#2D7A82]"
              placeholder="e.g. admin"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-600 block">Clearance Code (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm bg-stone-50 border border-stone-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#2D7A82] focus:border-[#2D7A82]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D7A82] hover:bg-[#225f66] text-white font-bold text-xs py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Unlock className="h-4 w-4" /> Authenicate Credentials
          </button>
        </form>

        <div className="mt-6 border-t border-stone-100 pt-4 text-center">
          <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-2 py-1 rounded">
            🔑 System Default: admin / speedoman2009
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-sm text-stone-800 p-4 md:p-8 space-y-6 animate-fade-in">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="space-y-1.5">
          <span className="text-xs font-mono text-[#C47E5A] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Fleet Control Center (Est. 2009)
          </span>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-stone-900 font-display">
              SPEED Operations Cockpit
            </h3>
            <span className="bg-teal-50 border border-teal-200 text-[#2D7A82] text-[10px] font-bold uppercase rounded px-2 py-0.5">
              Live Connection
            </span>
          </div>
          <p className="text-xs text-stone-600 max-w-xl">
            Real-time control over Omani rentals, customer itineraries, active vehicle rates, custom photography updates, and dynamic demand pricing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchBookings();
              fetchFleetOverrides();
            }}
            title="Refresh Server Sync"
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 p-2.5 rounded-lg border border-stone-200 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white text-xs font-bold px-4 py-2.5 rounded-lg border border-stone-950 transition cursor-pointer"
          >
            Lock Terminal
          </button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-stone-500 font-mono font-bold uppercase block">Total Bookings</span>
          <p className="text-xl font-black text-stone-900 font-display flex items-baseline gap-1">
            {totalBookingsCount} <span className="text-[10px] text-stone-400 font-normal">reservations</span>
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-[#2D7A82] font-mono font-bold uppercase block">Active Expeditions</span>
          <p className="text-xl font-black text-[#2D7A82] font-display flex items-baseline gap-1">
            {activeBookingsCount} <span className="text-[10px] text-stone-400 font-normal">confirmed</span>
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-[#C47E5A] font-mono font-bold uppercase block">Projected Income</span>
          <p className="text-xl font-black text-[#C47E5A] font-display flex items-baseline gap-1">
            {totalProjectedIncome.toFixed(1)} OMR
            <span className="text-xs text-stone-500 font-normal ml-1">
              (~${(totalProjectedIncome * 2.6).toFixed(0)})
            </span>
          </p>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-stone-500 font-mono font-bold uppercase block">Dynamic Pricing</span>
          <div className="flex items-center gap-2 pt-1">
            <span className={`h-2.5 w-2.5 rounded-full ${dynamicPricingEnabled ? 'bg-[#2D7A82]' : 'bg-stone-300'}`}></span>
            <span className="text-xs font-bold text-stone-700">
              {dynamicPricingEnabled ? `Enabled (+${Math.round((occupancyFactor - 1) * 100)}%)` : 'Standard Rates'}
            </span>
          </div>
        </div>
      </div>

      {/* Nav Row */}
      <div className="flex border-b border-stone-200 gap-6">
        <button
          onClick={() => setAdminTab('reservations')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
            adminTab === 'reservations' ? 'text-[#2D7A82] border-b-2 border-[#2D7A82]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          Reservations Schedule ({totalBookingsCount})
        </button>

        <button
          onClick={() => setAdminTab('fleet')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
            adminTab === 'fleet' ? 'text-[#2D7A82] border-b-2 border-[#2D7A82]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Settings className="h-4 w-4" />
          Fleet Rates & Photos ({vehicles.length})
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
            adminTab === 'settings' ? 'text-[#2D7A82] border-b-2 border-[#2D7A82]' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Dynamic pricing engine
        </button>
      </div>

      {/* TAB Content: RESERVATIONS */}
      {adminTab === 'reservations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 p-4 border border-stone-200/60 rounded-xl">
            <div>
              <h4 className="text-sm font-bold text-stone-900">Schedules Database</h4>
              <p className="text-[11px] text-stone-500">Modify existing, view passenger flight placards, or insert manually.</p>
            </div>
            
            <button
              onClick={() => setIsNewBookingModalOpen(true)}
              className="bg-[#2D7A82] hover:bg-[#205b61] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Create Manual Booking
            </button>
          </div>

          {isLoadingBookings ? (
            <div className="text-center py-12 text-stone-400 space-y-2">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#2D7A82]" />
              <p className="text-xs">Synchronizing schedules with Muscat hub...</p>
            </div>
          ) : bookingsList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
              <p className="text-sm text-stone-500">No active reservations stored in local server.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: List of Booking IDs */}
              <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {bookingsList.map((booking) => {
                  const hasCar = booking.type !== 'tourism';
                  const carObj = vehicles.find(v => v.id === booking.vehicleId);
                  
                  return (
                    <button
                      key={booking.bookingId}
                      onClick={() => setSelectedBooking(booking)}
                      className={`w-full text-left p-4 border rounded-xl transition-all duration-200 flex flex-col gap-2 cursor-pointer ${
                        selectedBooking?.bookingId === booking.bookingId
                          ? 'bg-[#EBF5F6] border-[#2D7A82]/60 shadow-sm'
                          : 'bg-stone-50/40 hover:bg-stone-50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-stone-900">
                          #{booking.bookingId}
                        </span>
                        
                        <span className={`text-[9px] font-bold uppercase tracking-wider rounded px-2 py-0.5 ${
                          booking.status === 'delivered'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : booking.status === 'confirmed'
                            ? 'bg-blue-50 border border-blue-200 text-blue-700'
                            : 'bg-amber-50 border border-amber-200 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h5 className="text-xs font-extrabold text-stone-800">{booking.customerName}</h5>
                        <p className="text-[10px] text-stone-500 font-mono">
                          {booking.pickupDate} ({booking.rentalDays || 1} Days)
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 text-[10px] text-stone-600">
                        <span>{hasCar && carObj ? `${carObj.manufacturer} ${carObj.make}` : 'Tourism Package Only'}</span>
                        <strong className="text-stone-900 font-bold">{booking.totalPrice} OMR</strong>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Reservation Details Display */}
              <div className="lg:col-span-7 bg-[#FCFBFA] border border-stone-200 rounded-xl p-5 space-y-4">
                {selectedBooking ? (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Header Row */}
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-stone-900">
                          Reservation Details
                        </h4>
                        <span className="text-xs font-mono font-bold text-[#C47E5A]">
                          #{selectedBooking.bookingId}
                        </span>
                      </div>

                      {/* Status select buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateBookingStatus(selectedBooking.bookingId, 'pending')}
                          className={`text-[9px] font-bold px-2 py-1 rounded transition border ${
                            selectedBooking.status === 'pending'
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(selectedBooking.bookingId, 'confirmed')}
                          className={`text-[9px] font-bold px-2 py-1 rounded transition border ${
                            selectedBooking.status === 'confirmed'
                              ? 'bg-blue-500 text-white border-blue-600'
                              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          Confirmed
                        </button>
                        <button
                          onClick={() => handleUpdateBookingStatus(selectedBooking.bookingId, 'delivered')}
                          className={`text-[9px] font-bold px-2 py-1 rounded transition border ${
                            selectedBooking.status === 'delivered'
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                          }`}
                        >
                          Delivered
                        </button>
                      </div>
                    </div>

                    {/* Section 1: Customer Details */}
                    <div className="bg-white p-3 border border-stone-150 rounded-lg space-y-2">
                      <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-[#2D7A82]">
                        1. Passenger Details
                      </h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[9px]">Name:</span>
                          <span className="font-bold text-stone-800">{selectedBooking.customerName}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px]">Email:</span>
                          <span className="font-bold text-stone-800 font-mono break-all">{selectedBooking.customerEmail}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px]">Phone / WhatsApp:</span>
                          <span className="font-bold text-stone-800 font-mono">{selectedBooking.customerPhone}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px]">Language:</span>
                          <span className="font-bold text-stone-800 uppercase font-mono">{selectedBooking.language}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Route & Pickup Details */}
                    <div className="bg-white p-3 border border-stone-150 rounded-lg space-y-2">
                      <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-[#2D7A82]">
                        2. Route & Logistics
                      </h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[9px]">Pickup:</span>
                          <span className="font-bold text-stone-800">{selectedBooking.pickupLocation}</span>
                          <span className="text-[10px] text-stone-500 block font-mono">
                            {selectedBooking.pickupDate} @ {selectedBooking.pickupTime || '10:00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px]">Dropoff:</span>
                          <span className="font-bold text-stone-800">{selectedBooking.dropoffLocation}</span>
                          <span className="text-[10px] text-stone-500 block font-mono">
                            {selectedBooking.dropoffDate} @ {selectedBooking.dropoffTime || '10:00'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px]">Flight details:</span>
                          <span className="font-bold text-stone-800">
                            {selectedBooking.flightNumber ? (
                              <span className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-[10px]">{selectedBooking.flightNumber}</span>
                            ) : (
                              'No Flight'
                            )}
                          </span>
                          {selectedBooking.airlineCarrier && (
                            <span className="text-[10px] text-stone-500 block">{selectedBooking.airlineCarrier}</span>
                          )}
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px]">Airport Placard Sign:</span>
                          <span className="font-bold text-[#C47E5A]">
                            {selectedBooking.placardText ? `"${selectedBooking.placardText}"` : 'None'}
                          </span>
                        </div>
                        {selectedBooking.luggageCount !== undefined && (
                          <div>
                            <span className="text-stone-400 block text-[9px]">Baggage Count:</span>
                            <span className="font-bold text-stone-800">{selectedBooking.luggageCount} bags</span>
                          </div>
                        )}
                        {selectedBooking.connectingFlight && (
                          <div>
                            <span className="text-stone-400 block text-[9px]">Connection status:</span>
                            <span className="font-bold text-stone-800">{selectedBooking.connectingFlight}</span>
                          </div>
                        )}
                      </div>
                      
                      {selectedBooking.customerPickupDetails && (
                        <div className="border-t border-stone-100 pt-2 mt-1">
                          <span className="text-stone-400 block text-[9px]">Customer Instructions:</span>
                          <p className="text-xs text-stone-600 italic">"{selectedBooking.customerPickupDetails}"</p>
                        </div>
                      )}
                    </div>

                    {/* Section 3: Package Selections */}
                    <div className="bg-white p-3 border border-stone-150 rounded-lg space-y-2">
                      <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-[#2D7A82]">
                        3. Selections Details
                      </h5>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <div>
                          <span className="text-stone-400 block text-[9px]">Rental Vehicle:</span>
                          <span className="font-bold text-stone-800">
                            {selectedBooking.vehicleId 
                              ? vehicles.find(v => v.id === selectedBooking.vehicleId)?.make || selectedBooking.vehicleId.toUpperCase() 
                              : 'None'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px]">Insurance Coverage:</span>
                          <span className="font-bold text-stone-800">
                            {selectedBooking.insurancePackageId || 'Basic Third Party'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px]">Camping Gear Add-ons:</span>
                          <span className="font-bold text-stone-800 text-[10px]">
                            {selectedBooking.selectedCampingGearIds && selectedBooking.selectedCampingGearIds.length > 0
                              ? selectedBooking.selectedCampingGearIds.join(', ')
                              : 'None Selected'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[9px]">Wilderness Trek Package:</span>
                          <span className="font-bold text-stone-800">
                            {selectedBooking.tourismPackageId
                              ? TOURISM_PACKAGES.find(t => t.id === selectedBooking.tourismPackageId)?.name || selectedBooking.tourismPackageId 
                              : 'None'}
                          </span>
                          {selectedBooking.travelersCount && (
                            <span className="text-[10px] text-stone-500 block">Travelers: {selectedBooking.travelersCount}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Pricing */}
                    <div className="bg-[#FAF8F5] border border-dashed border-[#2D7A82]/30 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-stone-500 text-[10px] font-mono block">Grand Total Billing</span>
                        <div className="flex items-baseline gap-1.5">
                          <strong className="text-base font-black text-[#2D7A82]">
                            {selectedBooking.totalPrice} OMR
                          </strong>
                          <span className="text-xs text-stone-500">
                            (~${(selectedBooking.totalPrice * 2.6).toFixed(1)} USD)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-stone-400 text-[9px] block">Payment Selection</span>
                        <span className="text-[11px] font-bold text-stone-700 block uppercase">
                          {selectedBooking.paymentMethod === 'credit-card' ? '🔒 Paid Card' : '💵 On Arrival'}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar: Print, Download, Delete */}
                    <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {onDownloadPdf && (
                          <>
                            <button
                              onClick={() => onDownloadPdf(selectedBooking, 'download')}
                              className="bg-[#2D7A82] hover:bg-[#205b61] text-white text-xs font-bold px-3.5 py-2.5 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                              title="Download PDF Receipt"
                            >
                              <Download className="h-4 w-4" /> Download PDF
                            </button>
                            
                            <button
                              onClick={() => onDownloadPdf(selectedBooking, 'print')}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-3.5 py-2.5 rounded-lg border border-stone-200 transition flex items-center gap-1.5 cursor-pointer"
                              title="Print Receipt"
                            >
                              <Printer className="h-4 w-4" /> Print Document
                            </button>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteBooking(selectedBooking.bookingId)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-2 rounded-lg border border-red-200 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" /> Purge Reservation
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 text-stone-400 space-y-2">
                    <FileText className="h-10 w-10 text-stone-300" />
                    <p className="text-xs font-bold text-stone-500">No Reservation Selected</p>
                    <p className="text-[10px] text-stone-400 max-w-xs">Select any booking code from the schedules column to display passenger details, placard signatures, and billing receipts.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB Content: FLEET MANAGER */}
      {adminTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50 p-4 border border-stone-200/60 rounded-xl">
            <div>
              <h4 className="text-sm font-bold text-stone-900">Adventure Fleet Directory</h4>
              <p className="text-[11px] text-stone-500">Manually overwrite daily rates or modify vehicle visual marketing photos.</p>
            </div>
            
            <button
              onClick={resetFleetOverrides}
              className="bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-bold px-4 py-2.5 rounded-lg border border-stone-950 transition flex items-center gap-1.5 cursor-pointer"
            >
              Reset All Rates
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v) => {
              const isEditing = editingVehicleId === v.id;
              
              return (
                <div key={v.id} className="bg-stone-50/40 border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between">
                  
                  {/* Photo area with fallback */}
                  <div className="h-40 relative bg-stone-100">
                    <img
                      src={v.image}
                      alt={v.make}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    <span className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-sm text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      {v.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-500 font-mono font-bold uppercase">{v.manufacturer}</span>
                        <span className="text-[10px] text-stone-400 font-mono">ID: {v.id}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-stone-900">{v.make} ({v.year})</h4>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 bg-white p-3 border border-stone-200 rounded-lg">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-stone-500 uppercase block">Daily Rate (OMR)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editingVehiclePrice}
                            onChange={(e) => setEditingVehiclePrice(e.target.value)}
                            className="w-full text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 focus:outline-none"
                            placeholder="e.g. 42.5"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-stone-500 uppercase block">Image URL</label>
                          <input
                            type="text"
                            value={editingVehicleImage}
                            onChange={(e) => setEditingVehicleImage(e.target.value)}
                            className="w-full text-xs bg-stone-50 border border-stone-200 rounded px-2 py-1 focus:outline-none font-mono"
                            placeholder="Unsplash absolute URL"
                          />
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <button
                            onClick={() => updateVehicleOverride(v.id, Number(editingVehiclePrice), editingVehicleImage)}
                            className="bg-[#2D7A82] hover:bg-[#205b61] text-white text-[10px] font-bold px-2 py-1 rounded transition cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingVehicleId(null)}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-1 rounded transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-stone-150">
                        <div>
                          <span className="text-stone-500 text-[9px] block">Rate Per Day</span>
                          <strong className="text-stone-900 text-sm font-black">{v.pricePerDay} OMR</strong>
                        </div>

                        <button
                          onClick={() => {
                            setEditingVehicleId(v.id);
                            setEditingVehiclePrice(v.pricePerDay.toString());
                            setEditingVehicleImage(v.image);
                          }}
                          className="text-[#2D7A82] hover:text-[#1e545a] text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="h-3 w-3" /> Edit Specs
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB Content: DYNAMIC PRICING MATRIX */}
      {adminTab === 'settings' && (
        <div className="space-y-6 max-w-2xl bg-stone-50/50 p-6 border border-stone-200 rounded-xl">
          <div className="space-y-1 border-b border-stone-200 pb-4">
            <h4 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2D7A82]" />
              Smart Dynamic Pricing Matrix
            </h4>
            <p className="text-xs text-stone-500">
              Configure algorithms that adjust daily rental price rates automatically depending on fleet availability or seasonal demand factors.
            </p>
          </div>

          <div className="space-y-4">
            {/* Toggle Card */}
            <div className="flex items-center justify-between bg-white border border-stone-200 p-4 rounded-lg">
              <div className="space-y-1">
                <span className="text-xs font-bold text-stone-900 block">Dynamic Occupancy Pricing Rules</span>
                <p className="text-[10px] text-stone-500 max-w-sm">
                  When enabled, daily rental prices of vehicles in high demand (vehicles with active reservations during requested dates) will automatically increase by the multiplier specified below to maximize utilization revenue.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dynamicPricingEnabled}
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    setDynamicPricingEnabled(nextVal);
                    saveDynamicPricingConfig(nextVal, occupancyFactor);
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D7A82]"></div>
              </label>
            </div>

            {/* Slider Card */}
            <div className="bg-white border border-stone-200 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Occupancy Demand Surge Factor</span>
                  <p className="text-[10px] text-stone-500 max-w-md">
                    Multiplier factor to raise base prices by when a specific vehicle class is heavily booked or overall availability falls below thresholds.
                  </p>
                </div>
                <span className="bg-stone-100 border border-stone-200 text-stone-800 text-xs font-mono font-extrabold px-3 py-1 rounded">
                  {occupancyFactor.toFixed(2)}x (+{Math.round((occupancyFactor - 1) * 100)}%)
                </span>
              </div>

              <input
                type="range"
                min="1.05"
                max="1.50"
                step="0.05"
                value={occupancyFactor}
                onChange={(e) => {
                  const nextFactor = Number(e.target.value);
                  setOccupancyFactor(nextFactor);
                  if (dynamicPricingEnabled) {
                    saveDynamicPricingConfig(dynamicPricingEnabled, nextFactor);
                  }
                }}
                className="w-full accent-[#2D7A82]"
              />

              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>1.05x (Mild Surge)</span>
                <span>1.25x (Moderate Surge)</span>
                <span>1.50x (Maximum Peak Surge)</span>
              </div>
            </div>

            {/* Simulated Logic Details */}
            <div className="bg-[#EBF5F6] border border-[#BCE1E5] rounded-lg p-4 flex gap-3 text-[#1F5F66]">
              <TrendingUp className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-xs font-extrabold block">How Dynamic Availability Operates:</span>
                <p className="text-[11px] leading-relaxed">
                  The client-side search engine checks if there are already confirmed bookings for the chosen vehicle during the pickup and dropoff window. If dynamic pricing is active, the price will automatically adjust by {((occupancyFactor - 1) * 100).toFixed(0)}% for that vehicle to capture high-season premium value.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: MANUAL BOOKING FORM */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 shadow-2xl rounded-2xl max-w-xl w-full p-6 relative animate-scale-up max-h-[90vh] overflow-y-auto space-y-4">
            
            <button
              onClick={() => setIsNewBookingModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1 border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-1.5">
                <Plus className="h-5 w-5 text-[#2D7A82]" />
                Create Manual Reservation
              </h3>
              <p className="text-xs text-stone-500">Insert custom rental details and billing targets directly into the main calendar scheduler.</p>
            </div>

            <form onSubmit={handleCreateManualBooking} className="grid grid-cols-2 gap-4 text-xs">
              
              <div className="col-span-2 space-y-1">
                <label className="font-bold text-stone-600 block">
                  Customer Name <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={mbName}
                  onChange={(e) => setMbName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D7A82]"
                  placeholder="e.g. Dr. Amjad Al-Busaidi"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">
                  Customer Email <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={mbEmail}
                  onChange={(e) => setMbEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D7A82]"
                  placeholder="e.g. amjad.busaidi@omanpetroleum.com"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">
                  Customer Phone <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={mbPhone}
                  onChange={(e) => setMbPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D7A82]"
                  placeholder="e.g. +968 9481 0291"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">Expedition Type</label>
                <select
                  value={mbType}
                  onChange={(e: any) => {
                    setMbType(e.target.value);
                    setMbVehicleId('');
                    setMbTourId('');
                    setMbInsuranceId('');
                  }}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800"
                >
                  <option value="rental">4WD Car Rental Only</option>
                  <option value="tourism">Oman Sightseeing Tour Only</option>
                  <option value="combo">Combo Combo Package (Car + Tour)</option>
                </select>
              </div>

              {mbType !== 'tourism' && (
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 block">
                    Select Vehicle <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <select
                    value={mbVehicleId}
                    required
                    onChange={(e) => setMbVehicleId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D7A82]"
                  >
                    <option value="">-- Choose Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.manufacturer} {v.make} ({v.pricePerDay} OMR/day)</option>
                    ))}
                  </select>
                </div>
              )}

              {mbType !== 'rental' && (
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 block">
                    Select Tour Package <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <select
                    value={mbTourId}
                    required
                    onChange={(e) => setMbTourId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D7A82]"
                  >
                    <option value="">-- Choose Tour --</option>
                    {TOURISM_PACKAGES.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.pricePerPerson} OMR/person)</option>
                    ))}
                  </select>
                </div>
              )}

              {mbType !== 'rental' && (
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 block">Travelers Count</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={mbTravelers}
                    onChange={(e) => setMbTravelers(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">Pickup Office/Station</label>
                <select
                  value={mbPickupLoc}
                  onChange={(e) => setMbPickupLoc(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 font-mono"
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">Dropoff Office/Station</label>
                <select
                  value={mbDropoffLoc}
                  onChange={(e) => setMbDropoffLoc(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 font-mono"
                >
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">Pickup Date</label>
                <input
                  type="date"
                  value={mbPickupDate}
                  onChange={(e) => setMbPickupDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-600 block">Dropoff Date</label>
                <input
                  type="date"
                  value={mbDropoffDate}
                  onChange={(e) => setMbDropoffDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800"
                />
              </div>

              {mbType !== 'tourism' && (
                <div className="space-y-1">
                  <label className="font-bold text-stone-600 block">
                    Insurance Tier <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <select
                    value={mbInsuranceId}
                    required
                    onChange={(e) => setMbInsuranceId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#2D7A82]"
                  >
                    <option value="">-- Choose Insurance --</option>
                    {INSURANCE_PACKAGES.map(ins => (
                      <option key={ins.id} value={ins.id}>{ins.name} ({ins.pricePerDay} OMR/day)</option>
                    ))}
                  </select>
                </div>
              )}

              {mbType !== 'tourism' && (
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-stone-600 block mb-1">Camping Extras Selected</label>
                  <div className="flex flex-wrap gap-2">
                    {CAMPING_GEAR.map(gear => {
                      const isSelected = mbCampingIds.includes(gear.id);
                      return (
                        <button
                          key={gear.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setMbCampingIds(mbCampingIds.filter(id => id !== gear.id));
                            } else {
                              setMbCampingIds([...mbCampingIds, gear.id]);
                            }
                          }}
                          className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold transition ${
                            isSelected 
                              ? 'bg-[#EBF5F6] border-[#2D7A82] text-[#2D7A82]'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {gear.name} (+{gear.pricePerDay} OMR)
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="col-span-2 pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold px-4 py-2 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2D7A82] hover:bg-[#1e545a] text-white font-bold px-5 py-2 rounded-lg transition shadow-sm cursor-pointer"
                >
                  Submit Reservation
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
