
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Moon, Sun, Menu, UploadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Dashboard } from './components/Dashboard';
import { GeminiAssistant } from './components/GeminiAssistant';
import { AiLab } from './components/AiLab';
import { Sidebar } from './components/Sidebar';
import { MONTH_NAMES } from './utils/mockData';
import {
  CaseData, Gender, PatientType, PayerType, Nationality,
  TraumaType, PostOpPainMgmt, Specialty, OperationType,
  OrthoType, DrugGroup, AdverseEventType
} from './types';

interface SheetMetadata {
  month: number;
  year: number;
  label: string;
  caseCount: number;
}

function App() {
  const [data, setData] = useState<CaseData[]>([]);
  const [sheetInfo, setSheetInfo] = useState<SheetMetadata[]>([]);
  const [year, setYear] = useState<number | 'All'>('All');
  const [month, setMonth] = useState<number | 'All'>('All');
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const availableYears = useMemo(() => {
    if (sheetInfo.length === 0) return [];
    const years = sheetInfo.map(s => s.year);
    return Array.from(new Set(years)).sort((a, b) => Number(b) - Number(a));
  }, [sheetInfo]);

  const availableMonths = useMemo(() => {
    if (sheetInfo.length === 0) return [];
    const filteredByYear = year === 'All'
      ? sheetInfo
      : sheetInfo.filter(s => s.year === year);

    return Array.from(new Set(filteredByYear.map(s => s.month))).sort((a, b) => Number(a) - Number(b));
  }, [sheetInfo, year]);

  useEffect(() => {
    if (sheetInfo.length > 0) {
      const latestYear = availableYears[0];
      if (year === 'All' || !availableYears.includes(Number(year))) {
        setYear(latestYear);
      }
    } else {
      setYear('All');
      setMonth('All');
    }
  }, [sheetInfo, availableYears]);

  useEffect(() => {
    if (sheetInfo.length > 0) {
      if (month !== 'All' && !availableMonths.includes(Number(month))) {
        setMonth('All');
      }
    }
  }, [availableMonths, month, sheetInfo]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-load the default Excel file on startup
  useEffect(() => {
    const loadDefaultData = async () => {
      try {
        const response = await fetch('/aps_data.xls');
        if (!response.ok) {
          console.error('Failed to fetch Excel file');
          return;
        }

        const arrayBuffer = await response.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: 'array' });

        const allParsedData: CaseData[] = [];
        const parsedInfo: SheetMetadata[] = [];

        wb.SheetNames.forEach((sheetName) => {
          const monthMatch = sheetName.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
          const yearMatch = sheetName.match(/\d{4}/);

          if (!monthMatch || !yearMatch) return;

          const monthLabel = monthMatch[0];
          const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthLabel.toLowerCase());
          const yearVal = parseInt(yearMatch[0]);

          const ws = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 'A' }) as any[];

          const dataRows = rows.filter((row) => {
            const hasId = !!row.A && row.A !== 'ID' && row.A !== 'HN' && String(row.A).trim() !== '';
            const hasAge = !isNaN(Number(row.E)) && row.E !== undefined;
            return hasId && hasAge;
          });

          const getVal = (v: any) => {
            if (v === undefined || v === null || String(v).trim() === '') return null;
            const n = Number(v);
            return isNaN(n) ? null : n;
          };

          const mappedData: CaseData[] = dataRows.map((row) => {
            const rest24 = getVal(row.T);
            const rest48 = getVal(row.W);
            const rest72 = getVal(row.Y);
            const move24 = getVal(row.U);
            const move48 = getVal(row.X);
            const move72 = getVal(row.Z);

            const adverseEvents: AdverseEventType[] = [];
            if (row.AO == 1 || row.AO === 'Y') adverseEvents.push(AdverseEventType.NauseaVomiting);
            if (row.AP == 1 || row.AP === 'Y') adverseEvents.push(AdverseEventType.Sedation);
            if (row.AQ == 1 || row.AQ === 'Y') adverseEvents.push(AdverseEventType.Pruritus);
            if (row.AR == 1 || row.AR === 'Y') adverseEvents.push(AdverseEventType.UrinaryRetention);
            if (row.AS == 1 || row.AS === 'Y') adverseEvents.push(AdverseEventType.Dizziness);
            if (row.AT == 1 || row.AT === 'Y') adverseEvents.push(AdverseEventType.Hypotension);
            if (row.AU == 1 || row.AU === 'Y') adverseEvents.push(AdverseEventType.RespiratoryDepression);

            let opType = OperationType.NonElective;
            let orthoType = OrthoType.NonTrauma;

            for (const key of Object.keys(row)) {
              const val = String(row[key] || '').toUpperCase();
              if (val.includes('NON OPERATION')) opType = OperationType.NonOperation;
              else if (val.includes('NON ELECTIVE')) opType = OperationType.NonElective;
              else if (val.includes('ELECTIVE')) opType = OperationType.Elective;

              if (val.includes('NON TRAUMA')) orthoType = OrthoType.NonTrauma;
              else if (val.includes('TRAUMA')) orthoType = OrthoType.Trauma;
            }

            const pod0Rest = getVal(row.R);
            const pod1Rest = getVal(row.T);

            // Parse Medication Details (Columns AB-AE)
            const parseDrugList = (val: any) => val ? String(val).split(',').map(s => s.trim()).filter(Boolean) : [];
            const drugGroupCategory = String(row.AE || 'Unknown').trim();
            const opioids = parseDrugList(row.AB);
            const nonOpioids = parseDrugList(row.AC);
            const adjuvants = parseDrugList(row.AD);

            return {
              id: String(row.A),
              date: new Date(yearVal, monthIdx, 15).toISOString(),
              patientAge: Number(row.E) || 0,
              patientGender: String(row.H).toUpperCase().startsWith('M') ? Gender.Male : Gender.Female,
              patientType: String(row.F).toUpperCase().includes('EXISTING') ? PatientType.Existing : PatientType.New,
              payer: (row.G as PayerType) || PayerType.LocalSelfpay,
              nationality: String(row.I).toUpperCase().includes('THAI') ? Nationality.Thai : Nationality.NonThai,
              traumaType: (row.O as TraumaType) || TraumaType.Other,
              postOpPainMgmt: (row.J as PostOpPainMgmt) || PostOpPainMgmt.IV_PCA,
              drugGroups: String(row.AE || '').split(',').map(s => s.trim() as DrugGroup).filter(s => Object.values(DrugGroup).includes(s)),
              specificMedications: [],
              specialty: (row.M as Specialty) || Specialty.Ortho,
              operationType: opType,
              orthoType: orthoType,
              painScores: {
                rest: { h0_24: rest24, h24_48: rest48, h48_72: rest72 },
                movement: { h0_24: move24, h24_48: move48, h48_72: move72 }
              },
              painScoreDischarge: getVal(row.AH),
              painReduction50Percent: (pod0Rest !== null && pod1Rest !== null && pod0Rest > 0) ? (pod1Rest <= (pod0Rest * 0.5)) : false,
              complications: adverseEvents.length > 0,
              adverseEvents,
              qualityIndicators: {
                freqRest24h: getVal(row.V),
                freqRest72h: getVal(row.AA),
                freqMovement24h: getVal(row.Z),
                freqMovement72h: getVal(row.AF)
              },
              // New Medication Fields
              drugGroupCategory,
              opioids,
              nonOpioids,
              adjuvants,

              satisfactionScore: getVal(row.AW) || 5,
              promsImprovement: getVal(row.AX) || 0,
              painInterference: {
                generalActivity: 0, mood: 0, walkingAbility: 0, normalWork: 0, relations: 0, sleep: 0, enjoyment: 0
              },
              patientFeedback: row.AY || null
            };
          });

          allParsedData.push(...mappedData);
          parsedInfo.push({
            month: monthIdx,
            year: yearVal,
            label: sheetName,
            caseCount: mappedData.length
          });
        });

        if (allParsedData.length > 0) {
          setSheetInfo(parsedInfo);
          setData(allParsedData);
          const latestSheet = parsedInfo[parsedInfo.length - 1];
          setYear(latestSheet.year);
          setMonth(latestSheet.month);
          console.log(`Auto-loaded ${allParsedData.length} cases from ${parsedInfo.length} sheets.`);
        }
      } catch (error) {
        console.error('Error loading default Excel file:', error);
      }
    };

    loadDefaultData();
  }, []); // Empty dependency array = run once on mount

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      const allParsedData: CaseData[] = [];
      const parsedInfo: SheetMetadata[] = [];

      wb.SheetNames.forEach((sheetName) => {
        const monthMatch = sheetName.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
        const yearMatch = sheetName.match(/\d{4}/);

        if (!monthMatch || !yearMatch) return;

        const monthLabel = monthMatch[0];
        const monthIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthLabel.toLowerCase());
        const yearVal = parseInt(yearMatch[0]);

        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 'A' }) as any[];

        const dataRows = rows.filter((row) => {
          const hasId = !!row.A && row.A !== 'ID' && row.A !== 'HN' && String(row.A).trim() !== '';
          const hasAge = !isNaN(Number(row.E)) && row.E !== undefined;
          return hasId && hasAge;
        });

        const getVal = (v: any) => {
          if (v === undefined || v === null || String(v).trim() === '') return null;
          const n = Number(v);
          return isNaN(n) ? null : n;
        };

        const mappedData: CaseData[] = dataRows.map((row) => {
          // Column Mapping as specified by user:
          // T: DAY_1_AVG_AT_REST -> 24h
          // W: DAY_2_AVG_AT_REST -> 48h
          // Y: DAY_3_AVG_AT_REST -> 72h
          // U: DAY_1_AVG_AT_MOVEMENT -> 24h
          // X: DAY_2_AVG_AT_MOVEMENT -> 48h
          // Z: DAY_3_AVG_AT_MOVEMENT -> 72h
          const rest24 = getVal(row.T);
          const rest48 = getVal(row.W);
          const rest72 = getVal(row.Y);
          const move24 = getVal(row.U);
          const move48 = getVal(row.X);
          const move72 = getVal(row.Z);

          const adverseEvents: AdverseEventType[] = [];
          if (row.AO == 1 || row.AO === 'Y') adverseEvents.push(AdverseEventType.NauseaVomiting);
          if (row.AP == 1 || row.AP === 'Y') adverseEvents.push(AdverseEventType.Sedation);
          if (row.AQ == 1 || row.AQ === 'Y') adverseEvents.push(AdverseEventType.Pruritus);
          if (row.AR == 1 || row.AR === 'Y') adverseEvents.push(AdverseEventType.UrinaryRetention);
          if (row.AS == 1 || row.AS === 'Y') adverseEvents.push(AdverseEventType.Dizziness);
          if (row.AT == 1 || row.AT === 'Y') adverseEvents.push(AdverseEventType.Hypotension);
          if (row.AU == 1 || row.AU === 'Y') adverseEvents.push(AdverseEventType.RespiratoryDepression);

          let opType = OperationType.NonElective;
          let orthoType = OrthoType.NonTrauma;

          for (const key of Object.keys(row)) {
            const val = String(row[key] || '').toUpperCase();
            if (val.includes('NON OPERATION')) opType = OperationType.NonOperation;
            else if (val.includes('NON ELECTIVE')) opType = OperationType.NonElective;
            else if (val.includes('ELECTIVE')) opType = OperationType.Elective;

            if (val.includes('NON TRAUMA')) orthoType = OrthoType.NonTrauma;
            else if (val.includes('TRAUMA')) orthoType = OrthoType.Trauma;
          }

          const pod0Rest = getVal(row.R);
          const pod1Rest = getVal(row.T);

          // Parse Medication Details (Columns AB-AE)
          const parseDrugList = (val: any) => val ? String(val).split(',').map(s => s.trim()).filter(Boolean) : [];
          const drugGroupCategory = String(row.AE || 'Unknown').trim();
          const opioids = parseDrugList(row.AB);
          const nonOpioids = parseDrugList(row.AC);
          const adjuvants = parseDrugList(row.AD);

          return {
            // New Medication Fields
            drugGroupCategory,
            opioids,
            nonOpioids,
            adjuvants,

            id: String(row.A),
            date: new Date(yearVal, monthIdx, 15).toISOString(),
            patientAge: Number(row.E) || 0,
            patientGender: String(row.H).toUpperCase().startsWith('M') ? Gender.Male : Gender.Female,
            patientType: String(row.F).toUpperCase().includes('EXISTING') ? PatientType.Existing : PatientType.New,
            payer: (row.G as PayerType) || PayerType.LocalSelfpay,
            nationality: String(row.I).toUpperCase().includes('THAI') ? Nationality.Thai : Nationality.NonThai,
            traumaType: (row.O as TraumaType) || TraumaType.Other,
            postOpPainMgmt: (row.J as PostOpPainMgmt) || PostOpPainMgmt.IV_PCA,
            drugGroups: String(row.AE || '').split(',').map(s => s.trim() as DrugGroup).filter(s => Object.values(DrugGroup).includes(s)),
            specificMedications: [],
            specialty: (row.M as Specialty) || Specialty.Ortho,
            operationType: opType,
            orthoType: orthoType,
            painScores: {
              rest: { h0_24: rest24, h24_48: rest48, h48_72: rest72 },
              movement: { h0_24: move24, h24_48: move48, h48_72: move72 }
            },
            painScoreDischarge: getVal(row.AH),
            painReduction50Percent: (pod0Rest !== null && pod1Rest !== null && pod0Rest > 0) ? (pod1Rest <= (pod0Rest * 0.5)) : false,
            complications: adverseEvents.length > 0,
            adverseEvents,
            qualityIndicators: {
              freqRest24h: getVal(row.V),
              freqRest72h: getVal(row.AA),
              freqMovement24h: getVal(row.Z),
              freqMovement72h: getVal(row.AF)
            },
            satisfactionScore: getVal(row.AW) || 5,
            promsImprovement: getVal(row.AX) || 0,
            painInterference: {
              generalActivity: 0, mood: 0, walkingAbility: 0, normalWork: 0, relations: 0, sleep: 0, enjoyment: 0
            },
            patientFeedback: row.AY || null
          };
        });

        allParsedData.push(...mappedData);
        parsedInfo.push({
          month: monthIdx,
          year: yearVal,
          label: sheetName,
          caseCount: mappedData.length
        });
      });

      if (allParsedData.length > 0) {
        setSheetInfo(parsedInfo);
        setData(allParsedData);
        const latestSheet = parsedInfo[parsedInfo.length - 1];
        setYear(latestSheet.year);
        setMonth(latestSheet.month);
        alert(`Success! Imported ${allParsedData.length} cases from ${parsedInfo.length} sheets.`);
      } else {
        alert("No valid data found. Ensure sheet names match (e.g., 'Jan 2025') and column A contains IDs.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const hasData = data.length > 0;

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-200 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onUpload={handleFileUpload}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className={`h-16 flex items-center justify-between px-4 sm:px-6 border-b transition-colors z-20 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 hidden sm:block truncate">APS Analytics</h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {hasData && activeSection !== 'ai-lab' && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center px-2 text-slate-400"><Calendar size={14} /></div>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                  className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none px-1 py-1 cursor-pointer"
                >
                  {availableYears.length > 1 && <option value="All">All Years</option>}
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                  className="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-200 outline-none px-1 py-1 cursor-pointer"
                >
                  <option value="All">All Months</option>
                  {availableMonths.map((m) => <option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
                </select>
              </div>
            )}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-slate-800 shadow-sm">DR</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto h-full">
            {!hasData && activeSection !== 'ai-lab' ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800/30">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-6"><UploadCloud size={48} className="text-blue-600 dark:text-blue-400" /></div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Data Uploaded</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">Upload your APS Excel file to begin analysis.</p>
                <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-200 cursor-pointer">
                  <UploadCloud size={18} /><span>Upload Excel File</span>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
              activeSection === 'ai-lab' ? <AiLab /> : <Dashboard rawData={data} year={year === 'All' ? (availableYears[0] || 2025) : year} month={month} activeSection={activeSection} setActiveSection={setActiveSection} />
            )}
          </div>
        </main>
      </div>
      <GeminiAssistant />
    </div>
  );
}

export default App;
