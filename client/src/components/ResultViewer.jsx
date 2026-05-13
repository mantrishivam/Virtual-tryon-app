export default function ResultViewer({ result, loading }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-base font-bold mb-1">3. Result</h2>

      <div className="min-h-[200px] border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
        {loading && (
          <div className="text-center text-gray-500 p-4 flex flex-col items-center gap-3">
            <div className="spinner" />
            <p>Generating your look…</p>
            <p className="text-xs text-gray-400 -mt-1.5">This usually takes 15–30 seconds</p>
          </div>
        )}

        {!loading && !result && (
          <p className="text-center text-gray-300 p-4 text-sm">Your result will appear here.</p>
        )}

        {!loading && result?.placeholder && (
          <div className="text-center p-6 text-gray-500 flex flex-col gap-2">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded uppercase self-center">
              Placeholder
            </span>
            <p>{result.message}</p>
            <p className="text-sm text-gray-400">Selected color: <strong>{result.selectedColor}</strong></p>
          </div>
        )}

        {!loading && result?.resultImageUrl && (
          <div className="w-full flex flex-col items-center gap-3 p-3">
            <img
              src={result.resultImageUrl}
              alt="Try-on result"
              className="w-full max-h-80 object-contain rounded-md"
            />
            <a
              href={result.resultImageUrl}
              download="tryon-result.jpg"
              className="inline-block px-4 py-1.5 bg-gray-900 text-white rounded-md text-sm no-underline hover:bg-gray-700 transition-colors"
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
