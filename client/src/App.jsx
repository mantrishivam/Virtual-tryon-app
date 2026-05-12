import { useState } from 'react';
import UploadComponent from './components/UploadComponent';
import TryOnControls from './components/TryOnControls';
import ResultViewer from './components/ResultViewer';
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
  const [nailColor, setNailColor]       = useState('#FF0000');
  const [nailTexture, setNailTexture]   = useState('cream');

  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  function handleFileSelect(file, objectUrl) {
    setUploadedFile(file);
    setPreviewUrl(objectUrl);
    setResult(null);
    setError(null);
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
        data = await applyNailTryon(uploadedFile, { nailColor, nailTexture });
      }
      setResult(data);
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

      <main className="app-main">
        <section className="panel">
          <UploadComponent onFileSelect={handleFileSelect} previewUrl={previewUrl} />
        </section>

        <section className="panel">
          <TryOnControls
            feature={feature}                   setFeature={setFeature}
            hairColor={hairColor}               setHairColor={setHairColor}
            patternName={patternName}           setPatternName={setPatternName}
            selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate}
            nailColor={nailColor}               setNailColor={setNailColor}
            nailTexture={nailTexture}           setNailTexture={setNailTexture}
            onApply={handleApply}
            loading={loading}
            disabled={!uploadedFile}
          />
          {error && <p className="error-msg">{error}</p>}
        </section>

        <section className="panel">
          <ResultViewer result={result} loading={loading} />
        </section>
      </main>
    </div>
  );
}
