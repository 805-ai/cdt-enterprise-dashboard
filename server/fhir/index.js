/**
 * CDT Enterprise - FHIR R4 Integration Module
 * Provides consent export in FHIR Consent Resource format
 * Compatible with Epic, Cerner, and other EHR systems
 */

/**
 * Convert a CDT permit to FHIR Consent Resource
 * @see https://www.hl7.org/fhir/consent.html
 */
function permitToFHIRConsent(permit) {
  return {
    resourceType: 'Consent',
    id: permit.permitId,
    meta: {
      versionId: '1',
      lastUpdated: permit.createdAt,
      profile: ['http://hl7.org/fhir/StructureDefinition/Consent'],
    },
    status: permit.revoked ? 'rejected' : 'active',
    scope: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/consentscope',
          code: 'patient-privacy',
          display: 'Privacy Consent',
        },
      ],
    },
    category: [
      {
        coding: [
          {
            system: 'http://loinc.org',
            code: '59284-0',
            display: 'Patient Consent',
          },
        ],
      },
    ],
    patient: {
      reference: `Patient/${permit.subjectId}`,
      display: permit.subjectId,
    },
    dateTime: permit.createdAt,
    performer: [
      {
        reference: `Practitioner/${permit.actor}`,
        display: permit.actor,
      },
    ],
    organization: [
      {
        reference: 'Organization/cdt-enterprise',
        display: 'CDT Enterprise System',
      },
    ],
    policy: [
      {
        authority: 'https://finalbosstech.com/cdt',
        uri: 'https://finalbosstech.com/cdt/policy/consent',
      },
    ],
    provision: {
      type: 'permit',
      period: {
        start: permit.createdAt,
        end: permit.expiresAt,
      },
      actor: [
        {
          role: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'CST',
                display: 'Custodian',
              },
            ],
          },
          reference: {
            reference: `Practitioner/${permit.actor}`,
          },
        },
      ],
      action: permit.allowedActions.map((action) => ({
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/consentaction',
            code: mapActionToFHIR(action),
            display: action,
          },
        ],
      })),
      class: permit.allowedResources.map((resource) => ({
        system: 'http://hl7.org/fhir/resource-types',
        code: mapResourceToFHIR(resource),
        display: resource,
      })),
    },
    // CDT-specific extension for chain verification
    extension: [
      {
        url: 'https://finalbosstech.com/fhir/StructureDefinition/cdt-signature',
        valueString: permit.signature,
      },
      {
        url: 'https://finalbosstech.com/fhir/StructureDefinition/cdt-epoch',
        valueString: permit.epochId || '2024-001',
      },
    ],
  };
}

/**
 * Convert a CDT receipt to FHIR AuditEvent Resource
 * @see https://www.hl7.org/fhir/auditevent.html
 */
function receiptToFHIRAuditEvent(receipt) {
  return {
    resourceType: 'AuditEvent',
    id: receipt.receiptId,
    meta: {
      versionId: '1',
      lastUpdated: receipt.timestamp,
      profile: ['http://hl7.org/fhir/StructureDefinition/AuditEvent'],
    },
    type: {
      system: 'http://terminology.hl7.org/CodeSystem/audit-event-type',
      code: 'rest',
      display: 'RESTful Operation',
    },
    subtype: [
      {
        system: 'http://hl7.org/fhir/restful-interaction',
        code: mapActionToFHIRInteraction(receipt.action),
        display: receipt.action,
      },
    ],
    action: mapActionToFHIRAuditAction(receipt.action),
    recorded: receipt.timestamp,
    outcome: receipt.status === 'valid' ? '0' : '4', // 0 = success, 4 = minor failure
    agent: [
      {
        who: {
          reference: `Practitioner/${receipt.actor}`,
          display: receipt.actor,
        },
        requestor: true,
        policy: [`Consent/${receipt.permitId}`],
      },
    ],
    source: {
      observer: {
        reference: 'Device/cdt-engine',
        display: 'CDT Enterprise Engine',
      },
    },
    entity: [
      {
        what: {
          reference: `Patient/${receipt.subjectId}`,
        },
        type: {
          system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
          code: '1',
          display: 'Person',
        },
        role: {
          system: 'http://terminology.hl7.org/CodeSystem/object-role',
          code: '1',
          display: 'Patient',
        },
      },
      {
        what: {
          reference: mapResourceToFHIRReference(receipt.resource),
        },
        type: {
          system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
          code: '2',
          display: 'System Object',
        },
      },
    ],
    // CDT-specific extensions
    extension: [
      {
        url: 'https://finalbosstech.com/fhir/StructureDefinition/cdt-receipt-signature',
        valueString: receipt.signature,
      },
      {
        url: 'https://finalbosstech.com/fhir/StructureDefinition/cdt-prev-hash',
        valueString: receipt.prevHash,
      },
      {
        url: 'https://finalbosstech.com/fhir/StructureDefinition/cdt-hash',
        valueString: receipt.hash,
      },
      {
        url: 'https://finalbosstech.com/fhir/StructureDefinition/cdt-epoch',
        valueString: receipt.epochId,
      },
    ],
  };
}

