'use client';

import { useEffect, useRef } from 'react';
import Modal from './Modal';

interface DexVexGameProps {
  onClose: () => void;
}

export default function DexVexGame({ onClose }: DexVexGameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Auto-play the game when component mounts
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.onload = () => {
        // Try to start the game automatically
        try {
          iframe.contentWindow?.postMessage({ type: 'START_GAME' }, '*');
        } catch (error) {
          console.log('Could not auto-start game');
        }
      };
    }
  }, []);

  return (
    <Modal isOpen={true} onClose={onClose} title="Dex Vex Game" showCloseButton={true}>
      <div className="w-full h-96 relative">
        <iframe
          ref={iframeRef}
          src="/Dex Vex.html"
          className="w-full h-full border-0 rounded-lg"
          title="Dex Vex Game"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Enjoy playing Dex Vex! Use your keyboard to control the game.</p>
        <p className="mt-2">
          <button
            onClick={onClose}
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Close Game
          </button>
        </p>
      </div>
    </Modal>
  );
}
