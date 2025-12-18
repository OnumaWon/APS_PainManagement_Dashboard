
import React, { useState, useMemo } from 'react';
import {
  Users, Activity, AlertTriangle, TrendingDown,
  Table as TableIcon, BarChart2
} from 'lucide-react';
import { Card } from './ui/Card';
import { DataTable } from './DataTable';
import { CaseData, AdverseEventType, OperationType } from '../types';
import { filterData } from '../utils/mockData';
import {
  OperationTypeChart, OrthoTypePieChart, PainTrendChart,
  PainReductionChart, DemographicsChart, AgePainScatterChart, PainRecoveryScatterChart,
  GenderTrendChart, PainDischargeTrendChart, PatientTypePieChart,
  PatientTypeTrendChart, PayerPieChart, PayerTrendChart, AgeGroupPieChart, AgeGroupTrendChart,
  TraumaTypePieChart, TraumaTypeTrendChart, TraumaTypeByNationalityChart, PostOpMgmtPieChart,
  PostOpMgmtTrendChart, SpecialtyPieChart, SpecialtyTrendChart, NationalityPieChart,
  NationalityTrendChart, DrugGroupTrendChart, DrugGroupSummaryChart, DrugGroupPainCorrelationChart,
  SatisfactionChart, SatisfactionTrendChart, PromsTrendChart, PainInterferenceChart,
  SafetyTrendChart, SafetyDistributionChart, GeneralSideEffectsTrendChart, SevereComplicationsTrendChart,
  GenderPainChart, OpTypePainStatusChart, DrugGroupPainScoresChart, PatientTypeBarChart, DrugGroupMonthlyBarChart,
  SpecialtyMonthlyBarChart, SpecificMedicationChart, InteractiveOpTypePainTrendChart,
  SeverePainRest24Chart, SeverePainMovement24Chart, SeverePainRest72Chart, SeverePainMovement72Chart,
  OpioidFrequencyChart, NonOpioidFrequencyChart, AdjuvantFrequencyChart
} from './charts/PainCharts';

