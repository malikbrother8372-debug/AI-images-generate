
import React from 'react';
import { GeneratedImage } from '../types';
import Spinner from './Spinner';

interface ImageCardProps {
  image: GeneratedImage;
}

const StatusIndicator: React.FC<{ status: GeneratedImage['status'] }> = ({ status }) => {
  const baseClasses = 'absolute top-3 right-3 text-xs font-bold uppercase px-2 py-1 rounded-full text-white';
  switch (status) {
    case 'generating':
      return <div className={`${baseClasses} bg-blue-500`}>Generating</div>;
    case 'success':
      return <div className={`${baseClasses} bg-green-500`}>Done</div>;
    case 'error':
      return <div className={`${baseClasses} bg-red-500`}>Error</div>;
    default:
      return <div className={`${baseClasses} bg-gray-500`}>Pending</div>;
  }
};

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-cyan-500/50">
      <div className="relative aspect-square bg-gray-700 flex items-center justify-center">
        {image.status === 'generating' && <Spinner />}
        {image.status === 'error' && (
          <div className="p-4 text-center text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{image.error || 'Failed to generate.'}</p>
          </div>
        )}
        {image.imageUrl && (
          <img src={image.imageUrl} alt={image.prompt} className="w-full h-full object-cover" />
        )}
        <StatusIndicator status={image.status} />
      </div>
      <div className="p-4 bg-gray-800/50">
        <p className="text-sm text-gray-300 font-mono truncate" title={image.prompt}>
          {image.prompt}
        </p>
      </div>
    </div>
  );
};

export default ImageCard;
