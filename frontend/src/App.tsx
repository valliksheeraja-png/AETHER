import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { IssuesPage } from './pages/IssuesPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { MemoryPage } from './pages/MemoryPage';
import { AnalystPage } from './pages/AnalystPage';
import { ReleasesPage } from './pages/ReleasesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddFeedbackModal } from './components/AddFeedbackModal';
import { UploadCsvModal } from './components/UploadCsvModal';
import { FeedbackDetailModal } from './components/FeedbackDetailModal';
import { EvidenceModal } from './components/EvidenceModal';
import { api } from './services/api';
import { Feedback, FeedbackEvidence } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [evidenceModalData, setEvidenceModalData] = useState<{
    isOpen: boolean;
    evidence: FeedbackEvidence[];
    title: string;
  }>({
    isOpen: false,
    evidence: [],
    title: 'Supporting Feedback Records',
  });

  // System & Stats State
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [totalFeedback, setTotalFeedback] = useState(520);
  const [isReseeding, setIsReseeding] = useState(false);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const status = await api.getSystemStatus();
      setIsDemoMode(status.is_demo_mode);
      if (status.vector_store_count) {
        setTotalFeedback(status.vector_store_count);
      }
    } catch (e) {
      console.error('Failed to fetch system status:', e);
    }
  };

  const handleReseed = async () => {
    if (window.confirm('Reset and re-seed 500 realistic benchmark records with emerging trends?')) {
      setIsReseeding(true);
      try {
        const res = await api.reseedDemoData(true);
        setTotalFeedback(res.record_count || 520);
        alert(`Successfully re-seeded ${res.record_count} feedback records.`);
        // Reload current view
        window.location.reload();
      } catch (err: any) {
        alert(err.message || 'Failed to reseed database');
      } finally {
        setIsReseeding(false);
      }
    }
  };

  const handleFeedbackCreated = (newFb: Feedback) => {
    setTotalFeedback((prev) => prev + 1);
  };

  const handleSelectIssue = (issueId: number) => {
    setSelectedIssueId(issueId);
    setCurrentTab('issue-detail');
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Executive Feedback Intelligence', subtitle: 'Connected memory and real-time emerging issue detection' };
      case 'feedback':
        return { title: 'Feedback Ingestion Stream', subtitle: 'Cross-channel verbatim customer voice & semantic extraction' };
      case 'issues':
        return { title: 'Clustered Themes & Issues', subtitle: 'Synthesized problem spaces across customer channels' };
      case 'issue-detail':
        return { title: 'Issue Deep Dive', subtitle: 'Timeline, growth metrics, and representative customer verbatims' };
      case 'memory':
        return { title: 'Visual Memory Explorer', subtitle: 'Demonstrating persistent vector memory and semantic clustering' };
      case 'analyst':
        return { title: 'AETHER AI Analyst', subtitle: 'Grounded question-answering with zero hallucinations' };
      case 'releases':
        return { title: 'Product Release Correlation', subtitle: 'Pre vs post-release feedback sentiment & volume analysis' };
      case 'settings':
        return { title: 'Settings & System Status', subtitle: 'AI inference providers, persistent memory engine, and benchmarks' };
      default:
        return { title: 'AETHER', subtitle: 'AI Feedback Memory Agent' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <div className="flex min-h-screen bg-[#08090d] text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab === 'issue-detail' ? 'issues' : currentTab}
        setCurrentTab={(tab) => {
          setSelectedIssueId(null);
          setCurrentTab(tab);
        }}
        isDemoMode={isDemoMode}
        totalFeedback={totalFeedback}
        onReseed={handleReseed}
        isReseeding={isReseeding}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          isDemoMode={isDemoMode}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onSelectFeedback={(fb) => setSelectedFeedback(fb)}
              onSelectIssue={handleSelectIssue}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'feedback' && (
            <FeedbackPage
              onSelectFeedback={(fb) => setSelectedFeedback(fb)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {currentTab === 'issues' && (
            <IssuesPage onSelectIssue={handleSelectIssue} />
          )}

          {currentTab === 'issue-detail' && selectedIssueId && (
            <IssueDetailPage
              issueId={selectedIssueId}
              onBack={() => setCurrentTab('issues')}
              onSelectFeedback={(fb) => setSelectedFeedback(fb)}
            />
          )}

          {currentTab === 'memory' && (
            <MemoryPage
              onSelectFeedback={(fb) => setSelectedFeedback(fb)}
              onSelectIssue={handleSelectIssue}
            />
          )}

          {currentTab === 'analyst' && (
            <AnalystPage
              onOpenEvidence={(evidence, title) => {
                setEvidenceModalData({
                  isOpen: true,
                  evidence,
                  title: title || 'Supporting Customer Records',
                });
              }}
            />
          )}

          {currentTab === 'releases' && <ReleasesPage />}

          {currentTab === 'settings' && (
            <SettingsPage
              isDemoMode={isDemoMode}
              totalFeedback={totalFeedback}
              onReseed={handleReseed}
              isReseeding={isReseeding}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <AddFeedbackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleFeedbackCreated}
      />

      <UploadCsvModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchSystemStatus();
          // refresh view if on feedback tab
        }}
      />

      <FeedbackDetailModal
        feedback={selectedFeedback}
        isOpen={Boolean(selectedFeedback)}
        onClose={() => setSelectedFeedback(null)}
        onSelectIssue={handleSelectIssue}
      />

      <EvidenceModal
        isOpen={evidenceModalData.isOpen}
        onClose={() => setEvidenceModalData((prev) => ({ ...prev, isOpen: false }))}
        evidence={evidenceModalData.evidence}
        title={evidenceModalData.title}
      />
    </div>
  );
}

export default App;