interface DashboardProps {
  rawData: CaseData[];
  year: number;
  month: number | 'All';
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ChartCard = ({ title, subtitle, children, className }: any) => {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={className}
      action={
        <button
          onClick={() => setView(view === 'chart' ? 'table' : 'chart')}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight"
        >
          {view === 'chart' ? <><TableIcon size={14} /><span>Table</span></> : <><BarChart2 size={14} /><span>Chart</span></>}
        </button>
      }
    >
      {React.cloneElement(children as React.ReactElement, { showTable: view === 'table' })}
    </Card>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ rawData, year, month, activeSection }) => {
  const [filterCriteria, setFilterCriteria] = useState<{ field: string; value: any } | null>(null);

  const filteredData = useMemo(() => {
    let data = filterData(rawData, year, month);
    if (filterCriteria) {
      data = data.filter((item: any) => item[filterCriteria.field] === filterCriteria.value);
    }
    return data;
  }, [rawData, year, month, filterCriteria]);

  const yearData = useMemo(() => {
    let data = filterData(rawData, year, 'All');
    if (filterCriteria) {
      data = data.filter((item: any) => item[filterCriteria.field] === filterCriteria.value);
    }
    return data;
  }, [rawData, year, filterCriteria]);

  const handleChartClick = (field: keyof CaseData, value: any) => {
    setFilterCriteria({ field, value });
  };

  const clearFilter = () => setFilterCriteria(null);

  // Stats Helpers that ignore NULLs
  const calculateClinicalAvg = (data: CaseData[], accessor: (d: CaseData) => number | null) => {
    const validVals = data.map(accessor).filter((v): v is number => v !== null);
    if (validVals.length === 0) return '0.00';
    return (validVals.reduce((a, b) => a + b, 0) / validVals.length).toFixed(2);
  };

  const calculateRate = (data: CaseData[], predicate: (d: CaseData) => boolean) => {
    if (data.length === 0) return '0.0';
    return ((data.filter(predicate).length / data.length) * 100).toFixed(1);
  };

  const totalCases = filteredData.length;
  const avgPainRest = calculateClinicalAvg(filteredData, d => d.painScores.rest.h0_24);
  const complicationRate = calculateRate(filteredData, d => d.complications);
  const successRate = calculateRate(filteredData, d => d.painReduction50Percent);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start text-slate-800 dark:text-slate-100">
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Cases</p><h3 className="text-2xl font-bold mt-1">{totalCases}</h3></div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Users size={20} /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start text-slate-800 dark:text-slate-100">
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Pain (Rest 24h)</p><h3 className="text-2xl font-bold mt-1">{avgPainRest}</h3></div>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><Activity size={20} /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start text-slate-800 dark:text-slate-100">
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Complication Rate</p><h3 className="text-2xl font-bold mt-1">{complicationRate}%</h3></div>
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg"><AlertTriangle size={20} /></div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start text-slate-800 dark:text-slate-100">
                  <div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pain Reduction &gt;50%</p><h3 className="text-2xl font-bold mt-1">{successRate}%</h3></div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><TrendingDown size={20} /></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Operation Type Distribution"><OperationTypeChart data={filteredData} onDataClick={handleChartClick} /></ChartCard>
              <ChartCard title="Ortho Type Distribution"><OrthoTypePieChart data={filteredData} onDataClick={handleChartClick} /></ChartCard>
              <ChartCard title="Pain Trends (Rest)" subtitle="Avg (Ignoring Empty Cells)"><PainTrendChart data={yearData} type="rest" /></ChartCard>
              <ChartCard title="Pain Trends (On Movement)" subtitle="Avg (Ignoring Empty Cells)"><PainTrendChart data={yearData} type="movement" /></ChartCard>
              <ChartCard title="Pain Reduction Effectiveness" className="lg:col-span-2"><PainReductionChart data={yearData} /></ChartCard>
            </div>
          </div>
        );

      case 'patient-profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Patient Type Distribution"><PatientTypeBarChart data={filteredData} /></ChartCard>
            <ChartCard title="Gender Distribution"><DemographicsChart data={filteredData} onDataClick={handleChartClick} /></ChartCard>
            <ChartCard title="Patient Age Groups"><AgeGroupPieChart data={filteredData} /></ChartCard>
            <ChartCard title="Nationality Breakdown"><NationalityPieChart data={filteredData} /></ChartCard>
            <ChartCard title="Payer Type Distribution"><PayerPieChart data={filteredData} /></ChartCard>
            <ChartCard title="Specialty Distribution"><SpecialtyPieChart data={filteredData} /></ChartCard>
            <ChartCard title="Specialty Trends"><SpecialtyTrendChart data={yearData} /></ChartCard>
            <ChartCard title="Trauma Type Distribution"><TraumaTypePieChart data={filteredData} /></ChartCard>
            <ChartCard title="Trauma Type Trends"><TraumaTypeTrendChart data={yearData} /></ChartCard>
          </div>
        );

      case 'pain-management':
        return (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Post-Op Pain Management Methods"><PostOpMgmtPieChart data={filteredData} /></ChartCard>
              <ChartCard title="Post-Op Management Trends"><PostOpMgmtTrendChart data={yearData} /></ChartCard>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mt-4">Medication Details (Top 10)</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard title="Opioids (Col AB)"><OpioidFrequencyChart data={filteredData} /></ChartCard>
              <ChartCard title="Non-Opioids (Col AC)"><NonOpioidFrequencyChart data={filteredData} /></ChartCard>
              <ChartCard title="Adjuvants (Col AD)"><AdjuvantFrequencyChart data={filteredData} /></ChartCard>
            </div>
          </div>
        );

      case 'pain-assessment':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Pain Trends (Rest) - Detailed"><InteractiveOpTypePainTrendChart data={yearData} type="rest" /></ChartCard>
            <ChartCard title="Pain Trends (Movement) - Detailed"><InteractiveOpTypePainTrendChart data={yearData} type="movement" /></ChartCard>
            <ChartCard title="Pain at Discharge (Trend)"><PainDischargeTrendChart data={yearData} /></ChartCard>
            <ChartCard title="Age vs Initial Pain"><AgePainScatterChart data={filteredData} /></ChartCard>
            <ChartCard title="Pain Recovery Analysis"><PainRecoveryScatterChart data={filteredData} /></ChartCard>
          </div>
        );

      case 'medication':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Specific Medication Distribution"><SpecificMedicationChart data={filteredData} /></ChartCard>
            <ChartCard title="Drug Group Utilization"><DrugGroupMonthlyBarChart data={yearData} /></ChartCard>
            <ChartCard title="Drug Group Summary"><DrugGroupSummaryChart data={filteredData} /></ChartCard>
            <ChartCard title="Pain Outcomes by Medication Group" className="lg:col-span-2"><DrugGroupPainScoresChart data={filteredData} /></ChartCard>
          </div>
        );

      case 'effectiveness':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="SEVERE REST PAIN FREQ (24H)"><SeverePainRest24Chart data={yearData} target={10} /></ChartCard>
            <ChartCard title="SEVERE MOVE PAIN FREQ (24H)"><SeverePainMovement24Chart data={yearData} target={15} /></ChartCard>
            <ChartCard title="SEVERE REST PAIN FREQ (72H)"><SeverePainRest72Chart data={yearData} target={10} /></ChartCard>
            <ChartCard title="SEVERE MOVE PAIN FREQ (72H)"><SeverePainMovement72Chart data={yearData} target={5} /></ChartCard>
          </div>
        );

      case 'safety':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="General Side Effects"><SafetyDistributionChart data={filteredData} category="general" /></ChartCard>
            <ChartCard title="General Trends"><GeneralSideEffectsTrendChart data={yearData} /></ChartCard>
            <ChartCard title="Severe Complications"><SafetyDistributionChart data={filteredData} category="severe" /></ChartCard>
            <ChartCard title="Severe Trends"><SevereComplicationsTrendChart data={yearData} /></ChartCard>
          </div>
        );

      case 'experience':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Patient Satisfaction Distribution"><SatisfactionChart data={filteredData} /></ChartCard>
            <ChartCard title="Satisfaction Trends"><SatisfactionTrendChart data={yearData} /></ChartCard>
            <ChartCard title="Patient-Reported Outcomes (PROMs)"><PromsTrendChart data={yearData} /></ChartCard>
            <ChartCard title="Pain Interference with ADL"><PainInterferenceChart data={filteredData} /></ChartCard>
          </div>
        );

      case 'detailed-records':
        return <DataTable data={filteredData} filterCriteria={filterCriteria} onClearFilter={clearFilter} />;

      default:
        return null;
    }
  };

  return <div className="space-y-6">{renderContent()}</div>;
};
