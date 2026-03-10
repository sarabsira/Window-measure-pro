import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/Layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { NewProject } from './pages/NewProject';
import { ProjectOverview } from './pages/ProjectOverview';
import { RoomDetail } from './pages/RoomDetail';
import { WindowMeasurement } from './pages/WindowMeasurement';
import { ExportPreview } from './pages/ExportPreview';

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
                <Route path="/project/new" element={<NewProject />} />
                <Route path="/project/:id" element={<ProjectOverview />} />
                <Route path="/project/:id/room/:roomId" element={<RoomDetail />} />
                <Route path="/project/:id/room/:roomId/window/:windowId" element={<WindowMeasurement />} />
                <Route path="/project/:id/export" element={<ExportPreview />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
