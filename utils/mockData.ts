
import { CaseData, OperationType, OrthoType, Gender, PatientType, PayerType, TraumaType, PostOpPainMgmt, Specialty, Nationality, DrugGroup, AdverseEventType } from '../types';

const generateRandomDateInMonth = (month: number, year: number) => {
  const day = Math.floor(Math.random() * 28) + 1; // Simplistic but safe for all months
  return new Date(year, month, day).toISOString();
};

const getRandomEnum = <T>(anEnum: T): T[keyof T] => {
  const enumValues = Object.values(anEnum as any) as unknown as T[keyof T][];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
};

const getRandomFloat = (min: number, max: number, decimals: number = 1) => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
};

const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper to generate a random subset of drug groups
const generateDrugGroups = (): DrugGroup[] => {
    const groups: DrugGroup[] = [];
    if (Math.random() < 0.7) groups.push(DrugGroup.Opioids);
    if (Math.random() < 0.85) groups.push(DrugGroup.NonOpioids);
    if (Math.random() < 0.4) groups.push(DrugGroup.Adjuvants);
    if (groups.length === 0) groups.push(DrugGroup.NonOpioids);
    return groups;
};

// Specific Medication Lists
const SPECIFIC_OPIOIDS = ['Morphine', 'Fentanyl', 'Pethidine', 'Tramadol', 'Oxycodone'];
const SPECIFIC_NON_OPIOIDS = ['Paracetamol', 'NSAIDs', 'Coxibs', 'Metamizole'];
const SPECIFIC_ADJUVANTS = ['Gabapentin', 'Pregabalin', 'Ketamine', 'Dexamethasone'];

const FEEDBACK_SAMPLES = [
    "Pain was well managed, thank you.",
    "Nurses were very attentive.",
    "Felt a bit nauseous after the surgery but pain was okay.",
    "Excellent service from the APS team.",
    "Wait time for medication was a bit long at night.",
    "Very satisfied with the pain control.",
    "I was worried about pain but it was handled perfectly.",
    "The nerve block worked wonders.",
    "Staff explained the PCA pump clearly.",
    "Felt some pain during movement but manageable.",
    null, null, null
];

/**
 * Generates mock data for a specific period to simulate Excel tab contents.
 */
