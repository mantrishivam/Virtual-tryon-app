import './ResultViewer.css';

export default function ResultViewer({ result, loading }) {
  return (
    <div className="result-wrapper">
      <h2 className="panel-title">3. Result</h2>

      <div className="result-box">
        {loading && (
          <div className="result-loading">
            <div className="spinner" />
            <p>Processing with Perfect Corp AI…</p>
          </div>
        )}

        {!loading && !result && (
          <div className="result-empty">
            <p>Your result will appear here.</p>
          </div>
        )}

        {!loading && result && result.placeholder && (
          <div className="result-placeholder">
            <p className="placeholder-badge">Placeholder</p>
            <p>{result.message}</p>
            <p className="placeholder-sub">Selected color: <strong>{result.selectedColor}</strong></p>
          </div>
        )}

        {!loading && result && result.resultImageUrl && (
          <div className="result-image-wrapper">
            <img
              src={result.resultImageUrl}
              alt="Try-on result"
              className="result-img"
            />
            <a
              href={result.resultImageUrl}
              download="tryon-result.jpg"
              className="btn-download"
              target="_blank"
              rel="noreferrer"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
