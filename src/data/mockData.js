export const REGIONS = ['Northeast', 'Midwest', 'Southeast', 'Southwest', 'West']

export const JOB_TYPES = [
  'HVAC Repair',
  'HVAC Install',
  'Plumbing Repair',
  'Drain Cleaning',
  'Electrical',
  'Pest Control',
  'Garage Door',
]

const defaultJobTypeMapping = {
  'HVAC Repair':    '',
  'HVAC Install':   '',
  'Plumbing Repair':'',
  'Drain Cleaning': '',
  'Electrical':     '',
  'Pest Control':   '',
  'Garage Door':    '',
}

export const initialBrands = [
  {
    id: 'brand-1',
    name: 'Yost and Campbell',
    region: 'Northeast',
    zipCodes: '02101, 02111, 02116, 02118, 02127, 02134, 02138, 02139, 02140',
    serviceTitanInstanceId: 'ST-YC-NE-001',
    jobTypeMapping: { ...defaultJobTypeMapping, 'HVAC Repair': 'ST-1001', 'HVAC Install': 'ST-1002' },
    dispatchRule: 'Auto-dispatch',
    bookingConfirmationMethod: 'SMS',
    primaryEscalationContact: 'Mike Yost — 617-555-0190',
    emergencyOverridePhone: '617-555-0142',
    addedAt: '2025-11-13',
  },
  {
    id: 'brand-2',
    name: 'Granite Comfort Chicago',
    region: 'Midwest',
    zipCodes: '60601, 60602, 60603, 60604, 60605, 60606, 60607, 60608',
    serviceTitanInstanceId: 'ST-GC-MW-001',
    jobTypeMapping: { ...defaultJobTypeMapping, 'Plumbing Repair': 'ST-2001', 'Drain Cleaning': 'ST-2002' },
    dispatchRule: 'Auto-dispatch',
    bookingConfirmationMethod: 'SMS',
    primaryEscalationContact: 'Regional Ops — 312-555-0200',
    emergencyOverridePhone: '312-555-0177',
    addedAt: '2025-11-20',
  },
  {
    id: 'brand-3',
    name: 'Granite Comfort Atlanta',
    region: 'Southeast',
    zipCodes: '30301, 30303, 30305, 30306, 30307, 30308, 30309',
    serviceTitanInstanceId: 'ST-GC-SE-001',
    jobTypeMapping: { ...defaultJobTypeMapping, 'HVAC Repair': 'ST-1001', 'HVAC Install': 'ST-1002' },
    dispatchRule: 'Auto-dispatch',
    bookingConfirmationMethod: 'SMS',
    primaryEscalationContact: 'Regional Ops — 404-555-0200',
    emergencyOverridePhone: '404-555-0133',
    addedAt: '2025-12-02',
  },
  {
    id: 'brand-4',
    name: 'Granite Comfort Dallas',
    region: 'Southwest',
    zipCodes: '75201, 75202, 75203, 75204, 75205, 75206',
    serviceTitanInstanceId: 'ST-GC-SW-001',
    jobTypeMapping: { ...defaultJobTypeMapping, 'Plumbing Repair': 'ST-2001', 'Drain Cleaning': 'ST-2002' },
    dispatchRule: 'Auto-dispatch',
    bookingConfirmationMethod: 'SMS',
    primaryEscalationContact: 'Regional Ops — 214-555-0200',
    emergencyOverridePhone: '214-555-0155',
    addedAt: '2025-12-09',
  },
  {
    id: 'brand-5',
    name: 'Granite Comfort Philadelphia',
    region: 'Northeast',
    zipCodes: '19103, 19107, 19106, 19148, 19145, 19146',
    serviceTitanInstanceId: 'ST-GC-NE-002',
    jobTypeMapping: { ...defaultJobTypeMapping },
    dispatchRule: 'Auto-dispatch',
    bookingConfirmationMethod: 'SMS',
    primaryEscalationContact: 'Regional Ops — 215-555-0100',
    emergencyOverridePhone: '215-555-0111',
    addedAt: '2025-12-15',
  },
  {
    id: 'brand-6',
    name: 'Blue Dot Services',
    region: 'West',
    zipCodes: '90210, 90211, 90212, 90024, 90025, 90034',
    serviceTitanInstanceId: 'ST-BD-W-001',
    jobTypeMapping: { ...defaultJobTypeMapping, 'HVAC Repair': 'ST-1001', 'HVAC Install': 'ST-1002' },
    dispatchRule: 'Auto-dispatch',
    bookingConfirmationMethod: 'Email',
    primaryEscalationContact: 'Ops Team — 310-555-0050',
    emergencyOverridePhone: '310-555-0060',
    addedAt: '2026-01-03',
  },
  {
    id: 'brand-7',
    name: 'Bardi Home Services',
    region: 'Southeast',
    zipCodes: '30318, 30319, 30324, 30326, 30327, 30328',
    serviceTitanInstanceId: 'ST-BH-SE-001',
    jobTypeMapping: { ...defaultJobTypeMapping, 'HVAC Repair': 'ST-1001', 'Electrical': 'ST-3001' },
    dispatchRule: 'Hold for review',
    bookingConfirmationMethod: 'Both',
    primaryEscalationContact: 'Ops Team — 678-555-0070',
    emergencyOverridePhone: '678-555-0080',
    addedAt: '2026-01-10',
  },
]

const openDay = (open, close) => ({ open, close, closed: false })
const closedDay = { open: '', close: '', closed: true }

