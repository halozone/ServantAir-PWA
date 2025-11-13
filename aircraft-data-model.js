/**
 * Aircraft Data Model - Comprehensive Compliance Tracking
 *
 * This file defines the complete aircraft data structure for ServantAir
 * including all FAA, CBP, and FCC compliance requirements.
 *
 * Based on research documented in aircraft.md
 */

// Aircraft operation types
const OPERATION_TYPES = {
    PART_91_FLYING_CLUB: 'part_91_flying_club',
    PART_61_FLIGHT_SCHOOL: 'part_61_flight_school',
    PART_141_FLIGHT_SCHOOL: 'part_141_flight_school',
    PART_135_CHARTER: 'part_135_charter'
};

// Compliance status levels
const COMPLIANCE_STATUS = {
    CURRENT: 'current',      // >30 days until due
    WARNING: 'warning',      // 15-30 days until due
    EXPIRED: 'expired',      // <15 days or overdue
    NOT_APPLICABLE: 'n/a'    // Not required for this operation type
};

// Complete aircraft data structure
const aircraftTemplate = {
    // ==================== BASIC IDENTIFICATION ====================
    identification: {
        tailNumber: '',           // e.g., "N123AB"
        manufacturer: '',         // e.g., "Cessna"
        model: '',               // e.g., "172 Skyhawk"
        year: null,              // e.g., 2019
        serialNumber: '',        // Aircraft serial number
        typeDesignator: ''       // ICAO designator (e.g., "C172")
    },

    // ==================== OPERATION TYPE ====================
    operationType: [],           // Array - can have multiple types
    // Example: ['part_91_flying_club', 'part_61_flight_school']

    // ==================== AIRCRAFT SPECIFICATIONS ====================
    specifications: {
        engineType: '',          // "single_piston", "multi_piston", "turboprop", "jet"
        numberOfEngines: 1,
        seats: {
            total: 4,
            passenger: 3         // Excluding pilot
        },
        weights: {
            maxGrossWeight: 0,   // lbs
            emptyWeight: 0,      // lbs
            usefulLoad: 0        // lbs
        },
        performance: {
            cruiseSpeed: 0,      // knots
            range: 0,            // nautical miles
            serviceCeiling: 0    // feet
        },
        fuel: {
            capacity: 0,         // gallons
            usable: 0,          // gallons
            type: ''            // "100LL", "JetA", etc.
        }
    },

    // ==================== REQUIRED DOCUMENTS (AROW) ====================
    requiredDocuments: {
        // A - Airworthiness Certificate
        airworthinessCertificate: {
            status: COMPLIANCE_STATUS.CURRENT,
            number: '',
            category: 'standard',  // "standard", "limited", "experimental"
            issuedDate: null,
            displayedInAircraft: true,
            notes: ''
        },

        // R - Registration Certificate
        registrationCertificate: {
            status: COMPLIANCE_STATUS.CURRENT,
            registrationNumber: '',
            issuedDate: null,
            expirationDate: null,  // 7 years from issue
            daysUntilExpiration: null,
            onboardAircraft: true,
            notes: ''
        },

        // O - Operating Limitations
        operatingLimitations: {
            status: COMPLIANCE_STATUS.CURRENT,
            pohAfmAvailable: true,
            pohAfmCurrent: true,
            placardsComplete: true,
            lastUpdated: null,
            notes: ''
        },

        // W - Weight and Balance
        weightAndBalance: {
            status: COMPLIANCE_STATUS.CURRENT,
            lastUpdated: null,
            emptyWeight: 0,
            emptyWeightCG: 0,
            equipmentList: true,
            notes: ''
        }
    },

    // ==================== INTERNATIONAL OPERATIONS ====================
    internationalOperations: {
        enabled: false,  // Set true if aircraft used for international flights

        // CBP Customs Decal (Annual)
        customsDecal: {
            status: COMPLIANCE_STATUS.NOT_APPLICABLE,
            required: false,
            decalNumber: '',
            purchaseDate: null,
            expirationDate: null,  // Calendar year (Dec 31)
            daysUntilExpiration: null,
            cost: 31.00,
            notes: ''
        },

        // eAPIS Registration
        eapisRegistration: {
            status: COMPLIANCE_STATUS.NOT_APPLICABLE,
            required: false,
            enrolled: false,
            enrollmentDate: null,
            accountEmail: '',
            notes: 'Submit manifest 30 min before arrival, 1 hour before departure'
        },

        // FCC Radio Station License (10 years)
        fccRadioLicense: {
            status: COMPLIANCE_STATUS.NOT_APPLICABLE,
            required: false,
            callsign: '',
            licenseNumber: '',
            issuedDate: null,
            expirationDate: null,  // 10 years from issue
            daysUntilExpiration: null,
            cost: 170.00,
            notes: ''
        },

        // Restricted Radiotelephone Operator Permit (Lifetime)
        restrictedRadioPermit: {
            status: COMPLIANCE_STATUS.NOT_APPLICABLE,
            required: false,
            holders: [],  // Array of crew members with permits
            notes: 'At least one crew member must hold this permit for international operations'
        }
    },

    // ==================== INSPECTIONS & MAINTENANCE ====================
    inspections: {
        // Annual Inspection (12 calendar months)
        annualInspection: {
            status: COMPLIANCE_STATUS.CURRENT,
            required: true,
            lastCompletedDate: null,
            dueDate: null,
            daysUntilDue: null,
            performedBy: '',      // Name and certificate number
            location: '',
            totalTime: 0,         // Aircraft total time at inspection
            cost: 0,
            notes: ''
        },

        // 100-Hour Inspection (100 hours tach time)
        hundredHourInspection: {
            status: COMPLIANCE_STATUS.CURRENT,
            required: false,      // Required if aircraft used for compensation/hire
            lastCompletedDate: null,
            lastCompletedTach: 0,
            nextDueTach: 0,
            currentTach: 0,
            hoursRemaining: 0,
            estimatedDueDate: null,  // Based on average usage
            performedBy: '',
            cost: 0,
            notes: ''
        },

        // Transponder Inspection (24 calendar months)
        transponderInspection: {
            status: COMPLIANCE_STATUS.CURRENT,
            required: true,
            lastCompletedDate: null,
            dueDate: null,
            daysUntilDue: null,
            performedBy: '',
            repairStationNumber: '',
            cost: 0,
            notes: 'FAR 91.413'
        },

        // Altimeter/Static System Inspection (24 calendar months)
        altimeterStaticInspection: {
            status: COMPLIANCE_STATUS.CURRENT,
            required: false,      // Required for IFR operations
            lastCompletedDate: null,
            dueDate: null,
            daysUntilDue: null,
            performedBy: '',
            repairStationNumber: '',
            cost: 0,
            notes: 'FAR 91.411 - Required for IFR'
        },

        // ELT Inspection (12 calendar months)
        eltInspection: {
            status: COMPLIANCE_STATUS.CURRENT,
            required: true,
            lastCompletedDate: null,
            dueDate: null,
            daysUntilDue: null,
            batteryExpirationDate: null,
            batteryReplaced: null,
            eltType: '406MHz',    // "121.5MHz", "406MHz"
            eltRegistered: false,  // Must be registered with NOAA
            noaaRegistrationNumber: '',
            cost: 0,
            notes: ''
        },

        // VOR Check (30 days - if using VOR for IFR)
        vorCheck: {
            status: COMPLIANCE_STATUS.NOT_APPLICABLE,
            required: false,      // Only if using VOR for IFR navigation
            lastCompletedDate: null,
            dueDate: null,
            daysUntilDue: null,
            method: '',          // "VOT", "ground_checkpoint", "airborne_checkpoint", "dual_vor"
            location: '',
            bearingError: 0,
            performedBy: '',
            notes: ''
        },

        // Pitot-Static System (24 calendar months - combined with 91.411)
        pitotStaticInspection: {
            status: COMPLIANCE_STATUS.CURRENT,
            required: false,      // Required for IFR operations
            lastCompletedDate: null,
            dueDate: null,
            daysUntilDue: null,
            performedBy: '',
            notes: 'Typically combined with altimeter/static inspection'
        }
    },

    // ==================== AIRWORTHINESS DIRECTIVES ====================
    airworthinessDirectives: {
        allCurrent: true,
        lastReviewDate: null,
        applicableADs: [],  // Array of AD objects
        notes: ''
    },

    // AD Object Structure (for applicableADs array)
    adTemplate: {
        adNumber: '',           // e.g., "2023-15-06"
        description: '',
        applicableTo: '',       // "airframe", "engine", "propeller", "appliance"
        adType: '',            // "one_time", "recurring_calendar", "recurring_hours"
        lastComplianceDate: null,
        lastComplianceTach: 0,
        nextDueDate: null,
        nextDueTach: 0,
        status: COMPLIANCE_STATUS.CURRENT,
        complianceMethod: '',
        performedBy: '',
        notes: ''
    },

    // ==================== PART 135 SPECIFIC ====================
    part135Requirements: {
        applicable: false,

        // Continuous Airworthiness Maintenance Program
        camp: {
            required: false,      // Mandatory for 10+ seat aircraft
            approved: false,
            approvalDate: null,
            programType: '',     // "CAMP", "inspection_program", "manufacturer_program"
            notes: ''
        },

        // Minimum Equipment List
        mel: {
            required: false,
            opspecNumber: '',    // OpSpec D095
            approvalDate: null,
            tailSpecific: true,
            lastRevisionDate: null,
            deferredItems: [],   // Array of current deferred items
            notes: ''
        },

        // MEL Deferred Item Structure
        deferredItemTemplate: {
            itemDescription: '',
            deferralDate: null,
            category: '',        // "A", "B", "C", "D"
            dueDate: null,       // Based on category
            daysRemaining: 0,
            notes: ''
        },

        // Configuration Deviation List
        cdl: {
            applicable: false,
            approved: false,
            deviations: [],
            notes: ''
        },

        // Engine Trend Monitoring
        engineTrendMonitoring: {
            required: false,
            oilAnalysisInterval: 100,  // hours
            lastOilAnalysis: null,
            lastOilAnalysisTach: 0,
            nextDueTach: 0,
            provider: '',
            notes: ''
        },

        // Manufacturer TBO Compliance
        tboCompliance: {
            required: true,      // Required for Part 135
            engineTBO: 0,
            engineTimeSinceMajorOverhaul: 0,
            propellerTBO: 0,
            propellerTimeSinceOverhaul: 0,
            notes: 'Part 135 must comply with manufacturer TBO'
        }
    },

    // ==================== AIRCRAFT TIME & USAGE ====================
    time: {
        airframeTotal: 0,
        engineTotal: 0,
        propellerTotal: 0,
        tachometer: 0,
        hobbsMeter: 0,
        lastUpdated: null,

        // Usage statistics
        hoursThisMonth: 0,
        hoursThisYear: 0,
        averageHoursPerMonth: 0,

        // Life-limited parts
        lifeLimitedParts: []
    },

    // Life-Limited Part Structure
    lifeLimitedPartTemplate: {
        partName: '',
        partNumber: '',
        serialNumber: '',
        lifeLimit: 0,         // hours or cycles
        currentTime: 0,
        remainingLife: 0,
        dueDate: null,        // Estimated based on usage
        notes: ''
    },

    // ==================== OPERATIONAL STATUS ====================
    operationalStatus: {
        currentStatus: 'available',  // "available", "maintenance", "booked", "grounded"
        airworthy: true,

        // Grounding logic
        grounded: false,
        groundingReasons: [],  // Array of expired required items

        // Operation restrictions
        restrictions: {
            ifrRestricted: false,
            ifrRestrictionReason: '',
            internationalRestricted: false,
            internationalRestrictionReason: '',
            nightRestricted: false,
            nightRestrictionReason: '',
            customRestrictions: []
        },

        lastStatusUpdate: null,
        notes: ''
    },

    // ==================== RATES & BILLING ====================
    rates: {
        hourlyRate: 0,
        hourlyRateInstructor: 0,
        minimumCharge: 0,
        overnightFee: 0,
        currency: 'USD'
    },

    // ==================== INSURANCE ====================
    insurance: {
        company: '',
        policyNumber: '',
        effectiveDate: null,
        expirationDate: null,
        daysUntilExpiration: null,
        coverage: {
            hullValue: 0,
            liability: 0,
            passengerLiability: 0
        },
        pilotRequirements: {
            minTotalTime: 0,
            minPIC: 0,
            minRetract: 0,      // If retractable gear
            minComplex: 0,      // If complex aircraft
            minInType: 0
        },
        notes: ''
    },

    // ==================== EQUIPMENT & AVIONICS ====================
    equipment: {
        // IFR Equipment
        ifrCertified: false,
        gpsType: '',          // "none", "vfr", "ifr", "waas"
        autopilot: false,
        autopilotType: '',

        // Aircraft Categories
        complex: false,        // Retractable gear, controllable prop, or flaps
        highPerformance: false,  // >200 HP
        tailwheel: false,
        multiEngine: false,
        pressurized: false,

        // Additional Equipment
        adsb: true,
        transponderMode: 'C',  // "C", "S"
        tcas: false,
        weatherRadar: false,
        deiceEquipment: false,
        oxygenSystem: false,

        // Communication/Navigation
        radios: [],
        navEquipment: [],

        notes: ''
    },

    // ==================== PILOT REQUIREMENTS ====================
    pilotRequirements: {
        minimumCertificate: 'private',  // "student", "sport", "recreational", "private", "commercial", "atp"
        endorsementsRequired: [],       // e.g., ["high_performance", "complex", "tailwheel"]
        checkoutRequired: true,
        minimumHours: 0,
        minimumPIC: 0,
        currency: {
            landingsDay: 3,     // Per 90 days
            landingsNight: 3,   // Per 90 days
            instrumentApproaches: 6  // Per 6 months (if IFR)
        },
        notes: ''
    },

    // ==================== MAINTENANCE RECORDS ====================
    maintenanceRecords: {
        logbooksComplete: true,
        logbookLocation: '',
        lastLogbookReview: null,
        discrepancies: [],
        squawks: [],
        notes: ''
    },

    // Squawk Object Structure
    squawkTemplate: {
        reportedDate: null,
        reportedBy: '',
        description: '',
        severity: '',         // "minor", "major", "grounding"
        status: '',          // "open", "in_progress", "resolved"
        resolvedDate: null,
        resolvedBy: '',
        resolution: '',
        notes: ''
    },

    // ==================== LOCATION & SCHEDULING ====================
    location: {
        homeBase: '',         // Airport code (e.g., "KPIT")
        currentLocation: '',
        hangarNumber: '',
        tieDownSpot: '',
        notes: ''
    },

    scheduling: {
        available: true,
        bookingLeadTime: 0,   // hours
        maxBookingDuration: 0,  // hours
        minimumBooking: 0,    // hours
        notes: ''
    },

    // ==================== CONTACTS ====================
    contacts: {
        owner: '',
        maintenanceFacility: '',
        insuranceAgent: '',
        avionicsShop: '',
        notes: ''
    },

    // ==================== METADATA ====================
    metadata: {
        createdDate: null,
        createdBy: '',
        lastModified: null,
        lastModifiedBy: '',
        version: 1
    }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate compliance status based on due date
 * @param {Date} dueDate - The due date for the item
 * @returns {string} - Status: 'current', 'warning', or 'expired'
 */
function calculateComplianceStatus(dueDate) {
    if (!dueDate) return COMPLIANCE_STATUS.NOT_APPLICABLE;

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return COMPLIANCE_STATUS.EXPIRED;
    } else if (diffDays <= 30 && diffDays >= 15) {
        return COMPLIANCE_STATUS.WARNING;
    } else {
        return COMPLIANCE_STATUS.CURRENT;
    }
}

