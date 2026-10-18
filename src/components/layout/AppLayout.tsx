import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ResourceModal } from '../library/ResourceModal';
import { useResearch } from '../../context/ResearchContext';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { addResource } = useResearch();

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSaveResource = (data: {
    title: string;
    url: string;
    category: any;
    tags: string[];
    notes: string;
  }) => {
    addResource(data);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Layout Area */}
      <div className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onOpenAddModal={handleOpenAddModal}
        />

        <main className="page-body">
          <Outlet />
        </main>
      </div>

      {/* Global Add Resource Modal */}
      <ResourceModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleSaveResource}
      />
    </div>
  );
};
