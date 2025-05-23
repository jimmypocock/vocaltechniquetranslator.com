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

  return (
    <div className="intensity-control flex items-center gap-2.5">
      <label htmlFor="intensity" className="font-semibold text-gray-800">
        Intensity:
      </label>
      <input
        type="range"
        id="intensity"
        className="intensity-slider"
        min="1"
        max="10"
        value={value}
        onChange={handleChange}
      />
      <span className="intensity-value font-bold text-[#667eea] text-xl min-w-[20px]">
        {value}
      </span>
      <style jsx>{`
        .intensity-slider {
          width: 200px;
          height: 6px;
          border-radius: 3px;
          background: #ddd;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .intensity-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        .intensity-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}