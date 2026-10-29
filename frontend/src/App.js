import { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'unreachable' }));
  }, []);

  return (
    <div className="App min-h-screen flex flex-col items-center justify-center gap-2 bg-slate-100">
      <h1 className="text-4xl font-bold text-blue-600">App</h1>
      <p className="text-slate-600">Frontend env: {process.env.REACT_APP_ENV}</p>
      <p className="text-slate-600">
        API ({API_URL}): {health ? `${health.status}${health.env ? ` / ${health.env}` : ''}` : 'checking...'}
      </p>
    </div>
  );
}

export default App;
