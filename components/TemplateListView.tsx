import React, { useState, useMemo } from 'react';
import { ApiTemplate } from '../types';
import { Plus, Code2, ChevronDown, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import TemplateExecutor from './TemplateExecutor';

interface TemplateListViewProps {
  templates: ApiTemplate[];
  onCreate: () => void;
  onEdit: (template: ApiTemplate) => void;
  onDelete: (templateId: string) => void;
}

const ITEMS_PER_PAGE = 8;

const TemplateListView: React.FC<TemplateListViewProps> = ({ templates, onCreate, onEdit, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  
  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTemplates.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTemplates, currentPage]);

  const toggleExpand = (id: string) => {
    setExpandedId(prevId => (prevId === id ? null : id));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const getMethodColorClass = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-woopi-blue/10 text-woopi-blue';
      case 'POST': return 'bg-success/10 text-green-600';
      case 'PUT': return 'bg-orange/10 text-orange';
      case 'PATCH': return 'bg-yellow-400/10 text-yellow-500';
      case 'DELETE': return 'bg-error/10 text-error';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-3xl font-medium text-dark-gray">API Templates</h1>
          <p className="text-gray-500 mt-1">Manage, test, and edit your API request templates.</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-5 py-2 bg-woopi-blue hover:bg-dark-blue text-white rounded-lg font-medium shadow-sm transition-all text-sm"
        >
          <Plus size={16} />
          Create New Template
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search templates by name or URL..."
          className="w-full pl-10 pr-4 py-2 border border-border-gray bg-white rounded-lg focus:ring-2 focus:ring-woopi-blue/50 focus:border-woopi-blue outline-none transition-all text-sm"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border-gray rounded-xl">
          <Code2 size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-dark-gray">
            {searchQuery ? 'No templates match your search.' : 'No templates yet.'}
          </h3>
          <p className="text-gray-500 mt-2">
            {searchQuery ? 'Try a different search term.' : 'Click "Create New Template" to get started.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paginatedTemplates.map(t => (
              <div key={t.id} className="bg-white border border-border-gray rounded-lg shadow-sm transition-all overflow-hidden">
                <div className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50/50" onClick={() => toggleExpand(t.id)}>
                  <div className="flex-1 flex items-center min-w-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mr-3 w-12 text-center ${getMethodColorClass(t.method)}`}>
                      {t.method}
                    </span>
                    <div className="min-w-0 flex items-center gap-3">
                      <p className="font-medium text-dark-gray text-sm truncate">{t.name}</p>
                      <p className="text-xs text-gray-400 font-mono truncate border-l border-gray-200 pl-3 hidden sm:block">{t.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="p-1.5 text-gray-400 hover:text-woopi-blue rounded-md transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="p-1.5 text-gray-400 hover:text-error rounded-md transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${expandedId === t.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedId === t.id && <TemplateExecutor template={t} />}
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-xs text-gray-500">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border-gray bg-white rounded-md text-xs text-dark-gray hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 border border-border-gray bg-white rounded-md text-xs text-dark-gray hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TemplateListView;