/**
 * Calculate days until expiration
 * @param {Date} expirationDate
 * @returns {number} - Days until expiration (negative if expired)
 */
function calculateDaysUntilExpiration(expirationDate) {
    if (!expirationDate) return null;

    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine if aircraft should be grounded
 * @param {Object} aircraft - Aircraft object
 * @returns {Object} - { grounded: boolean, reasons: [] }
 */
function checkGroundingStatus(aircraft) {
    const groundingReasons = [];

    // Check required documents
    if (aircraft.requiredDocuments.airworthinessCertificate.status === COMPLIANCE_STATUS.EXPIRED) {
        groundingReasons.push('Airworthiness Certificate expired or invalid');
    }
    if (aircraft.requiredDocuments.registrationCertificate.status === COMPLIANCE_STATUS.EXPIRED) {
        groundingReasons.push('Registration Certificate expired');
    }

    // Check required inspections
    if (aircraft.inspections.annualInspection.status === COMPLIANCE_STATUS.EXPIRED) {
        groundingReasons.push('Annual Inspection overdue');
    }
    if (aircraft.inspections.hundredHourInspection.required &&
        aircraft.inspections.hundredHourInspection.status === COMPLIANCE_STATUS.EXPIRED) {
        groundingReasons.push('100-Hour Inspection overdue');
    }
    if (aircraft.inspections.eltInspection.status === COMPLIANCE_STATUS.EXPIRED) {
        groundingReasons.push('ELT Inspection overdue');
    }

    // Check Airworthiness Directives
    if (!aircraft.airworthinessDirectives.allCurrent) {
        groundingReasons.push('Airworthiness Directive(s) not complied with');
    }

    // Check for grounding squawks
    const groundingSquawks = aircraft.maintenanceRecords.squawks.filter(
        s => s.severity === 'grounding' && s.status === 'open'
    );
    if (groundingSquawks.length > 0) {
        groundingReasons.push(`${groundingSquawks.length} grounding squawk(s) open`);
    }

    return {
        grounded: groundingReasons.length > 0,
        reasons: groundingReasons
    };
}

/**
 * Determine operation restrictions
 * @param {Object} aircraft - Aircraft object
 * @returns {Object} - Restrictions object
 */
function checkOperationRestrictions(aircraft) {
    const restrictions = {
        ifrRestricted: false,
        ifrRestrictionReason: '',
        internationalRestricted: false,
        internationalRestrictionReason: '',
        nightRestricted: false,
        nightRestrictionReason: ''
    };

    // IFR restrictions
    if (!aircraft.equipment.ifrCertified) {
        restrictions.ifrRestricted = true;
        restrictions.ifrRestrictionReason = 'Aircraft not IFR certified';
    } else if (aircraft.inspections.altimeterStaticInspection.required &&
               aircraft.inspections.altimeterStaticInspection.status === COMPLIANCE_STATUS.EXPIRED) {
        restrictions.ifrRestricted = true;
        restrictions.ifrRestrictionReason = 'Altimeter/Static System inspection overdue';
    } else if (aircraft.inspections.transponderInspection.status === COMPLIANCE_STATUS.EXPIRED) {
        restrictions.ifrRestricted = true;
        restrictions.ifrRestrictionReason = 'Transponder inspection overdue';
    } else if (aircraft.inspections.vorCheck.required &&
               aircraft.inspections.vorCheck.status === COMPLIANCE_STATUS.EXPIRED) {
        restrictions.ifrRestricted = true;
        restrictions.ifrRestrictionReason = 'VOR check overdue (if using VOR for navigation)';
    }

    // International restrictions
    if (aircraft.internationalOperations.enabled) {
        if (aircraft.internationalOperations.fccRadioLicense.status === COMPLIANCE_STATUS.EXPIRED) {
            restrictions.internationalRestricted = true;
            restrictions.internationalRestrictionReason = 'FCC Radio Station License expired';
        } else if (aircraft.internationalOperations.customsDecal.status === COMPLIANCE_STATUS.EXPIRED) {
            restrictions.internationalRestricted = true;
            restrictions.internationalRestrictionReason = 'CBP Customs Decal expired';
        } else if (!aircraft.internationalOperations.restrictedRadioPermit.holders.length) {
            restrictions.internationalRestricted = true;
            restrictions.internationalRestrictionReason = 'No crew member holds Restricted Radiotelephone Operator Permit';
        }
    }

    // Night restrictions (placeholder for specific requirements)
    // Add logic here if aircraft has night operation restrictions

    return restrictions;
}

/**
 * Update all compliance statuses for aircraft
 * @param {Object} aircraft - Aircraft object
 * @returns {Object} - Updated aircraft object
 */
function updateAllComplianceStatuses(aircraft) {
    // Update registration
    if (aircraft.requiredDocuments.registrationCertificate.expirationDate) {
        aircraft.requiredDocuments.registrationCertificate.daysUntilExpiration =
            calculateDaysUntilExpiration(aircraft.requiredDocuments.registrationCertificate.expirationDate);
        aircraft.requiredDocuments.registrationCertificate.status =
            calculateComplianceStatus(aircraft.requiredDocuments.registrationCertificate.expirationDate);
    }

    // Update inspections
    if (aircraft.inspections.annualInspection.dueDate) {
        aircraft.inspections.annualInspection.daysUntilDue =
            calculateDaysUntilExpiration(aircraft.inspections.annualInspection.dueDate);
        aircraft.inspections.annualInspection.status =
            calculateComplianceStatus(aircraft.inspections.annualInspection.dueDate);
    }

    if (aircraft.inspections.transponderInspection.dueDate) {
        aircraft.inspections.transponderInspection.daysUntilDue =
            calculateDaysUntilExpiration(aircraft.inspections.transponderInspection.dueDate);
        aircraft.inspections.transponderInspection.status =
            calculateComplianceStatus(aircraft.inspections.transponderInspection.dueDate);
    }

    if (aircraft.inspections.altimeterStaticInspection.dueDate) {
        aircraft.inspections.altimeterStaticInspection.daysUntilDue =
            calculateDaysUntilExpiration(aircraft.inspections.altimeterStaticInspection.dueDate);
        aircraft.inspections.altimeterStaticInspection.status =
            calculateComplianceStatus(aircraft.inspections.altimeterStaticInspection.dueDate);
    }

    if (aircraft.inspections.eltInspection.dueDate) {
        aircraft.inspections.eltInspection.daysUntilDue =
            calculateDaysUntilExpiration(aircraft.inspections.eltInspection.dueDate);
        aircraft.inspections.eltInspection.status =
            calculateComplianceStatus(aircraft.inspections.eltInspection.dueDate);
    }

    if (aircraft.inspections.vorCheck.dueDate) {
        aircraft.inspections.vorCheck.daysUntilDue =
            calculateDaysUntilExpiration(aircraft.inspections.vorCheck.dueDate);
        aircraft.inspections.vorCheck.status =
            calculateComplianceStatus(aircraft.inspections.vorCheck.dueDate);
    }

    // Update international operations
    if (aircraft.internationalOperations.customsDecal.expirationDate) {
        aircraft.internationalOperations.customsDecal.daysUntilExpiration =
            calculateDaysUntilExpiration(aircraft.internationalOperations.customsDecal.expirationDate);
        aircraft.internationalOperations.customsDecal.status =
            calculateComplianceStatus(aircraft.internationalOperations.customsDecal.expirationDate);
    }

    if (aircraft.internationalOperations.fccRadioLicense.expirationDate) {
        aircraft.internationalOperations.fccRadioLicense.daysUntilExpiration =
            calculateDaysUntilExpiration(aircraft.internationalOperations.fccRadioLicense.expirationDate);
        aircraft.internationalOperations.fccRadioLicense.status =
            calculateComplianceStatus(aircraft.internationalOperations.fccRadioLicense.expirationDate);
    }

    // Update insurance
    if (aircraft.insurance.expirationDate) {
        aircraft.insurance.daysUntilExpiration =
            calculateDaysUntilExpiration(aircraft.insurance.expirationDate);
    }

    // Check grounding status
    const groundingStatus = checkGroundingStatus(aircraft);
    aircraft.operationalStatus.grounded = groundingStatus.grounded;
    aircraft.operationalStatus.groundingReasons = groundingStatus.reasons;

    // Check restrictions
    aircraft.operationalStatus.restrictions = checkOperationRestrictions(aircraft);

    // Update airworthy status
    aircraft.operationalStatus.airworthy = !aircraft.operationalStatus.grounded;

    return aircraft;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        aircraftTemplate,
        OPERATION_TYPES,
        COMPLIANCE_STATUS,
        calculateComplianceStatus,
        calculateDaysUntilExpiration,
        checkGroundingStatus,
        checkOperationRestrictions,
        updateAllComplianceStatuses
    };
}
