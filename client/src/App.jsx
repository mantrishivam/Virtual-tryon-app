import { useState } from 'react';
import UploadComponent from './components/UploadComponent';
import TryOnControls from './components/TryOnControls';
import ResultViewer from './components/ResultViewer';
import StepNav from './components/StepNav';
import { applyHairTryon, applyHairStyleTryon, applyNailTryon } from './services/api';
import './App.css';

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [feature, setFeature]           = useState('hairstyle');

  // Hair color
  const [hairColor, setHairColor]       = useState('#8B4513');
  const [patternName, setPatternName]   = useState('full');

  // Hair style
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Nail
  const [nailColor, setNailColor]           = useState('#FF0000');
  const [nailTexture, setNailTexture]       = useState('cream');
  const [nailEffectType, setNailEffectType] = useState('nail_polish');
  const [nailShape, setNailShape]           = useState('squoval_oval');
  const [nailLength, setNailLength]         = useState(1.0);

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Mobile step navigation
  const [step, setStep]               = useState('upload');
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
    <div className="app">
      <header className="app-header">
        <h1>Virtual Try-On</h1>
        <p>Powered by GlamIQ</p>
      </header>

      <main className="app-main" data-step={step}>
        <section className="panel panel-upload">
          <UploadComponent onFileSelect={handleFileSelect} previewUrl={previewUrl} feature={feature} />
        </section>

        <section className="panel panel-customize">
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
          {error && <p className="error-msg">{error}</p>}
        </section>

        <section className="panel panel-result">
          <ResultViewer result={result} loading={loading} />
        </section>
      </main>

      <StepNav step={step} setStep={setStep} completedSteps={completedSteps} />
    </div>
  );
}
