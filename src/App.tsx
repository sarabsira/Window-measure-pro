import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/Layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { NewProject } from './pages/NewProject';
import { ProjectOverview } from './pages/ProjectOverview';
import { WindowMeasurement } from './pages/WindowMeasurement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/*"
          element={
            <AppShell>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/job/new" element={<NewProject />} />
                <Route path="/job/:id" element={<ProjectOverview />} />
                <Route path="/job/:id/window/:windowId" element={<WindowMeasurement />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
