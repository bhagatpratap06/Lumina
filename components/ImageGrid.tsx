
import React from 'react';
import { GeneratedImage } from '../types';

interface ImageGridProps {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onDelete }) => {
  const handleDownload = (url: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `lumina-${prompt.slice(0, 20).replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="w-16 h-16 mb-4 opacity-20">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium">No images generated yet</p>
        <p className="text-sm">Start by entering a prompt above</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {images.map((img) => (
        <div key={img.id} className="group relative glass rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02]">
          <div className="aspect-square w-full overflow-hidden bg-gray-900">
            <img 
              src={img.url} 
              alt={img.prompt} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <p className="text-white text-sm line-clamp-2 mb-4 font-medium italic">"{img.prompt}"</p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleDownload(img.url, img.prompt)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1h16v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
              <button 
                onClick={() => onDelete(img.id)}
                className="p-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-all"
                title="Delete image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          <div className="absolute top-3 left-3 px-2 py-1 glass rounded text-[10px] font-bold tracking-wider text-white/70">
            {img.aspectRatio}
          </div>
        </div>
      ))}
    </div>
  );
};
