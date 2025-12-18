
export enum OperationType {
  Elective = 'Elective OR',
  NonElective = 'Non Elective OR',
  NonOperation = 'Non operation'
}

export enum OrthoType {
  Trauma = 'TRAUMA',
  NonTrauma = 'NON TRAUMA'
}

export enum Gender {
  Male = 'Male',
  Female = 'Female'
}

export enum PatientType {
  Existing = 'EXISTING',
  New = 'NEW'
}

export enum PayerType {
  LocalInsurance = 'Local Insurance',
  LocalSelfpay = 'Local Selfpay',
  AMSContract = 'AMS Contract',
  InterInsurance = 'Inter Insurance'
}

export enum TraumaType {
  TrafficAccident = 'Traffic Accident',
  Fall = 'Fall',
  SportsInjury = 'Sports Injury',
  Assault = 'Assault',
  Industrial = 'Industrial',
  Other = 'Other'
}

export enum PostOpPainMgmt {
  IV_PCA = 'IV PCA',
  Epidural = 'Epidural',
  NerveBlock = 'Nerve Block',
  Oral = 'Oral Meds',
  IV_Bolus = 'IV Bolus'
}

export enum Specialty {
  Ortho = 'Orthopedics',
  GenSurg = 'General Surgery',
  Neuro = 'Neurosurgery',
  Urology = 'Urology',
  OBGYN = 'OBGYN',
  Plastics = 'Plastics'
}

export enum Nationality {
  Thai = 'THAI',
  NonThai = 'NON-THAI'
}

export enum DrugGroup {
  Opioids = 'OPIOIDS',
  NonOpioids = 'NON-OPIOIDS',
  Adjuvants = 'ADJUVANTS'
}

export enum AdverseEventType {
  // General Side Effects (Medication/Minor)
  NauseaVomiting = 'Nausea/Vomiting',
  Sedation = 'Sedation',
  Pruritus = 'Pruritus',
  UrinaryRetention = 'Urinary Retention',
  Dizziness = 'Dizziness',
  
  // Severe / Intervention Complications
  Hypotension = 'Hypotension (Severe)',
  RespiratoryDepression = 'Resp. Depression',
  Hematoma = 'Hematoma/Bleeding',
  NerveInjury = 'Nerve Injury',
  Infection = 'Infection',
  DuralPuncture = 'Dural Puncture',
  MotorBlock = 'Prolonged Motor Block',
  
  // Additional Severe Complications
  CatheterMigration = 'Catheter Migration',
  LAST = 'LAST (Toxicity)',
  Anaphylaxis = 'Anaphylaxis'
}

export interface PainScores {
  rest: {
    h0_24: number | null;
    h24_48: number | null;
    h48_72: number | null;
  };
  movement: {
    h0_24: number | null;
    h24_48: number | null;
    h48_72: number | null;
  };
}

export interface QualityIndicators {
  freqRest24h: number | null;      // Graph 1: Frequency of pain >=4 in 24h (Rest)
  freqRest72h: number | null;      // Graph 2: Frequency of pain >=4 in 72h (Rest)
  freqMovement24h: number | null;  // Graph 3: Frequency of pain >=4 in 24h (Movement)
  freqMovement72h: number | null;  // Graph 4: Frequency of pain >=4 in 72h (Movement)
}

export interface PainInterference {
  generalActivity: number; // 0-10 scale
  mood: number;
  walkingAbility: number;
  normalWork: number;
  relations: number;
  sleep: number;
  enjoyment: number;
}

export interface CaseData {
  id: string;
  date: string; // ISO Date string
  patientAge: number; // Column E
  patientGender: Gender;
  patientType: PatientType; // Column F
  payer: PayerType; // Column G
  nationality: Nationality; // Implied Column for Thai/Non-Thai
  traumaType: TraumaType; // Column O
  postOpPainMgmt: PostOpPainMgmt; // Column J
  drugGroups: DrugGroup[]; // Column AE
  specificMedications: string[]; // New: List of specific drugs used (e.g. Morphine, Paracetamol)
  specialty: Specialty; // Column M
  operationType: OperationType;
  orthoType: OrthoType;
  painScores: PainScores;
  painScoreDischarge: number | null; // Column AH (PS_DISCHARGE)
  painReduction50Percent: boolean; // >50% reduction from Day 0 to Day 1
  complications: boolean;
  adverseEvents: AdverseEventType[]; // New field for specific events
  qualityIndicators: QualityIndicators;
  
  // Patient Experience & PROMs
  satisfactionScore: number; // 1-5 Scale (5 is Very Satisfied)
  promsImprovement: number; // Percentage improvement in function/QoL (e.g., 20%)
  painInterference: PainInterference;
  patientFeedback: string | null;
}

export interface FilterState {
  year: number;
  month: number | 'All';
  operationType: OperationType | 'All';
  orthoType: OrthoType | 'All';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}