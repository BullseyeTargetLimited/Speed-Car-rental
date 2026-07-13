import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, ShieldCheck, MapPin, X, AlertTriangle } from 'lucide-react';

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
  timestamp: string;
}

interface PushNotificationManagerProps {
  notifications: PushNotification[];
  onDismiss: (id: string) => void;
}

export default function PushNotificationManager({ notifications, onDismiss }: PushNotificationManagerProps) {
  return (
    <div className="fixed top-6 right-6 z-50 space-y-3 w-80 md:w-96 max-w-[calc(100vw-3rem)]">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-slide-in relative overflow-hidden"
        >
          {/* Subtle colored accent line on the edge */}
          <div
            className={`absolute top-0 bottom-0 left-0 w-1.5 ${
              n.type === 'success'
                ? 'bg-emerald-500'
                : n.type === 'warning'
                ? 'bg-amber-500'
                : 'bg-teal-500'
            }`}
          ></div>

          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            {n.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            ) : n.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            ) : (
              <Bell className="h-5 w-5 text-teal-400 animate-swing" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-bold text-white tracking-tight">{n.title}</p>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              {n.message}
            </p>
            <span className="text-[9px] font-mono text-slate-500 mt-2 block">
              {n.timestamp} • In-App Notification Engine
            </span>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => onDismiss(n.id)}
            className="text-slate-500 hover:text-slate-300 transition shrink-0 self-start p-0.5 hover:bg-slate-800 rounded cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
