import { useState } from 'react';
import { PhaserGame } from './PhaserGame';

export default function App() {
  const [phase, setPhase] = useState<'start' | 'choose' | 'play'>('start');

  return (
    <div className="w-screen h-screen bg-black text-white flex items-center justify-center">
      {phase === 'start' && (
        <button
          className="text-xl animate-pulse bg-white text-black px-8 py-4 rounded"
          onClick={() => setPhase('choose')}
        >
          START
        </button>
      )}

      {phase === 'choose' && (
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Choose Your Atom</h1>
          <button
            className="bg-blue-500 px-6 py-2 rounded hover:bg-blue-600"
            onClick={() => setPhase('play')}
          >
            Hydrogen
          </button>
        </div>
      )}

      {phase === 'play' && <PhaserGame />}
    </div>
  );
}
