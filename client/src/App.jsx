import { useState } from 'react';
import UploadComponent from './components/UploadComponent';
import TryOnControls from './components/TryOnControls';
import ResultViewer from './components/ResultViewer';
import StepNav from './components/StepNav';
import { applyHairTryon, applyHairStyleTryon, applyNailTryon } from './services/api';

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [feature, setFeature]           = useState('hairstyle');

  const [hairColor, setHairColor]       = useState('#8B4513');
  const [patternName, setPatternName]   = useState('full');

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [nailColor, setNailColor]           = useState('#FF0000');
  const [nailTexture, setNailTexture]       = useState('cream');
  const [nailEffectType, setNailEffectType] = useState('nail_polish');
  const [nailShape, setNailShape]           = useState('squoval_oval');
  const [nailLength, setNailLength]         = useState(1.0);

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const [step, setStep]             = useState('upload');
  const [completedSteps, setCompletedSteps] = useState(new Set());

  function markComplete(stepId) {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  }

  function handleFileSelect(file, objectUrl) {
    setUploadedFile(file);
    setPreviewUrl(objectUrl);
    setResult(null);
    setError(null);
    markComplete('upload');
    setStep('customize');
  }

  async function handleApply() {
    if (!uploadedFile) { setError('Please upload an image first.'); return; }
    if (feature === 'hairstyle' && !selectedTemplate) { setError('Please select a hair style.'); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;
      if (feature === 'hair') {
        data = await applyHairTryon(uploadedFile, { hairColor, patternName });
      } else if (feature === 'hairstyle') {
        data = await applyHairStyleTryon(uploadedFile, { styleIndex: selectedTemplate.index });
      } else {
        data = await applyNailTryon(uploadedFile, { nailColor, nailTexture, nailEffectType, nailShape, nailLength });
      }
      setResult(data);
      markComplete('customize');
      setStep('result');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 pt-4 pb-20 md:py-6">
      <header className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold">Virtual Try-On</h1>
        <p className="text-gray-500 mt-1 text-sm">Powered by GlamIQ</p>
      </header>

      <main
        className="flex flex-col gap-0 md:flex-col md:gap-6 lg:grid lg:grid-cols-3 lg:gap-6"
        data-step={step}
      >
        <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm panel-upload">
          <UploadComponent onFileSelect={handleFileSelect} previewUrl={previewUrl} feature={feature} />
        </section>

        <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm panel-customize">
          <TryOnControls
            feature={feature}                   setFeature={setFeature}
            hairColor={hairColor}               setHairColor={setHairColor}
            patternName={patternName}           setPatternName={setPatternName}
            selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate}
            nailColor={nailColor}               setNailColor={setNailColor}
            nailTexture={nailTexture}           setNailTexture={setNailTexture}
            nailEffectType={nailEffectType}     setNailEffectType={setNailEffectType}
            nailShape={nailShape}               setNailShape={setNailShape}
            nailLength={nailLength}             setNailLength={setNailLength}
            onApply={handleApply}
            loading={loading}
            disabled={!uploadedFile}
          />
          {error && (
            <p className="mt-3 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-md">{error}</p>
          )}
        </section>

        <section className="bg-white rounded-xl p-5 md:p-6 shadow-sm panel-result">
          <ResultViewer result={result} loading={loading} />
        </section>
      </main>

      <StepNav step={step} setStep={setStep} completedSteps={completedSteps} />
    </div>
  );
}
