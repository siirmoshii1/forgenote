import React, { useState } from 'react';
import {
  Briefcase,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { IncomeItem, PaymentStatus, Project, ProjectStatus } from '../../types.ts';

interface ProjectsIncomeViewProps {
  projects: Project[];
  income: IncomeItem[];
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onSaveIncome: (item: IncomeItem) => void;
  onDeleteIncome: (id: string) => void;
}

export const ProjectsIncomeView: React.FC<ProjectsIncomeViewProps> = ({
  projects,
  income,
  onSaveProject,
  onDeleteProject,
  onSaveIncome,
  onDeleteIncome,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'income'>('projects');

  // Project Modal State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Income Modal State
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  // Filter projects
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');
  // Filter income
  const [incomeStatusFilter, setIncomeStatusFilter] = useState<string>('all');

  // Financial Calculations
  const grossInvoiced = income
    .filter((i) => !i.isExpense)
    .reduce((sum, i) => sum + i.amount, 0);

  const cashReceived = income
    .filter((i) => !i.isExpense && i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingReceivables = income
    .filter((i) => !i.isExpense && (i.status === 'invoiced' || i.status === 'overdue'))
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpenses = income
    .filter((i) => i.isExpense)
    .reduce((sum, i) => sum + i.amount, 0);

  const netProfit = cashReceived - totalExpenses;

  const filteredProjects = projects.filter((p) => {
    if (projectStatusFilter !== 'all' && p.status !== projectStatusFilter) return false;
    return true;
  });

  const filteredIncome = income.filter((i) => {
    if (incomeStatusFilter !== 'all' && i.status !== incomeStatusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'in_progress':
        return 'text-blue-600 dark:text-blue-400 font-medium';
      case 'completed':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'review':
        return 'text-amber-600 dark:text-amber-400';
      case 'paused':
        return 'text-zinc-500';
      case 'planning':
        return 'text-zinc-400';
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'overdue':
        return 'text-red-600 dark:text-red-400 font-semibold';
      case 'invoiced':
        return 'text-blue-600 dark:text-blue-400 font-medium';
      case 'draft':
        return 'text-zinc-400';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === 'projects'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Initiatives & Milestones ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition ${
              activeTab === 'income'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Freelance Ledger & Income</span>
          </button>
        </div>

        {activeTab === 'projects' ? (
          <button
            onClick={() => {
              setEditingProject({
                id: '',
                title: '',
                description: '',
                status: 'planning',
                deadline: '',
                nextAction: '',
                category: 'Software',
                progress: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
              setIsProjectModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingIncome({
                id: '',
                title: '',
                client: '',
                amount: 1000,
                currency: 'USD',
                status: 'invoiced',
                isExpense: false,
                date: new Date().toISOString().split('T')[0],
                notes: '',
                createdAt: new Date().toISOString(),
              });
              setIsIncomeModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Invoice / Expense</span>
          </button>
        )}
      </div>

      {/* VIEW 1: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Track deadlines, milestones, progress percentage, and immediate next actions.
            </p>
            <select
              value={projectStatusFilter}
              onChange={(e) => setProjectStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-xs text-zinc-400">
                No projects in this category. Click "New Project" to start tracking an initiative.
              </div>
            ) : (
              filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {proj.title}
                      </h4>
                      <span className={`text-[11px] uppercase tracking-wider ${getStatusBadge(proj.status)}`}>
                        {proj.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                      <span>Progress</span>
                      <span className="tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                        {proj.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-300"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Next Action callout */}
                  <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5">
                      Next Action:
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400 leading-snug">
                      {proj.nextAction || 'Define next action step'}
                    </span>
                  </div>

                  {/* Footer metadata */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-mono text-[11px]">
                      {proj.deadline ? `Due ${proj.deadline}` : 'No deadline'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProject(proj);
                          setIsProjectModalOpen(true);
                        }}
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        title="Edit project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        className="p-1 rounded text-zinc-400 hover:text-red-500"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: INCOME & FREELANCE LEDGER */}
      {activeTab === 'income' && (
        <div className="space-y-6">
          {/* Summary KPIs Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Total Invoiced
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100 mt-1 block">
                ${grossInvoiced.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Cash Received
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1 block">
                ${cashReceived.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Pending / Overdue
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1 block">
                ${pendingReceivables.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Expenses
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400 mt-1 block">
                ${totalExpenses.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 col-span-2 md:col-span-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Net Profit
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1 block">
                ${netProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Income & Expense Ledger Entries
              </h3>
              <select
                value={incomeStatusFilter}
                onChange={(e) => setIncomeStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 outline-none"
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="invoiced">Invoiced</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Client / Payee</th>
                    <th className="py-2.5 px-4">Job Description</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredIncome.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-zinc-400">
                        No financial transactions in this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredIncome.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                      >
                        <td className="py-3 px-4 font-mono text-zinc-500 whitespace-nowrap">
                          {item.date}
                        </td>
                        <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                          {item.client}
                        </td>
                        <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">
                          {item.title}
                          {item.notes && (
                            <span className="block text-[11px] text-zinc-400">{item.notes}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              // Fast status cycle: draft -> invoiced -> paid -> overdue -> draft
                              const nextStatus: Record<PaymentStatus, PaymentStatus> = {
                                draft: 'invoiced',
                                invoiced: 'paid',
                                paid: 'overdue',
                                overdue: 'paid',
                              };
                              onSaveIncome({ ...item, status: nextStatus[item.status] });
                            }}
                            className={`uppercase text-[10px] tracking-wider font-mono hover:underline ${getPaymentStatusBadge(
                              item.status
                            )}`}
                            title="Click to toggle payment status"
                          >
                            {item.status}
                          </button>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap ${
                            item.isExpense
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          {item.isExpense ? `-$${item.amount.toLocaleString()}` : `+$${item.amount.toLocaleString()}`}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingIncome(item);
                              setIsIncomeModalOpen(true);
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white mr-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteIncome(item.id)}
                            className="p-1 rounded text-zinc-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {editingProject.id ? 'Edit Initiative' : 'New Project'}
              </h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingProject.title.trim()) return;
                onSaveProject({
                  ...editingProject,
                  id: editingProject.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  updatedAt: new Date().toISOString(),
                });
                setIsProjectModalOpen(false);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold uppercase text-zinc-500 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="e.g. Distributed Cache Integration"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">Status</label>
                  <select
                    value={editingProject.status}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, status: e.target.value as ProjectStatus })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingProject.progress}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, progress: Math.min(100, Math.max(0, Number(e.target.value))) })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={editingProject.deadline || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProject.category}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    placeholder="Software, Client, Personal"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-zinc-500 mb-1">Next Action *</label>
                <input
                  type="text"
                  required
                  value={editingProject.nextAction}
                  onChange={(e) => setEditingProject({ ...editingProject, nextAction: e.target.value })}
                  placeholder="Immediate next milestone action..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-zinc-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Income & Expense Modal */}
      {isIncomeModalOpen && editingIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {editingIncome.id ? 'Edit Ledger Entry' : 'Record Ledger Entry'}
              </h3>
              <button
                onClick={() => setIsIncomeModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingIncome.title.trim() || !editingIncome.client.trim()) return;
                onSaveIncome({
                  ...editingIncome,
                  id: editingIncome.id || `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                });
                setIsIncomeModalOpen(false);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="flex items-center gap-4 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isExpense"
                    checked={!editingIncome.isExpense}
                    onChange={() => setEditingIncome({ ...editingIncome, isExpense: false })}
                    className="accent-blue-600"
                  />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Client Revenue / Invoice</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="isExpense"
                    checked={editingIncome.isExpense}
                    onChange={() => setEditingIncome({ ...editingIncome, isExpense: true })}
                    className="accent-red-600"
                  />
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">Business Expense</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold uppercase text-zinc-500 mb-1">
                  {editingIncome.isExpense ? 'Vendor / Service' : 'Client Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editingIncome.client}
                  onChange={(e) => setEditingIncome({ ...editingIncome, client: e.target.value })}
                  placeholder="e.g. Acme Corp or AWS Services"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-zinc-500 mb-1">
                  Job / Invoice Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingIncome.title}
                  onChange={(e) => setEditingIncome({ ...editingIncome, title: e.target.value })}
                  placeholder="e.g. Full-Stack API Integration"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">Amount ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editingIncome.amount}
                    onChange={(e) => setEditingIncome({ ...editingIncome, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-zinc-500 mb-1">Payment Status</label>
                  <select
                    value={editingIncome.status}
                    onChange={(e) =>
                      setEditingIncome({ ...editingIncome, status: e.target.value as PaymentStatus })
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="invoiced">Invoiced</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-zinc-500 mb-1">Date</label>
                <input
                  type="date"
                  value={editingIncome.date}
                  onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-zinc-500 mb-1">Notes / Terms</label>
                <input
                  type="text"
                  value={editingIncome.notes || ''}
                  onChange={(e) => setEditingIncome({ ...editingIncome, notes: e.target.value })}
                  placeholder="e.g. Net 15, wire transfer completed"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
