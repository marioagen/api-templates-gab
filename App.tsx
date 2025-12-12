import React, { useState, useEffect } from 'react';
import { Menu, Box, BookMarked } from 'lucide-react';
import { ApiTemplate, NavigationItem } from './types';
import TemplateBuilder from './components/TemplateBuilder';
import TemplateListView from './components/TemplateListView';
import { useToast } from './contexts/ToastContext';
import { mockApiTemplates } from './utils/mockData';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'builder'>('list');
  const [editingTemplate, setEditingTemplate] = useState<ApiTemplate | null>(null);
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { addToast } = useToast();

  // Load from storage or set mocks
  useEffect(() => {
    const stored = localStorage.getItem('apiTemplates');
    if (stored && stored !== '[]') {
      try {
        setTemplates(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load templates", e);
        setTemplates(mockApiTemplates);
        localStorage.setItem('apiTemplates', JSON.stringify(mockApiTemplates));
      }
    } else {
        // Load mocks if localStorage is empty
        setTemplates(mockApiTemplates);
        localStorage.setItem('apiTemplates', JSON.stringify(mockApiTemplates));
    }
  }, []);

  const persistTemplates = (updatedTemplates: ApiTemplate[]) => {
      setTemplates(updatedTemplates);
      localStorage.setItem('apiTemplates', JSON.stringify(updatedTemplates));
  };
  
  const handleCreateNew = () => {
      setEditingTemplate(null);
      setCurrentView('builder');
  };

  const handleEditTemplate = (template: ApiTemplate) => {
      setEditingTemplate(template);
      setCurrentView('builder');
  };

  const handleDeleteTemplate = (templateId: string) => {
      if (window.confirm("Are you sure you want to delete this template?")) {
        const updated = templates.filter(t => t.id !== templateId);
        persistTemplates(updated);
        addToast('Template deleted.', 'info');
      }
  };

  const handleSaveTemplate = (template: ApiTemplate) => {
    const isEditing = templates.some(t => t.id === template.id);
    let updated;

    if (isEditing) {
        // Update
        updated = templates.map(t => t.id === template.id ? template : t);
    } else {
        // Create
        updated = [...templates, template];
    }
    persistTemplates(updated);
    setCurrentView('list');
    setEditingTemplate(null);
    addToast(`Template "${template.name}" ${isEditing ? 'updated' : 'created'} successfully!`, 'success');
  };
  
  const handleCancel = () => {
      setCurrentView('list');
      setEditingTemplate(null);
  }

  return (
    <div className="flex h-screen bg-page-bg text-dark-gray overflow-hidden font-sans selection:bg-woopi-blue/20">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-border-gray transition-all duration-300 flex flex-col z-20`}>
        <div className="h-16 flex items-center px-6 border-b border-border-gray">
            <Box className="text-woopi-blue mr-3" size={28} />
            {isSidebarOpen && <span className="font-bold text-lg tracking-tight text-dark-gray">Dash<span className="text-woopi-blue">API</span></span>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setCurrentView('list')}
              className={`flex items-center w-full p-3 rounded-xl transition-all group relative bg-woopi-blue text-white shadow-md shadow-woopi-blue/20`}
            >
              <div className="relative z-10 flex items-center">
                  <BookMarked size={20} />
                  <span className={`ml-3 font-medium whitespace-nowrap transition-all duration-300 ${!isSidebarOpen && 'opacity-0 w-0'}`}>
                    API Templates
                  </span>
              </div>
            </button>
        </nav>
        
        <div className="p-4 border-t border-border-gray">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Menu size={20} />
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="h-16 border-b border-border-gray bg-white/80 flex items-center px-8 justify-between backdrop-blur-sm z-10">
           <div className="text-sm text-gray-500">
               <button onClick={() => setCurrentView('list')} className="hover:text-woopi-blue">Dashboard</button>
               {' / '} 
               <span className="text-dark-gray font-medium">
                   {currentView === 'builder' 
                       ? (editingTemplate ? 'Edit Template' : 'Create Template')
                       : 'API Templates'
                   }
               </span>
           </div>
           <div className="flex items-center gap-3">
               <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
               </div>
               <span className="text-xs font-mono text-gray-500">System Online</span>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {currentView === 'builder' && (
             <TemplateBuilder 
                onSave={handleSaveTemplate} 
                onCancel={handleCancel}
                templateToEdit={editingTemplate}
             />
           )}
           {currentView === 'list' && (
             <TemplateListView 
                templates={templates} 
                onCreate={handleCreateNew}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
             />
           )}
        </div>
      </main>

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes toast-in {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-toast-in {
            animation: toast-in 0.5s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;