/**
 * Create a FHIR Bundle for batch export
 */
function createFHIRBundle(resources, type = 'collection') {
  return {
    resourceType: 'Bundle',
    id: `cdt-export-${Date.now()}`,
    meta: {
      lastUpdated: new Date().toISOString(),
    },
    type,
    total: resources.length,
    entry: resources.map((resource) => ({
      fullUrl: `urn:uuid:${resource.id}`,
      resource,
    })),
  };
}

/**
 * Map CDT action to FHIR consent action code
 */
function mapActionToFHIR(action) {
  const mapping = {
    read: 'access',
    write: 'correct',
    share: 'disclose',
    export: 'disclose',
    print: 'disclose',
    fax: 'disclose',
    email: 'disclose',
    delete: 'correct',
  };
  return mapping[action] || 'access';
}

/**
 * Map CDT action to FHIR RESTful interaction
 */
function mapActionToFHIRInteraction(action) {
  const mapping = {
    read: 'read',
    write: 'update',
    share: 'read',
    export: 'search-type',
    print: 'read',
    fax: 'read',
    email: 'read',
    delete: 'delete',
  };
  return mapping[action] || 'read';
}

/**
 * Map CDT action to FHIR AuditEvent action code
 */
function mapActionToFHIRAuditAction(action) {
  const mapping = {
    read: 'R',
    write: 'U',
    share: 'R',
    export: 'R',
    print: 'R',
    fax: 'R',
    email: 'R',
    delete: 'D',
  };
  return mapping[action] || 'R';
}

/**
 * Map CDT resource to FHIR resource type
 */
function mapResourceToFHIR(resource) {
  const mapping = {
    medical_record: 'DocumentReference',
    lab_results: 'DiagnosticReport',
    imaging: 'ImagingStudy',
    prescription: 'MedicationRequest',
    visit_notes: 'Encounter',
    billing: 'Claim',
    insurance_claim: 'ClaimResponse',
    referral: 'ServiceRequest',
  };
  return mapping[resource] || 'DocumentReference';
}

/**
 * Map CDT resource to FHIR reference
 */
function mapResourceToFHIRReference(resource) {
  const resourceType = mapResourceToFHIR(resource);
  return `${resourceType}/${resource}`;
}

/**
 * Express router for FHIR endpoints
 */
function createFHIRRouter(express) {
  const router = express.Router();

  // FHIR Capability Statement
  router.get('/metadata', (req, res) => {
    res.json({
      resourceType: 'CapabilityStatement',
      status: 'active',
      date: new Date().toISOString(),
      publisher: 'FinalBoss Tech - CDT Enterprise',
      kind: 'instance',
      software: {
        name: 'CDT Enterprise FHIR Server',
        version: '1.0.0',
      },
      implementation: {
        description: 'CDT Enterprise FHIR R4 Integration',
        url: req.protocol + '://' + req.get('host') + '/api/fhir',
      },
      fhirVersion: '4.0.1',
      format: ['json'],
      rest: [
        {
          mode: 'server',
          resource: [
            {
              type: 'Consent',
              interaction: [{ code: 'read' }, { code: 'search-type' }],
              searchParam: [
                { name: 'patient', type: 'reference' },
                { name: 'status', type: 'token' },
              ],
            },
            {
              type: 'AuditEvent',
              interaction: [{ code: 'read' }, { code: 'search-type' }],
              searchParam: [
                { name: 'patient', type: 'reference' },
                { name: 'date', type: 'date' },
              ],
            },
          ],
        },
      ],
    });
  });

  // Export consents for a patient
  router.get('/Consent', (req, res) => {
    const { patient, status } = req.query;
    // In production, this would query the database
    // For now, return empty bundle
    res.json(createFHIRBundle([], 'searchset'));
  });

  // Export audit events for a patient
  router.get('/AuditEvent', (req, res) => {
    const { patient, date } = req.query;
    // In production, this would query the database
    res.json(createFHIRBundle([], 'searchset'));
  });

  // Get single consent by ID
  router.get('/Consent/:id', (req, res) => {
    res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          diagnostics: `Consent/${req.params.id} not found`,
        },
      ],
    });
  });

  // Get single audit event by ID
  router.get('/AuditEvent/:id', (req, res) => {
    res.status(404).json({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'error',
          code: 'not-found',
          diagnostics: `AuditEvent/${req.params.id} not found`,
        },
      ],
    });
  });

  return router;
}

module.exports = {
  permitToFHIRConsent,
  receiptToFHIRAuditEvent,
  createFHIRBundle,
  createFHIRRouter,
};
