'use client';

import { ChangeEvent } from 'react';

interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function IntensitySlider({ value, onChange }: IntensitySliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  // Get description based on intensity level
  const getIntensityDescription = (level: number) => {
    if (level <= 3) return 'Minimal changes';
    if (level <= 4) return 'Conservative';
    if (level <= 7) return 'Moderate';
    return 'Full technique';
  };

  return (
    <div className="intensity-control w-full max-w-md">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="intensity" className="text-lg font-semibold text-gray-800">
          Technique Intensity
        </label>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-purple-600">
            {value}
          </span>
          <span className="text-sm text-gray-600">
            / 10
          </span>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          id="intensity"
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          min="1"
          max="10"
          value={value}
          onChange={handleChange}
          aria-label="Vocal technique intensity level"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={value}
          aria-valuetext={`Intensity level ${value}: ${getIntensityDescription(value)}`}
        />
        
        {/* Progress fill */}
        <div 
          className="absolute top-0 left-0 h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg pointer-events-none"
          style={{ width: `${(value - 1) * 11.11}%` }}
        />
        
        {/* Tick marks */}
        <div className="flex justify-between mt-1 px-1">
          {[1, 4, 8].map(num => (
            <span key={num} className="text-xs text-gray-500 font-medium">
              {num}
            </span>
          ))}
        </div>
      </div>
      
      <p className="mt-2 text-sm text-gray-600 text-center">
        {getIntensityDescription(value)}
      </p>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 0 0 2px #7c3aed;
          cursor: pointer;
          position: relative;
          z-index: 10;
          transition: transform 0.1s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 3px #7c3aed;
        }

        .slider::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }

        .slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 0 0 2px #7c3aed;
          cursor: pointer;
          border: none;
          position: relative;
          z-index: 10;
          transition: transform 0.1s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 3px #7c3aed;
        }

        .slider::-moz-range-thumb:active {
          transform: scale(0.95);
        }

        .slider:focus {
          outline: none;
        }

        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 4px #7c3aed, 0 0 0 6px rgba(124, 58, 237, 0.3);
        }

        .slider:focus::-moz-range-thumb {
          box-shadow: 0 2px 6px rgba(0,0,0,0.3), 0 0 0 4px #7c3aed, 0 0 0 6px rgba(124, 58, 237, 0.3);
        }
      `}</style>
    </div>
  );
}