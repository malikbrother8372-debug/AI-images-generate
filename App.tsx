
import React, { useState, useCallback } from 'react';
import { GeneratedImage } from './types';
import { generateImageFromPrompt } from './services/geminiService';
import ImageCard from './components/ImageCard';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [prompts, setPrompts] = useState<string>('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9_.-]/gi, '_').substring(0, 50);
  };

  const downloadImage = useCallback((imageUrl: string, prompt: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${sanitizeFilename(prompt)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleGenerate = async () => {
    const promptList = prompts.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    if (promptList.length === 0) {
      setGlobalError("Please enter at least one prompt.");
      return;
    }

    setIsGenerating(true);
    setGlobalError(null);

    const initialImages: GeneratedImage[] = promptList.map((prompt, index) => ({
      id: `${Date.now()}-${index}`,
      prompt,
      imageUrl: null,
      status: 'pending',
    }));
    setImages(initialImages);
    
    for (let i = 0; i < promptList.length; i++) {
        const currentPrompt = promptList[i];
        
        // Update status to 'generating'
        setImages(prev => prev.map((img, index) => index === i ? { ...img, status: 'generating' } : img));

        try {
            const base64Data = await generateImageFromPrompt(currentPrompt);
            const imageUrl = `data:image/png;base64,${base64Data}`;
            
            // Update status to 'success' and add imageUrl
            setImages(prev => prev.map((img, index) => index === i ? { ...img, status: 'success', imageUrl } : img));
            downloadImage(imageUrl, currentPrompt);
        } catch (error) {
            console.error(`Failed to generate image for prompt: "${currentPrompt}"`, error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            // Update status to 'error'
            setImages(prev => prev.map((img, index) => index === i ? { ...img, status: 'error', error: errorMessage } : img));
        }
    }

    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 font-sans">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-2">
                AI Image Batch Generator
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
                Generate multiple high-quality images with Imagen. Enter prompts (one per line) and download them automatically.
            </p>
        </header>

        <main className="bg-gray-800/50 rounded-xl shadow-2xl p-6 backdrop-blur-sm border border-gray-700">
            <div className="mb-6">
                <label htmlFor="prompts" className="block text-lg font-medium text-gray-300 mb-2">Enter Your Prompts</label>
                <textarea
                    id="prompts"
                    value={prompts}
                    onChange={(e) => setPrompts(e.target.value)}
                    placeholder="A majestic lion in a futuristic city, at sunset&#xA;A robot painting a masterpiece on a canvas&#xA;A serene underwater world filled with glowing jellyfish"
                    rows={8}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 text-gray-200 placeholder-gray-500 disabled:opacity-50"
                    disabled={isGenerating}
                />
            </div>

            {globalError && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4" role="alert">
                <span className="block sm:inline">{globalError}</span>
              </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={isGenerating || prompts.trim().length === 0}
                className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
                {isGenerating ? (
                    <>
                        <Spinner className="w-5 h-5 mr-3" />
                        Generating Images...
                    </>
                ) : (
                    'Generate & Download Images'
                )}
            </button>

            {images.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-200 border-b border-gray-700 pb-2">Generated Images</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {images.map((image) => (
                        <ImageCard key={image.id} image={image} />
                    ))}
                </div>
              </div>
            )}

            {images.length === 0 && !isGenerating && (
                 <div className="mt-8 text-center text-gray-500 py-12 border-2 border-dashed border-gray-700 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-4">Your generated images will appear here.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
};

export default App;
