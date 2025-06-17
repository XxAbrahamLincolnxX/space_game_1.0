import { useState } from 'react';
import { PhaserGame } from './PhaserGame';

export default function App() {
    const [phase, setPhase] = useState<'start' | 'choose' | 'play'>('start');
    const [showFusionModal, setShowFusionModal] = useState(false);
    const [mass, setMass] = useState(1.00784); // Hydrogen's mass

    return (
        <div className="w-screen h-screen bg-black text-white">
            {/* Centered content */}
            <div className="flex items-center align-middle justify-center h-full bg-amber-600">
                <div>
            <h1 className='text-5xl'>Rogue Atom - Becoming Celestial</h1>
                {/* Start Button */}
                {phase === 'start' && (
                    <button
                        className="text-xl animate-pulse bg-white text-black px-8 py-4 rounded"
                        onClick={() => setPhase('choose')}
                    >
                        START
                    </button>
                )}

                </div>

                {/* Choose Atom */}
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
            </div>

            {/* Game */}
            {phase === 'play' && (
                <>
                    {/* Fullscreen container for Phaser */}
                    <div
                        id="phaser-container"
                        className="fixed inset-0 w-screen h-screen z-10 bg-black"
                    />
                    {/* Phaser game */}
                    <PhaserGame
                        onFusion={() => setShowFusionModal(true)}
                        onMassChange={(value) => setMass(parseFloat(value.toFixed(2)))}
                    />

                    {/* Mass Counter HUD */}
                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded shadow text-sm font-mono z-20">
                        <span className="opacity-70">Mass:</span>{' '}
                        <span className="font-bold">{mass} u</span>
                    </div>
                </>
            )}


            {/* Fusion Upgrade Modal */}
            {showFusionModal && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white text-black p-6 rounded-lg shadow-xl text-center space-y-4 w-[300px]">
                        <h2 className="text-xl font-bold">Fusion Upgrade</h2>
                        <p>Choose an upgrade:</p>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                            onClick={() => setShowFusionModal(false)}
                        >
                            +10% Mass Gain
                        </button>
                        <button
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full"
                            onClick={() => setShowFusionModal(false)}
                        >
                            +Energy Regeneration
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
