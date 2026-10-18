import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ResearchProvider } from './context/ResearchContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export function App() {
  return (
    <ResearchProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            {/* 1. Dashboard */}
            <Route index element={<DashboardPage />} />
            {/* 2. Browsing History */}
            <Route path="history" element={<HistoryPage />} />
            {/* 3. Smart Search */}
            <Route path="search" element={<SearchPage />} />
            {/* 4. Research Library */}
            <Route path="library" element={<LibraryPage />} />
            {/* 5. DSA Analytics */}
            <Route path="analytics" element={<AnalyticsPage />} />
            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ResearchProvider>
  );
}

export default App;
