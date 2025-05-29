// DELETE IF NOT USED
interface Example {
  title: string;
  content: string;
}

export default function Examples() {
  const examples: Example[] = [
    {
      title: "Conservative Transformations (Intensity 4-5):",
      content: '"blue jean baby" → "BLUH JAHN BAH-BAY" | "pretty smile" → "PRIH-TEE SMEHL"'
    },
    {
      title: "Moderate Changes (Intensity 6-7):",
      content: '"lady" → "LAH-DEE" | "music man" → "MYOO-SIK MAHN" | "dancing" → "DAHN-SING"'
    },
    {
      title: "Strategic Syllable Breaks (Intensity 8+):",
      content: '"ballerina" → "BAHL-LUH-REH-NAH" | "seamstress" → "SEHM-STRESS"'
    },
    {
      title: "Preserved Elements:",
      content: 'Abbreviations: "L.A." stays "L.A." | Contractions: "you\'ll" → "YAH-LL"'
    }
  ];

  return (
    <div className="examples mt-7 pt-5 border-t-2 border-gray-200">
      <div className="section-title text-xl font-semibold text-gray-800 mb-2.5">
        Improved Readability Examples
      </div>
      {examples.map((example, index) => (
        <div
          key={index}
          className="example mb-4 p-4 bg-[#f8f9fa] rounded-lg border-l-4 border-[#667eea]"
        >
          <div className="example-title font-semibold text-gray-800 mb-1">
            {example.title}
          </div>
          <div className="text-gray-700">
            {example.content}
          </div>
        </div>
      ))}
    </div>
  );
}