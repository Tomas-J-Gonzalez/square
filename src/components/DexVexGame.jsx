import React, { useState } from 'react';
import Icon from './Icon';

const DexVexGame = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Dex Vex - Puzzle Game</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close game"
          >
            <Icon name="times" style="solid" size="lg" />
          </button>
        </div>
        
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading game...</p>
              </div>
            </div>
          )}
          
          <iframe
            src="/Dex%20Vex.html"
            className="w-full h-[70vh] border-0"
            onLoad={() => setIsLoading(false)}
            title="Dex Vex Game"
            allow="fullscreen"
          />
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center">
            Click and rotate the blocks to connect all the paths. Complete each level to advance!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DexVexGame;
