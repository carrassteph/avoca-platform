export const BRANDS = [
  'Yost and Campbell',
  'Granite Comfort Chicago',
  'Granite Comfort Atlanta',
  'Granite Comfort Dallas',
  'Granite Comfort Philadelphia',
  'Granite Comfort Columbus',
  'Blue Dot Services',
  'Bardi Home Services',
  'Unique Indoor Comfort',
]

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
    brandName: 'Yost and Campbell',
    region: 'Northeast',
    status: 'live',
    templateId: 'tmpl-1',
    templateName: 'HVAC Default',
    createdAt: '2025-11-14',
    fields: {
      brandName: 'Yost and Campbell',
      zipCodes: '02101, 02111, 02116, 02118, 02127, 02134, 02138, 02139, 02140',
      hoursOfOperation: 'Mon–Fri 7am–7pm, Sat 8am–4pm',
      serviceTitanInstanceId: 'ST-YC-NE-001',
      emergencyOverridePhone: '617-555-0142',
      primaryEscalationContact: 'Mike Yost — 617-555-0190',
    },
  },
  {
    id: 'agt-2',
    brandName: 'Granite Comfort Chicago',
    region: 'Midwest',
    status: 'live',
    templateId: 'tmpl-2',
    templateName: 'Plumbing Default',
    createdAt: '2025-11-21',
    fields: {
      brandName: 'Granite Comfort Chicago',
      zipCodes: '60601, 60602, 60603, 60604, 60605, 60606, 60607, 60608',
      hoursOfOperation: 'Mon–Sat 7am–8pm',
      serviceTitanInstanceId: 'ST-GC-CHI-002',
      emergencyOverridePhone: '312-555-0177',
      primaryEscalationContact: 'Regional Ops — 312-555-0200',
    },
  },
  {
    id: 'agt-3',
    brandName: 'Granite Comfort Atlanta',
    region: 'Southeast',
    status: 'draft',
    templateId: 'tmpl-1',
    templateName: 'HVAC Default',
    createdAt: '2025-12-03',
    fields: {
      brandName: 'Granite Comfort Atlanta',
      zipCodes: '30301, 30303, 30305, 30306, 30307, 30308, 30309',
      hoursOfOperation: 'Mon–Fri 8am–6pm',
      serviceTitanInstanceId: 'ST-GC-ATL-003',
      emergencyOverridePhone: '404-555-0133',
      primaryEscalationContact: 'Regional Ops — 404-555-0200',
    },
  },
  {
    id: 'agt-4',
    brandName: 'Granite Comfort Dallas',
    region: 'Southwest',
    status: 'draft',
    templateId: 'tmpl-2',
    templateName: 'Plumbing Default',
    createdAt: '2025-12-10',
    fields: {
      brandName: 'Granite Comfort Dallas',
      zipCodes: '75201, 75202, 75203, 75204, 75205, 75206',
      hoursOfOperation: 'Mon–Fri 7am–7pm',
      serviceTitanInstanceId: 'ST-GC-DAL-004',
      emergencyOverridePhone: '214-555-0155',
      primaryEscalationContact: 'Regional Ops — 214-555-0200',
    },
  },
]
