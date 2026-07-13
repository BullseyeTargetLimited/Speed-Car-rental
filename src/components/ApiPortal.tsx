import React, { useState } from 'react';
import { Terminal, Key, Copy, Check, Play, RefreshCw, Layers, Shield } from 'lucide-react';
import { TRANSLATIONS } from '../data';

export default function ApiPortal({ lang }: { lang: 'en' | 'ar' | 'fr' }) {
  const t = TRANSLATIONS[lang];
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'nodejs' | 'curl' | 'python'>('curl');

  const generateKey = () => {
    const randomHex = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setApiKey(`sp_live_2009_oman_${randomHex}`);
    setSandboxResult(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSandbox = async () => {
    if (!apiKey) return;
    setIsLoading(true);
    try {
      // Fetch directly from our server's real REST API endpoint!
      const response = await fetch(`/api/external/vehicles`, {
        headers: {
          'x-api-key': apiKey
        }
      });
      const data = await response.json();
      setSandboxResult(data);
    } catch (err: any) {
      setSandboxResult({ error: "Sandbox Request Failed", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const codeSnippets = {
    curl: `curl -X GET "${window.location.origin}/api/external/vehicles" \\\n  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}"`,
    nodejs: `const fetch = require('node-fetch');\n\nfetch('${window.location.origin}/api/external/vehicles', {\n  headers: {\n    'x-api-key': '${apiKey || 'YOUR_API_KEY'}'\n  }\n})\n.then(res => res.json())\n.then(json => console.log(json));`,
    python: `import requests\n\nurl = "${window.location.origin}/api/external/vehicles"\nheaders = {\n    "x-api-key": "${apiKey || 'YOUR_API_KEY'}"\n}\n\nresponse = requests.get(url, headers=headers)\nprint(response.json())`
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Terminal className="text-[#4B9CB5] h-6 w-6 animate-pulse" />
          <div>
            <h3 className="text-xl font-bold tracking-tight">{t.apiTitle}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sync vehicle inventory, camping accessories, and tour availability for Booking.com & Kayak.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-full text-xs font-mono text-slate-400 border border-slate-800">
          <Shield className="h-3 w-3 text-teal-400" />
          <span>v1.2 REST OpenAPI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Step 1: Key Generator & Live Sandbox */}
        <div className="space-y-6">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-semibold text-teal-400 mb-2 flex items-center gap-1.5">
              <Key className="h-4 w-4" />
              1. Generate Sandbox Credentials
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Authorized rental platforms use an API key token to request real-time vehicle slots. Generate an active key to execute sandbox tests.
            </p>

            {apiKey ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded text-xs font-mono text-teal-300 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy Key"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ) : (
              <button
                onClick={generateKey}
                className="w-full bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="h-4 w-4" />
                Generate Sandbox API Key
              </button>
            )}
          </div>

          {/* Real API Sandbox triggers the live endpoint! */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-sm font-semibold text-teal-400 mb-2 flex items-center gap-1.5">
              <Play className="h-4 w-4" />
              2. Live Endpoint Sandbox
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Submit a mock secure request to <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded font-mono">GET /api/external/vehicles</code> to fetch active SPEED rental fleet.
            </p>

            <button
              onClick={runSandbox}
              disabled={!apiKey || isLoading}
              className={`w-full text-xs font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !apiKey
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Requesting Server...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Execute Sandbox Request
                </>
              )}
            </button>

            {/* Response Console */}
            {sandboxResult && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-slate-400 mb-1">Live Server JSON Response:</p>
                <pre className="bg-slate-900 text-[10px] font-mono p-3 rounded-lg overflow-x-auto max-h-48 text-emerald-300 border border-slate-800">
                  {JSON.stringify(sandboxResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Code Snippets & Sync Architecture */}
        <div className="flex flex-col justify-between">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex-1">
            <h4 className="text-sm font-semibold text-teal-400 mb-3 flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              3. Integration Snippets for Aggregators
            </h4>
            
            {/* Snippet Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-2 mb-3">
              {(['curl', 'nodejs', 'python'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs font-semibold rounded transition cursor-pointer ${
                    activeTab === tab
                      ? 'bg-slate-800 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'curl' ? 'cURL' : tab === 'nodejs' ? 'NodeJS' : 'Python'}
                </button>
              ))}
            </div>

            {/* Code Highlight */}
            <pre className="bg-slate-900 text-[11px] font-mono p-4 rounded-lg overflow-x-auto text-slate-300 leading-relaxed border border-slate-800 max-h-56">
              {codeSnippets[activeTab]}
            </pre>
          </div>

          <div className="mt-4 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">OTA Platform Notice (Kayak & Booking.com):</p>
            <p className="text-[11px] leading-relaxed">
              We sync inventory updates every 5 minutes automatically via standard webhook payloads. For custom rate-limiting limits or corporate XML specs, email us at <span className="text-teal-400">partners@speedcarrental.net</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
