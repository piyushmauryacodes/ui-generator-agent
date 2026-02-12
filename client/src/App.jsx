import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LiveProvider, LiveError, LivePreview } from 'react-live';
import { Scope } from './components/UIComponents';
import { Send, RotateCcw, Code, Eye, Loader2, History } from 'lucide-react';

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("<Container>\n  <Alert type='info'>Describe a UI to generate it!</Alert>\n</Container>");
  const [explanation, setExplanation] = useState("Ready to generate.");
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState([]);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'code'

  // Scroll to bottom of chat
  const chatEndRef = useRef(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      axios.post(`${API_URL}/api/generate`, {
        userPrompt: prompt,
        currentCode: code
      });

      setCode(res.data.code);
      setExplanation(res.data.explanation);
      fetchVersions();
      setPrompt(""); // Clear input
    } catch (err) {
      alert("Error: Ensure Backend is running on port 5000");
    }
    setLoading(false);
  };

  const fetchVersions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/versions`);
      setVersions(res.data);
    } catch (e) { console.error("No backend connection"); }
  };

  useEffect(() => { fetchVersions(); }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">

      {/* --- LEFT PANEL: Chat Interface --- */}
      <div className="w-[400px] flex flex-col border-r border-gray-700 bg-gray-800">

        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-400">⚡</span> UI Agent
          </h1>
        </div>

        {/* History / Explanations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Welcome Message */}
          <div className="bg-gray-700/50 p-4 rounded-lg text-sm text-gray-300">
            <p>Welcome. I am a deterministic UI generator.</p>
            <p className="mt-2 text-gray-400 text-xs">Supported: Card, Button, Input, Alert, Row, Col.</p>
          </div>

          {/* Current Status */}
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
            <div className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wide">AI Reasoning</div>
            <p className="text-sm text-blue-100 leading-relaxed">{explanation}</p>
          </div>

          {/* Version History List */}
          {versions.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase">
                <History size={12} /> Recent Versions
              </div>
              <div className="space-y-2">
                {versions.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => setCode(v.code)}
                    className="w-full text-left p-3 rounded bg-gray-700/30 hover:bg-gray-700 border border-transparent hover:border-gray-600 transition-all text-xs truncate group"
                  >
                    <div className="font-medium text-gray-300 group-hover:text-white">{v.prompt}</div>
                    <div className="text-gray-500 mt-1">{new Date(v.timestamp).toLocaleTimeString()}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-700">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe a UI (e.g., 'A login card with email and password')..."
              className="w-full bg-gray-800 text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24 text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: Preview & Code --- */}
      <div className="flex-1 flex flex-col bg-gray-100">

        {/* Toolbar */}
        <div className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${activeTab === 'preview' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Eye size={16} /> Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${activeTab === 'code' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Code size={16} /> Generated Code
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            <span className="text-xs text-gray-500 font-medium">Live Environment</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <LiveProvider code={code} scope={Scope} noInline={false}>

            {/* PREVIEW TAB */}
            <div className={`absolute inset-0 p-8 overflow-auto transition-opacity duration-300 ${activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="max-w-4xl mx-auto">
                <LiveError className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 border border-red-200 font-mono text-sm" />
                <LivePreview />
              </div>
            </div>

            {/* CODE TAB */}
            <div className={`absolute inset-0 bg-gray-900 p-6 overflow-auto transition-opacity duration-300 ${activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap">{code}</pre>
            </div>

          </LiveProvider>
        </div>
      </div>

    </div>
  );
};

export default App;