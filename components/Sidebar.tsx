import React from 'react';
import { 
  LayoutDashboard, 
  UserCircle, 
  ClipboardCheck, 
  Stethoscope, 
  Pill, 
  LineChart, 
  ShieldAlert, 
  Network, 
  HeartHandshake, 
  Target, 
  BookOpen, 
  Brain, 
  Upload, 
  Activity, 
  Table,
  X 
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type MenuItem = 
  | { type: 'divider' }
  | { type: 'item'; id: string; label: string; icon: React.ReactNode };

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, isOpen, setIsOpen, onUpload }) => {
  const menuItems: MenuItem[] = [
    { type: 'item', id: 'overview', label: 'Overview / Executive Summary', icon: <LayoutDashboard size={18} /> },
    { type: 'item', id: 'patient-profile', label: 'Patient Profile', icon: <UserCircle size={18} /> },
    { type: 'item', id: 'pain-management', label: 'Pain Management Modalities', icon: <Stethoscope size={18} /> },
    { type: 'item', id: 'medication', label: 'Medication Utilization', icon: <Pill size={18} /> },
    { type: 'item', id: 'pain-assessment', label: 'Pain Assessment & Monitoring', icon: <ClipboardCheck size={18} /> },
    { type: 'item', id: 'effectiveness', label: 'Effectiveness Outcomes', icon: <LineChart size={18} /> },
    { type: 'item', id: 'safety', label: 'Safety & Adverse Events', icon: <ShieldAlert size={18} /> },
    { type: 'item', id: 'correlation', label: 'Correlation & Analytics', icon: <Network size={18} /> },
    { type: 'item', id: 'experience', label: 'Patient Experience & PROMs', icon: <HeartHandshake size={18} /> },
    { type: 'item', id: 'benchmark', label: 'Benchmark & Performance', icon: <Target size={18} /> },
    { type: 'item', id: 'detailed-records', label: 'Detailed Case Records', icon: <Table size={18} /> },
    { type: 'item', id: 'governance', label: 'Data Governance & Definitions', icon: <BookOpen size={18} /> },
    { type: 'divider' },
    { type: 'item', id: 'ai-lab', label: 'AI Lab', icon: <Brain size={18} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Activity size={20} />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">APS Data</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Analytics Menu</div>
          
          {menuItems.map((item, index) => {
            if (item.type === 'divider') {
               return <div key={`divider-${index}`} className="my-4 border-t border-slate-100 dark:border-slate-700" />;
            }
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id) {
                    setActiveSection(item.id);
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer / Upload Action */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <label className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-200 dark:shadow-none cursor-pointer group">
            <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>Upload New Excel</span>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={onUpload} className="hidden" />
          </label>
          <p className="text-center text-[10px] text-slate-400 mt-3">
             v2.5.2 &copy; 2025 APS Dashboard
          </p>
        </div>
      </aside>
    </>
  );
};