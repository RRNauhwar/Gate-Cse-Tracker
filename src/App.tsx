import React, { useState } from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { TimerProvider } from './context/TimerContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { AlertTriangle, X } from 'lucide-react';

// Views
import { DashboardView } from './views/DashboardView';
import { SyllabusView } from './views/SyllabusView';
import { TimerView } from './views/TimerView';
import { TestsView } from './views/TestsView';
import { AnalyticsView } from './views/AnalyticsView';
import { NotesView } from './views/NotesView';
import { MistakeBookView } from './views/MistakeBookView';
import { CalculatorView } from './views/CalculatorView';
import { PlannerView } from './views/PlannerView';
import { SettingsView } from './views/SettingsView';

export const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { storageError, storageWriteError, clearStorageErrors } = useAppState();

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#e4e6ea] flex flex-col">
      {/* Top Storage Warning Banner if storage failure occurred */}
      {(storageError || storageWriteError) && (
        <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 px-4 py-3 flex items-center justify-between text-xs z-50">
          <div className="flex items-center gap-2 max-w-4xl">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span>
              <strong>Storage Warning:</strong> {storageError || storageWriteError} Existing user data has not been overwritten.
            </span>
          </div>
          <button
            onClick={clearStorageErrors}
            className="p-1 hover:bg-amber-900/60 rounded text-amber-400"
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        onToggleMobileNav={() => setIsMobileNavOpen(prev => !prev)}
        onNavigate={view => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <div className="flex-1 min-w-0 flex max-w-[1600px] w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onNavigate={view => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          currentView={currentView}
          onNavigate={view => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto overflow-x-hidden">
          {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} />}
          {currentView === 'syllabus' && <SyllabusView />}
          {currentView === 'timer' && <TimerView />}
          {currentView === 'tests' && <TestsView />}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'notes' && <NotesView />}
          {currentView === 'mistakes' && <MistakeBookView />}
          {currentView === 'calculator' && <CalculatorView />}
          {currentView === 'planner' && <PlannerView />}
          {currentView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppStateProvider>
      <TimerProvider>
        <MainApp />
      </TimerProvider>
    </AppStateProvider>
  );
};