export const defaultTemplateFields = {
  // Identity & Persona
  communicationStyle: { value: 'Professional' },
  serviceCategory: { value: [] },

  // Rules — Scheduling
  jobTypesAvailable: { value: [] },
  bookingWindow: { value: 'Same day' },

  // Rules — Service Area
  callerOutsideArea: { value: 'Decline and end call' },

  // Rules — Unavailable escalation handling
  unavailableEscalationBehavior: { value: 'Take a message' },
  emergencyUnavailableBehavior: { value: 'Take a message' },

  // Rules — Escalation
  escalationTriggers: { value: ['Caller requests human'] },
  fallbackIfNoAnswer: { value: 'Leave voicemail' },

  // Service Areas
  serviceAreaLogic: { value: 'Agent will decline calls from outside defined zip codes' },
  zipCodes: { value: '' },

  // Scripts
  introScript: { value: "Hi, you've reached [Brand Name], how can I help you today?" },
  qualificationQuestions: {
    value: [
      "What's the nature of the issue you're experiencing?",
      'When did the problem start?',
      'Have you had any previous service on this unit?',
    ],
  },
  outOfServiceAreaResponse: { value: "I'm sorry, but we don't currently service your area. I'd recommend reaching out to a local provider." },
  afterHoursResponse: { value: "We're currently closed, but I'd be happy to take a message and have someone reach out during business hours." },
  objectionHandling: { value: "If caller asks about pricing: 'Our technician will provide a full estimate before any work begins.'\nIf caller asks about availability: 'Let me check our next available slot for you.'" },
  closingScript: { value: "We've got you scheduled. You'll receive a confirmation shortly. Is there anything else I can help you with today?" },

  // CRM Setup
  dispatchRule: { value: 'Auto-dispatch' },
  bookingConfirmationMethod: { value: 'SMS' },
}

export const initialTemplates = [
  {
    id: 'tmpl-1',
    name: 'HVAC Default',
    type: 'system',
    status: 'published',
    lastEdited: '2025-10-28',
    fields: {
      ...defaultTemplateFields,
      serviceCategory: { value: ['HVAC'] },
      jobTypesAvailable: { value: ['HVAC Repair', 'HVAC Install'] },
      bookingWindow: { value: 'Same day' },
      escalationTriggers: { value: ['Caller requests human', 'Booking failure'] },
    },
  },
  {
    id: 'tmpl-2',
    name: 'Plumbing Default',
    type: 'system',
    status: 'published',
    lastEdited: '2025-10-28',
    fields: {
      ...defaultTemplateFields,
      serviceCategory: { value: ['Plumbing'] },
      jobTypesAvailable: { value: ['Plumbing Repair', 'Drain Cleaning'] },
      bookingWindow: { value: 'Next day' },
      escalationTriggers: { value: ['Caller requests human', 'Job type requires confirmation'] },
    },
  },
]

export const initialAgents = [
  {
    id: 'agt-1',
    brandId: 'brand-1',
    brandName: 'Yost and Campbell',
    region: 'Northeast',
    status: 'live',
    templateId: 'tmpl-1',
    templateName: 'HVAC Default',
    createdAt: '2025-11-14',
    fields: {
      hoursOfOperation: {
        Mon: openDay('07:00', '19:00'), Tue: openDay('07:00', '19:00'),
        Wed: openDay('07:00', '19:00'), Thu: openDay('07:00', '19:00'),
        Fri: openDay('07:00', '19:00'), Sat: openDay('08:00', '16:00'),
        Sun: closedDay,
      },
    },
  },
  {
    id: 'agt-2',
    brandId: 'brand-2',
    brandName: 'Granite Comfort Chicago',
    region: 'Midwest',
    status: 'live',
    templateId: 'tmpl-2',
    templateName: 'Plumbing Default',
    createdAt: '2025-11-21',
    fields: {
      hoursOfOperation: {
        Mon: openDay('07:00', '20:00'), Tue: openDay('07:00', '20:00'),
        Wed: openDay('07:00', '20:00'), Thu: openDay('07:00', '20:00'),
        Fri: openDay('07:00', '20:00'), Sat: openDay('07:00', '20:00'),
        Sun: closedDay,
      },
    },
  },
  {
    id: 'agt-3',
    brandId: 'brand-3',
    brandName: 'Granite Comfort Atlanta',
    region: 'Southeast',
    status: 'draft',
    templateId: 'tmpl-1',
    templateName: 'HVAC Default',
    createdAt: '2025-12-03',
    fields: {
      hoursOfOperation: {
        Mon: openDay('08:00', '18:00'), Tue: openDay('08:00', '18:00'),
        Wed: openDay('08:00', '18:00'), Thu: openDay('08:00', '18:00'),
        Fri: openDay('08:00', '18:00'), Sat: closedDay,
        Sun: closedDay,
      },
    },
  },
  {
    id: 'agt-4',
    brandId: 'brand-4',
    brandName: 'Granite Comfort Dallas',
    region: 'Southwest',
    status: 'draft',
    templateId: 'tmpl-2',
    templateName: 'Plumbing Default',
    createdAt: '2025-12-10',
    fields: {
      hoursOfOperation: {
        Mon: openDay('07:00', '19:00'), Tue: openDay('07:00', '19:00'),
        Wed: openDay('07:00', '19:00'), Thu: openDay('07:00', '19:00'),
        Fri: openDay('07:00', '19:00'), Sat: closedDay,
        Sun: closedDay,
      },
    },
  },
]