export const generateMockDataForMonth = (count: number, month: number, year: number): CaseData[] => {
  const data: CaseData[] = [];

  for (let i = 0; i < count; i++) {
    const operationType = getRandomEnum(OperationType);
    const orthoType = getRandomEnum(OrthoType);
    const drugGroups = generateDrugGroups();

    const specificMedications: string[] = [];
    if (drugGroups.includes(DrugGroup.Opioids)) {
        const num = Math.random() > 0.8 ? 2 : 1;
        for(let k=0; k<num; k++) {
            const med = SPECIFIC_OPIOIDS[Math.floor(Math.random() * SPECIFIC_OPIOIDS.length)];
            if (!specificMedications.includes(med)) specificMedications.push(med);
        }
    }
    if (drugGroups.includes(DrugGroup.NonOpioids)) {
        const num = Math.random() > 0.7 ? 2 : 1;
        for(let k=0; k<num; k++) {
            const med = SPECIFIC_NON_OPIOIDS[Math.floor(Math.random() * SPECIFIC_NON_OPIOIDS.length)];
            if (!specificMedications.includes(med)) specificMedications.push(med);
        }
    }
    if (drugGroups.includes(DrugGroup.Adjuvants)) {
        const med = SPECIFIC_ADJUVANTS[Math.floor(Math.random() * SPECIFIC_ADJUVANTS.length)];
        specificMedications.push(med);
    }

    const hasOpioids = drugGroups.includes(DrugGroup.Opioids);
    const basePain = hasOpioids ? getRandomFloat(4, 9) : getRandomFloat(2, 6);
    const rest0_24 = basePain; 
    const rest24_48 = Math.max(0, rest0_24 - getRandomFloat(0.5, 3));
    const rest48_72 = Math.max(0, rest24_48 - getRandomFloat(0.5, 2));
    const move0_24 = Math.min(10, rest0_24 + getRandomFloat(1, 3));
    const move24_48 = Math.max(0, move0_24 - getRandomFloat(0.5, 3));
    const move48_72 = Math.max(0, move24_48 - getRandomFloat(0.5, 2));

    const painScoreDischarge = getRandomFloat(0, 3.5);
    const painReduction50Percent = rest24_48 <= (rest0_24 * 0.5);
    const adverseEvents: AdverseEventType[] = [];
    
    if (Math.random() < 0.25) {
        const r = Math.random();
        if (r < 0.45) adverseEvents.push(AdverseEventType.NauseaVomiting);
        else if (r < 0.7) adverseEvents.push(AdverseEventType.Sedation);
        else if (r < 0.85) adverseEvents.push(AdverseEventType.Pruritus);
        else if (r < 0.95) adverseEvents.push(AdverseEventType.Dizziness);
        else adverseEvents.push(AdverseEventType.UrinaryRetention);
    }

    if (Math.random() < 0.06) {
        const r = Math.random();
        if (r < 0.25) adverseEvents.push(AdverseEventType.Hypotension);
        else if (r < 0.4) adverseEvents.push(AdverseEventType.MotorBlock);
        else if (r < 0.55) adverseEvents.push(AdverseEventType.DuralPuncture);
        else if (r < 0.7) adverseEvents.push(AdverseEventType.CatheterMigration);
        else if (r < 0.85) adverseEvents.push(AdverseEventType.RespiratoryDepression);
        else if (r < 0.95) adverseEvents.push(AdverseEventType.NerveInjury); 
        else if (r < 0.98) adverseEvents.push(AdverseEventType.LAST);
        else adverseEvents.push(AdverseEventType.Anaphylaxis);
    }

    const hasQI = Math.random() > 0.05;
    let freqRest24h = hasQI ? getRandomInt(0, 5) : null;
    if (hasQI && rest0_24 > 5) freqRest24h = getRandomInt(3, 8);
    let freqRest72h = hasQI ? getRandomInt(0, 5) : null;
    if (hasQI && (rest24_48 > 4 || rest48_72 > 4)) freqRest72h = getRandomInt(3, 10);
    let freqMovement24h = hasQI ? getRandomInt(0, 6) : null;
    if (hasQI && move0_24 > 6) freqMovement24h = getRandomInt(4, 9);
    let freqMovement72h = hasQI ? getRandomInt(0, 6) : null;
    if (hasQI && (move24_48 > 5 || move48_72 > 5)) freqMovement72h = getRandomInt(4, 10);

    const satisfactionRoll = Math.random();
    let satisfactionScore = 5;
    if (satisfactionRoll < 0.1) satisfactionScore = 3;
    else if (satisfactionRoll < 0.3) satisfactionScore = 4;
    else if (satisfactionRoll < 0.35) satisfactionScore = 2;

    let promsImprovement = getRandomInt(10, 40);
    if (painReduction50Percent) promsImprovement += getRandomInt(10, 20);

    const avgPain = (rest0_24 + move0_24) / 2;
    const interferenceBase = Math.min(10, avgPain + getRandomFloat(-1, 2));
    
    data.push({
      id: `APS-${year}${month}-${100 + i}`,
      date: generateRandomDateInMonth(month, year),
      patientAge: Math.floor(getRandomFloat(18, 90, 0)),
      patientGender: getRandomEnum(Gender),
      patientType: getRandomEnum(PatientType),
      payer: getRandomEnum(PayerType),
      nationality: getRandomEnum(Nationality),
      traumaType: getRandomEnum(TraumaType),
      postOpPainMgmt: getRandomEnum(PostOpPainMgmt),
      drugGroups,
      specificMedications,
      specialty: getRandomEnum(Specialty),
      operationType,
      orthoType,
      painScores: {
        rest: { h0_24: rest0_24, h24_48: rest24_48, h48_72: rest48_72 },
        movement: { h0_24: move0_24, h24_48: move24_48, h48_72: move48_72 }
      },
      painScoreDischarge,
      painReduction50Percent,
      complications: adverseEvents.length > 0,
      adverseEvents,
      qualityIndicators: { freqRest24h, freqRest72h, freqMovement24h, freqMovement72h },
      satisfactionScore,
      promsImprovement,
      painInterference: {
          generalActivity: Math.min(10, Math.max(0, interferenceBase + getRandomFloat(-1, 1))),
          mood: Math.min(10, Math.max(0, interferenceBase + getRandomFloat(-2, 1))),
          walkingAbility: Math.min(10, Math.max(0, interferenceBase + getRandomFloat(0, 2))),
          normalWork: Math.min(10, Math.max(0, interferenceBase + getRandomFloat(0, 2))),
          relations: Math.min(10, Math.max(0, interferenceBase + getRandomFloat(-3, 0))),
          sleep: Math.min(10, Math.max(0, interferenceBase + getRandomFloat(-1, 2))),
          enjoyment: Math.min(10, Math.max(0, interferenceBase + getRandomFloat(-2, 1)))
      },
      patientFeedback: FEEDBACK_SAMPLES[Math.floor(Math.random() * FEEDBACK_SAMPLES.length)]
    });
  }
  return data;
};

/**
 * Standard bulk mock generator.
 */
export const generateMockData = (count: number = 500): CaseData[] => {
  const data: CaseData[] = [];
  const start = new Date('2025-01-01').getTime();
  const end = new Date('2025-12-31').getTime();

  for (let i = 0; i < count; i++) {
    const randomDate = new Date(start + Math.random() * (end - start));
    const monthData = generateMockDataForMonth(1, randomDate.getMonth(), randomDate.getFullYear());
    data.push(...monthData);
  }
  return data;
};

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const filterData = (data: CaseData[], year: number, month: number | 'All') => {
  return data.filter(d => {
    const date = new Date(d.date);
    const yearMatch = date.getFullYear() === year;
    const monthMatch = month === 'All' || date.getMonth() === month;
    return yearMatch && monthMatch;
  });
};
