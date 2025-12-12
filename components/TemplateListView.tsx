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
          <h1 className="text-2xl font-semibold text-dark-gray">API Templates</h1>
          <p className="text-sm text-gray-500">Manage, test, and edit your API request templates.</p>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2 bg-woopi-blue hover:bg-dark-blue text-white rounded-lg font-medium shadow-sm transition-all text-sm"
        >
          <Plus size={16} />
          Create New
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search templates..."
          className="w-full pl-9 pr-4 py-2 border border-border-gray bg-white rounded-lg focus:ring-1 focus:ring-woopi-blue focus:border-woopi-blue outline-none transition-all text-sm"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border-gray rounded-xl">
          <Code2 size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-dark-gray">
            {searchQuery ? 'No templates match.' : 'No templates yet.'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? 'Try a different search.' : 'Click "Create New" to start.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {paginatedTemplates.map(t => (
              <div key={t.id} className="bg-white border border-border-gray rounded-md shadow-sm transition-all overflow-hidden hover:shadow-md">
                <div className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50/80" onClick={() => toggleExpand(t.id)}>
                  <div className="flex-1 flex items-center min-w-0 gap-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-11 text-center flex-shrink-0 ${getMethodColorClass(t.method)}`}>
                      {t.method}
                    </span>
                    <p className="font-medium text-dark-gray text-sm truncate max-w-[200px]">{t.name}</p>
                    <p className="text-xs text-gray-400 font-mono truncate border-l border-border-gray pl-3 hidden sm:block flex-1">{t.url}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="p-1.5 text-gray-400 hover:text-woopi-blue hover:bg-woopi-blue/10 rounded-md transition-all">
                      <Edit size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-md transition-all">
                      <Trash2 size={14} />
                    </button>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${expandedId === t.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedId === t.id && <TemplateExecutor template={t} />}
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-border-gray">
              <span className="text-xs text-gray-500">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-2.5 py-1 border border-border-gray bg-white rounded text-xs text-dark-gray hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={12} /> Prev
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-2.5 py-1 border border-border-gray bg-white rounded text-xs text-dark-gray hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight size={12} />
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