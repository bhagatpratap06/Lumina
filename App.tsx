
import React, { useState, useEffect, useCallback } from 'react';
import { AspectRatio, GeneratedImage, GenerationSettings } from './types';
import { ASPECT_RATIOS, APP_VERSION } from './constants';
import { generateAIImage } from './services/geminiService';
import { ImageGrid } from './components/ImageGrid';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({ aspectRatio: '1:1' });
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lumina_history');
    if (saved) {
      try {
        setImages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('lumina_history', JSON.stringify(images));
  }, [images]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateAIImage(prompt, settings.aspectRatio);
      
      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
        aspectRatio: settings.aspectRatio,
      };

      setImages(prev => [newImage, ...prev]);
      setPrompt(''); // Optional: clear prompt after success
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteImage = useCallback((id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear your history?")) {
      setImages([]);
    }
  };

  return (
    <div className="min-h-screen selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24">
        {/* Header Section */}
        <header className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            V{APP_VERSION} Powered by Gemini
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Lumina</span>
            <span className="text-white"> AI</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Unleash your creativity. Transform simple words into breathtaking visuals with our state-of-the-art AI image generator.
          </p>
        </header>

        {/* Input Control Section */}
        <section className="mb-16">
          <div className="glass rounded-[2rem] p-4 md:p-8 shadow-2xl relative">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic city with floating neon gardens, cinematic lighting, ultra-detailed..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-lg md:text-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[140px] resize-none transition-all duration-300 group-hover:bg-black/50"
                  disabled={isGenerating}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-500 pointer-events-none">
                  {prompt.length} characters
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="w-full md:w-auto">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 block px-1">
                    Aspect Ratio
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.value}
                        type="button"
                        onClick={() => setSettings({ aspectRatio: ratio.value })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          settings.aspectRatio === ratio.value
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'glass text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                        disabled={isGenerating}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d={ratio.icon} />
                        </svg>
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className={`w-full md:w-auto px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                    isGenerating || !prompt.trim()
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                      : 'gradient-bg text-white hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/30'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Masterpiece
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-bounce">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}
        </section>

        {/* Gallery Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              History
            </h2>
            {images.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-xs font-bold text-gray-500 hover:text-red-400 transition-colors uppercase tracking-widest px-3 py-1 rounded-md hover:bg-red-500/10"
              >
                Clear History
              </button>
            )}
          </div>

          <ImageGrid images={images} onDelete={deleteImage} />
        </section>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-white/5 text-center text-gray-600">
          <p className="text-sm font-medium mb-2">Designed for the future of creativity.</p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
            <span>•</span>
            <a href="#" className="hover:text-indigo-400 transition-colors">Documentation</a>
          </div>
          <p className="mt-8 text-[10px] uppercase tracking-[0.2em] opacity-30">© 2024 Lumina Labs. All Rights Reserved.</p>
        </footer>
      </main>

      {/* Floating loading overlay for a more immersive feel */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center glass bg-black/60 transition-opacity duration-300">
          <div className="flex flex-col items-center gap-6 p-8 rounded-3xl">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 animate-[spin_1.5s_linear_infinite]"></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-l-pink-500 animate-[spin_2s_linear_infinite]"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Painting your pixels...</h3>
              <p className="text-gray-400 text-sm max-w-[200px]">The AI is dreaming up something amazing for you.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
