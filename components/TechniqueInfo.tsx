export default function TechniqueInfo() {
  const techniques = [
    "Conservative transformations maintain lyric readability",
    "Strategic vowel modifications for vocal flow without over-processing",
    "Exception dictionary preserves common words naturally",
    "Syllable breaks only added when beneficial for longer words",
    "Abbreviations and proper nouns handled appropriately",
    "Intensity 1-3: Minimal changes, 4-5: Conservative, 6-7: Moderate, 8-10: Full technique"
  ];

  return (
    <div className="technique-info bg-[#e3f2fd] p-4 rounded-lg mb-5 border-l-4 border-[#2196f3]">
      <h3 className="text-[#1976d2] mb-2.5 font-semibold text-lg">
        Balanced Vocal Technique & Readability
      </h3>
      <ul className="list-none pl-0">
        {techniques.map((technique, index) => (
          <li 
            key={index} 
            className="mb-1 pl-5 relative before:content-['♪'] before:absolute before:left-0 before:text-[#2196f3]"
          >
            {technique}
          </li>
        ))}
      </ul>
    </div>
  );
}