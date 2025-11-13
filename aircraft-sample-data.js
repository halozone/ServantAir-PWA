/**
 * Sample Aircraft Data - ServantAir Fleet
 *
 * This file contains realistic sample data for testing the aircraft
 * compliance tracking system. Includes various compliance scenarios.
 */

// Helper function to calculate dates
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
}

function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result.toISOString().split('T')[0];
}

const today = new Date();

// ==================== AIRCRAFT 1: N123AB - Fully Compliant ====================
const aircraft_N123AB = {
    identification: {
        tailNumber: 'N123AB',
        manufacturer: 'Cessna',
        model: '172 Skyhawk',
        year: 2019,
        serialNumber: '17282145',
        typeDesignator: 'C172'
    },

    operationType: ['part_91_flying_club', 'part_61_flight_school'],

    specifications: {
        engineType: 'single_piston',
        numberOfEngines: 1,
        seats: {
            total: 4,
            passenger: 3
        },
        weights: {
            maxGrossWeight: 2550,
            emptyWeight: 1680,
            usefulLoad: 870
        },
        performance: {
            cruiseSpeed: 122,
            range: 640,
            serviceCeiling: 14000
        },
        fuel: {
            capacity: 56,
            usable: 53,
            type: '100LL'
        }
    },

    requiredDocuments: {
        airworthinessCertificate: {
            status: 'current',
            number: 'AC-2019-0145',
            category: 'standard',
            issuedDate: '2019-06-15',
            displayedInAircraft: true,
            notes: ''
        },
        registrationCertificate: {
            status: 'current',
            registrationNumber: 'N123AB',
            issuedDate: '2020-03-01',
            expirationDate: '2027-03-01',
            daysUntilExpiration: 487,
            onboardAircraft: true,
            notes: ''
        },
        operatingLimitations: {
            status: 'current',
            pohAfmAvailable: true,
            pohAfmCurrent: true,
            placardsComplete: true,
            lastUpdated: '2024-08-15',
            notes: ''
        },
        weightAndBalance: {
            status: 'current',
            lastUpdated: '2024-03-15',
            emptyWeight: 1680,
            emptyWeightCG: 39.5,
            equipmentList: true,
            notes: ''
        }
    },

    internationalOperations: {
        enabled: false,
        customsDecal: {
            status: 'n/a',
            required: false,
            decalNumber: '',
            purchaseDate: null,
            expirationDate: null,
            daysUntilExpiration: null,
            cost: 31.00,
            notes: ''
        },
        eapisRegistration: {
            status: 'n/a',
            required: false,
            enrolled: false,
            enrollmentDate: null,
            accountEmail: '',
            notes: ''
        },
        fccRadioLicense: {
            status: 'n/a',
            required: false,
            callsign: '',
            licenseNumber: '',
            issuedDate: null,
            expirationDate: null,
            daysUntilExpiration: null,
            cost: 170.00,
            notes: ''
        },
        restrictedRadioPermit: {
            status: 'n/a',
            required: false,
            holders: [],
            notes: ''
        }
    },

    inspections: {
        annualInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-10-15',
            dueDate: '2025-10-31',
            daysUntilDue: 303,
            performedBy: 'John Smith, A&P IA #1234567890',
            location: 'ABC Aviation - KPIT',
            totalTime: 1247,
            cost: 1850,
            notes: ''
        },
        hundredHourInspection: {
            status: 'warning',
            required: true,
            lastCompletedDate: '2024-09-20',
            lastCompletedTach: 1195.2,
            nextDueTach: 1295.2,
            currentTach: 1287.5,
            hoursRemaining: 7.7,
            estimatedDueDate: addDays(today, 23),
            performedBy: 'John Smith, A&P #1234567890',
            cost: 1650,
            notes: ''
        },
        transponderInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-06-20',
            dueDate: '2026-06-30',
            daysUntilDue: 607,
            performedBy: 'Clear Sky Aviation',
            repairStationNumber: 'R2FR683J',
            cost: 250,
            notes: 'FAR 91.413'
        },
        altimeterStaticInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-06-20',
            dueDate: '2026-06-30',
            daysUntilDue: 607,
            performedBy: 'Clear Sky Aviation',
            repairStationNumber: 'R2FR683J',
            cost: 200,
            notes: 'FAR 91.411 - Bundled with transponder'
        },
        eltInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-12-15',
            dueDate: '2025-12-31',
            daysUntilDue: 303,
            batteryExpirationDate: '2026-03-01',
            batteryReplaced: '2024-03-01',
            eltType: '406MHz',
            eltRegistered: true,
            noaaRegistrationNumber: 'ELT123456789',
            cost: 75,
            notes: 'Performed with annual inspection'
        },
        vorCheck: {
            status: 'current',
            required: true,
            lastCompletedDate: addDays(today, -15),
            dueDate: addDays(today, 15),
            daysUntilDue: 15,
            method: 'VOT',
            location: 'KPIT',
            bearingError: 2,
            performedBy: 'Michael Johnson, CFI',
            notes: ''
        },
        pitotStaticInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-06-20',
            dueDate: '2026-06-30',
            daysUntilDue: 607,
            performedBy: 'Clear Sky Aviation',
            notes: 'Combined with altimeter/static'
        }
    },

    airworthinessDirectives: {
        allCurrent: true,
        lastReviewDate: '2024-08-15',
        applicableADs: [
            {
                adNumber: '2023-15-06',
                description: 'Wing spar inspection',
                applicableTo: 'airframe',
                adType: 'recurring_hours',
                lastComplianceDate: '2024-08-15',
                lastComplianceTach: 1247.0,
                nextDueDate: null,
                nextDueTach: 1347.0,
                status: 'current',
                complianceMethod: 'Visual inspection per AD instructions',
                performedBy: 'John Smith, A&P IA #1234567890',
                notes: 'Recurring every 100 flight hours'
            }
        ],
        notes: ''
    },

    part135Requirements: {
        applicable: false,
        camp: { required: false, approved: false, approvalDate: null, programType: '', notes: '' },
        mel: { required: false, opspecNumber: '', approvalDate: null, tailSpecific: true, lastRevisionDate: null, deferredItems: [], notes: '' },
        cdl: { applicable: false, approved: false, deviations: [], notes: '' },
        engineTrendMonitoring: { required: false, oilAnalysisInterval: 0, lastOilAnalysis: null, lastOilAnalysisTach: 0, nextDueTach: 0, provider: '', notes: '' },
        tboCompliance: { required: false, engineTBO: 2000, engineTimeSinceMajorOverhaul: 450, propellerTBO: 0, propellerTimeSinceOverhaul: 0, notes: '' }
    },

    time: {
        airframeTotal: 1272.5,
        engineTotal: 450.2,
        propellerTotal: 1272.5,
        tachometer: 1272.5,
        hobbsMeter: 1285.3,
        lastUpdated: today.toISOString().split('T')[0],
        hoursThisMonth: 45,
        hoursThisYear: 320,
        averageHoursPerMonth: 26.7,
        lifeLimitedParts: []
    },

    operationalStatus: {
        currentStatus: 'available',
        airworthy: true,
        grounded: false,
        groundingReasons: [],
        restrictions: {
            ifrRestricted: false,
            ifrRestrictionReason: '',
            internationalRestricted: false,
            internationalRestrictionReason: '',
            nightRestricted: false,
            nightRestrictionReason: '',
            customRestrictions: []
        },
        lastStatusUpdate: today.toISOString().split('T')[0],
        notes: ''
    },

    rates: {
        hourlyRate: 110,
        hourlyRateInstructor: 95,
        minimumCharge: 1.0,
        overnightFee: 50,
        currency: 'USD'
    },

    insurance: {
        company: 'Aviation Insurance Corp',
        policyNumber: 'AIC-2024-5678',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        daysUntilExpiration: 62,
        coverage: {
            hullValue: 180000,
            liability: 1000000,
            passengerLiability: 100000
        },
        pilotRequirements: {
            minTotalTime: 100,
            minPIC: 50,
            minRetract: 0,
            minComplex: 0,
            minInType: 5
        },
        notes: ''
    },

    equipment: {
        ifrCertified: true,
        gpsType: 'waas',
        autopilot: false,
        autopilotType: '',
        complex: false,
        highPerformance: false,
        tailwheel: false,
        multiEngine: false,
        pressurized: false,
        adsb: true,
        transponderMode: 'S',
        tcas: false,
        weatherRadar: false,
        deiceEquipment: false,
        oxygenSystem: false,
        radios: ['Garmin GTR 225', 'KX 155'],
        navEquipment: ['Garmin GTN 650', 'VOR/LOC'],
        notes: ''
    },

    pilotRequirements: {
        minimumCertificate: 'private',
        endorsementsRequired: [],
        checkoutRequired: true,
        minimumHours: 75,
        minimumPIC: 40,
        currency: {
            landingsDay: 3,
            landingsNight: 3,
            instrumentApproaches: 6
        },
        notes: ''
    },

    maintenanceRecords: {
        logbooksComplete: true,
        logbookLocation: 'Main office safe',
        lastLogbookReview: '2024-08-15',
        discrepancies: [],
        squawks: [],
        notes: ''
    },

    location: {
        homeBase: 'KPIT',
        currentLocation: 'KPIT',
        hangarNumber: 'H-12',
        tieDownSpot: '',
        notes: ''
    },

    scheduling: {
        available: true,
        bookingLeadTime: 2,
        maxBookingDuration: 48,
        minimumBooking: 1,
        notes: ''
    },

    contacts: {
        owner: 'ServantAir LLC',
        maintenanceFacility: 'ABC Aviation - KPIT',
        insuranceAgent: 'Jane Doe - Aviation Insurance Corp',
        avionicsShop: 'Clear Sky Aviation',
        notes: ''
    },

    metadata: {
        createdDate: '2024-01-15',
        createdBy: 'System Admin',
        lastModified: today.toISOString().split('T')[0],
        lastModifiedBy: 'System',
        version: 1
    }
};

// ==================== AIRCRAFT 2: N456CD - Maintenance Issues ====================
const aircraft_N456CD = {
    identification: {
        tailNumber: 'N456CD',
        manufacturer: 'Piper',
        model: 'PA-28-180 Cherokee',
        year: 2017,
        serialNumber: 'PA28-7505234',
        typeDesignator: 'P28A'
    },

    operationType: ['part_61_flight_school'],

    specifications: {
        engineType: 'single_piston',
        numberOfEngines: 1,
        seats: {
            total: 4,
            passenger: 3
        },
        weights: {
            maxGrossWeight: 2400,
            emptyWeight: 1410,
            usefulLoad: 990
        },
        performance: {
            cruiseSpeed: 125,
            range: 696,
            serviceCeiling: 15000
        },
        fuel: {
            capacity: 50,
            usable: 48,
            type: '100LL'
        }
    },

    requiredDocuments: {
        airworthinessCertificate: {
            status: 'current',
            number: 'AC-2017-0892',
            category: 'standard',
            issuedDate: '2017-09-10',
            displayedInAircraft: true,
            notes: ''
        },
        registrationCertificate: {
            status: 'current',
            registrationNumber: 'N456CD',
            issuedDate: '2019-11-12',
            expirationDate: '2026-11-12',
            daysUntilExpiration: 408,
            onboardAircraft: true,
            notes: ''
        },
        operatingLimitations: {
            status: 'current',
            pohAfmAvailable: true,
            pohAfmCurrent: true,
            placardsComplete: true,
            lastUpdated: '2023-05-22',
            notes: ''
        },
        weightAndBalance: {
            status: 'current',
            lastUpdated: '2023-05-22',
            emptyWeight: 1410,
            emptyWeightCG: 38.2,
            equipmentList: true,
            notes: ''
        }
    },

    internationalOperations: {
        enabled: false,
        customsDecal: {
            status: 'n/a',
            required: false,
            decalNumber: '',
            purchaseDate: null,
            expirationDate: null,
            daysUntilExpiration: null,
            cost: 31.00,
            notes: ''
        },
        eapisRegistration: {
            status: 'n/a',
            required: false,
            enrolled: false,
            enrollmentDate: null,
            accountEmail: '',
            notes: ''
        },
        fccRadioLicense: {
            status: 'n/a',
            required: false,
            callsign: '',
            licenseNumber: '',
            issuedDate: null,
            expirationDate: null,
            daysUntilExpiration: null,
            cost: 170.00,
            notes: ''
        },
        restrictedRadioPermit: {
            status: 'n/a',
            required: false,
            holders: [],
            notes: ''
        }
    },

    inspections: {
        annualInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-11-22',
            dueDate: '2025-11-31',
            daysUntilDue: 211,
            performedBy: 'Mike Wilson, A&P IA #9876543210',
            location: 'XYZ Maintenance - KAGC',
            totalTime: 2156,
            cost: 2100,
            notes: ''
        },
        hundredHourInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-10-15',
            lastCompletedTach: 2118.3,
            nextDueTach: 2218.3,
            currentTach: 2164.8,
            hoursRemaining: 53.5,
            estimatedDueDate: addDays(today, 67),
            performedBy: 'Mike Wilson, A&P #9876543210',
            cost: 1750,
            notes: ''
        },
        transponderInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2023-11-10',
            dueDate: '2025-11-30',
            daysUntilDue: 395,
            performedBy: 'Avionics Place',
            repairStationNumber: 'R3IL482M',
            cost: 350,
            notes: 'FAR 91.413'
        },
        altimeterStaticInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2023-11-10',
            dueDate: '2025-11-30',
            daysUntilDue: 395,
            performedBy: 'Avionics Place',
            repairStationNumber: 'R3IL482M',
            cost: 300,
            notes: 'FAR 91.411'
        },
        eltInspection: {
            status: 'expired',
            required: true,
            lastCompletedDate: '2024-10-15',
            dueDate: '2025-10-31',
            daysUntilDue: -31,
            batteryExpirationDate: '2025-10-01',
            batteryReplaced: '2020-10-01',
            eltType: '406MHz',
            eltRegistered: true,
            noaaRegistrationNumber: 'ELT987654321',
            cost: 0,
            notes: 'OVERDUE - Aircraft grounded'
        },
        vorCheck: {
            status: 'n/a',
            required: false,
            lastCompletedDate: null,
            dueDate: null,
            daysUntilDue: null,
            method: '',
            location: '',
            bearingError: 0,
            performedBy: '',
            notes: 'VFR only operations'
        },
        pitotStaticInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2023-11-10',
            dueDate: '2025-11-30',
            daysUntilDue: 395,
            performedBy: 'Avionics Place',
            notes: 'Combined with altimeter/static'
        }
    },

    airworthinessDirectives: {
        allCurrent: true,
        lastReviewDate: '2024-05-22',
        applicableADs: [
            {
                adNumber: '2022-08-12',
                description: 'Wing attach bolt inspection',
                applicableTo: 'airframe',
                adType: 'recurring_calendar',
                lastComplianceDate: '2024-05-22',
                lastComplianceTach: 2156.0,
                nextDueDate: '2025-05-31',
                nextDueTach: 0,
                status: 'current',
                complianceMethod: 'Inspection per AD instructions',
                performedBy: 'Mike Wilson, A&P IA #9876543210',
                notes: 'Recurring annually'
            }
        ],
        notes: ''
    },

    part135Requirements: {
        applicable: false,
        camp: { required: false, approved: false, approvalDate: null, programType: '', notes: '' },
        mel: { required: false, opspecNumber: '', approvalDate: null, tailSpecific: true, lastRevisionDate: null, deferredItems: [], notes: '' },
        cdl: { applicable: false, approved: false, deviations: [], notes: '' },
        engineTrendMonitoring: { required: false, oilAnalysisInterval: 0, lastOilAnalysis: null, lastOilAnalysisTach: 0, nextDueTach: 0, provider: '', notes: '' },
        tboCompliance: { required: false, engineTBO: 2000, engineTimeSinceMajorOverhaul: 680, propellerTBO: 0, propellerTimeSinceOverhaul: 0, notes: '' }
    },

    time: {
        airframeTotal: 2164.8,
        engineTotal: 680.5,
        propellerTotal: 2164.8,
        tachometer: 2164.8,
        hobbsMeter: 2180.2,
        lastUpdated: today.toISOString().split('T')[0],
        hoursThisMonth: 38,
        hoursThisYear: 280,
        averageHoursPerMonth: 23.3,
        lifeLimitedParts: []
    },

    operationalStatus: {
        currentStatus: 'maintenance',
        airworthy: false,
        grounded: true,
        groundingReasons: ['ELT Inspection overdue'],
        restrictions: {
            ifrRestricted: false,
            ifrRestrictionReason: '',
            internationalRestricted: false,
            internationalRestrictionReason: '',
            nightRestricted: false,
            nightRestrictionReason: '',
            customRestrictions: []
        },
        lastStatusUpdate: today.toISOString().split('T')[0],
        notes: 'Grounded pending ELT inspection'
    },

    rates: {
        hourlyRate: 115,
        hourlyRateInstructor: 100,
        minimumCharge: 1.0,
        overnightFee: 50,
        currency: 'USD'
    },

    insurance: {
        company: 'SkyGuard Insurance',
        policyNumber: 'SKY-2024-9012',
        effectiveDate: '2024-03-15',
        expirationDate: '2025-03-15',
        daysUntilExpiration: 135,
        coverage: {
            hullValue: 150000,
            liability: 1000000,
            passengerLiability: 100000
        },
        pilotRequirements: {
            minTotalTime: 100,
            minPIC: 50,
            minRetract: 0,
            minComplex: 0,
            minInType: 10
        },
        notes: ''
    },

    equipment: {
        ifrCertified: true,
        gpsType: 'ifr',
        autopilot: false,
        autopilotType: '',
        complex: false,
        highPerformance: false,
        tailwheel: false,
        multiEngine: false,
        pressurized: false,
        adsb: true,
        transponderMode: 'C',
        tcas: false,
        weatherRadar: false,
        deiceEquipment: false,
        oxygenSystem: false,
        radios: ['KX 155', 'KX 175B'],
        navEquipment: ['Garmin GNS 430', 'VOR/LOC'],
        notes: ''
    },

    pilotRequirements: {
        minimumCertificate: 'private',
        endorsementsRequired: [],
        checkoutRequired: true,
        minimumHours: 75,
        minimumPIC: 40,
        currency: {
            landingsDay: 3,
            landingsNight: 3,
            instrumentApproaches: 6
        },
        notes: ''
    },

    maintenanceRecords: {
        logbooksComplete: true,
        logbookLocation: 'Main office safe',
        lastLogbookReview: '2024-05-22',
        discrepancies: [],
        squawks: [
            {
                reportedDate: '2024-10-25',
                reportedBy: 'Sarah Thompson, CFI',
                description: 'ELT inspection overdue',
                severity: 'grounding',
                status: 'open',
                resolvedDate: null,
                resolvedBy: '',
                resolution: '',
                notes: 'Scheduling inspection this week'
            }
        ],
        notes: ''
    },

    location: {
        homeBase: 'KAGC',
        currentLocation: 'KAGC',
        hangarNumber: '',
        tieDownSpot: 'T-45',
        notes: ''
    },

    scheduling: {
        available: false,
        bookingLeadTime: 2,
        maxBookingDuration: 48,
        minimumBooking: 1,
        notes: 'Aircraft in maintenance - unavailable for booking'
    },

    contacts: {
        owner: 'ServantAir LLC',
        maintenanceFacility: 'XYZ Maintenance - KAGC',
        insuranceAgent: 'Bob Smith - SkyGuard Insurance',
        avionicsShop: 'Avionics Place',
        notes: ''
    },

    metadata: {
        createdDate: '2023-01-10',
        createdBy: 'System Admin',
        lastModified: today.toISOString().split('T')[0],
        lastModifiedBy: 'System',
        version: 1
    }
};

// ==================== AIRCRAFT 3: N789EF - International Capable ====================
const aircraft_N789EF = {
    identification: {
        tailNumber: 'N789EF',
        manufacturer: 'Cessna',
        model: '182T Skylane',
        year: 2020,
        serialNumber: '18283456',
        typeDesignator: 'C182'
    },

    operationType: ['part_91_flying_club'],

    specifications: {
        engineType: 'single_piston',
        numberOfEngines: 1,
        seats: {
            total: 4,
            passenger: 3
        },
        weights: {
            maxGrossWeight: 3110,
            emptyWeight: 1950,
            usefulLoad: 1160
        },
        performance: {
            cruiseSpeed: 145,
            range: 820,
            serviceCeiling: 18100
        },
        fuel: {
            capacity: 88,
            usable: 87.5,
            type: '100LL'
        }
    },

    requiredDocuments: {
        airworthinessCertificate: {
            status: 'current',
            number: 'AC-2020-0678',
            category: 'standard',
            issuedDate: '2020-05-20',
            displayedInAircraft: true,
            notes: ''
        },
        registrationCertificate: {
            status: 'current',
            registrationNumber: 'N789EF',
            issuedDate: '2020-06-01',
            expirationDate: '2027-06-01',
            daysUntilExpiration: 579,
            onboardAircraft: true,
            notes: ''
        },
        operatingLimitations: {
            status: 'current',
            pohAfmAvailable: true,
            pohAfmCurrent: true,
            placardsComplete: true,
            lastUpdated: '2024-09-12',
            notes: ''
        },
        weightAndBalance: {
            status: 'current',
            lastUpdated: '2024-09-12',
            emptyWeight: 1950,
            emptyWeightCG: 40.8,
            equipmentList: true,
            notes: ''
        }
    },

    internationalOperations: {
        enabled: true,
        customsDecal: {
            status: 'current',
            required: true,
            decalNumber: 'CBP-2025-456789',
            purchaseDate: '2024-12-15',
            expirationDate: '2025-12-31',
            daysUntilExpiration: 395,
            cost: 31.00,
            notes: 'Valid for calendar year 2025'
        },
        eapisRegistration: {
            status: 'current',
            required: true,
            enrolled: true,
            enrollmentDate: '2023-05-10',
            accountEmail: 'ops@servantair.com',
            notes: 'Submit manifest 30 min before arrival, 1 hour before departure'
        },
        fccRadioLicense: {
            status: 'current',
            required: true,
            callsign: 'WD9XYZ',
            licenseNumber: 'FCC-0012345678',
            issuedDate: '2023-07-15',
            expirationDate: '2033-07-15',
            daysUntilExpiration: 3150,
            cost: 170.00,
            notes: 'Valid for 10 years'
        },
        restrictedRadioPermit: {
            status: 'current',
            required: true,
            holders: [
                { name: 'John Pilot', permitNumber: 'RR-123456', expirationDate: 'Lifetime' },
                { name: 'Jane Instructor', permitNumber: 'RR-789012', expirationDate: 'Lifetime' }
            ],
            notes: 'At least one crew member must hold this permit'
        }
    },

    inspections: {
        annualInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-09-12',
            dueDate: '2025-09-30',
            daysUntilDue: 333,
            performedBy: 'Robert Davis, A&P IA #5551234567',
            location: 'Premier Aviation - KFDK',
            totalTime: 3024,
            cost: 2250,
            notes: ''
        },
        hundredHourInspection: {
            status: 'n/a',
            required: false,
            lastCompletedDate: null,
            lastCompletedTach: 0,
            nextDueTach: 0,
            currentTach: 3045.2,
            hoursRemaining: 0,
            estimatedDueDate: null,
            performedBy: '',
            cost: 0,
            notes: 'Not required - Part 91 flying club only'
        },
        transponderInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-04-18',
            dueDate: '2026-04-30',
            daysUntilDue: 516,
            performedBy: 'Leading Edge Avionics',
            repairStationNumber: 'R4CA829L',
            cost: 280,
            notes: 'FAR 91.413'
        },
        altimeterStaticInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-04-18',
            dueDate: '2026-04-30',
            daysUntilDue: 516,
            performedBy: 'Leading Edge Avionics',
            repairStationNumber: 'R4CA829L',
            cost: 250,
            notes: 'FAR 91.411'
        },
        eltInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-12-12',
            dueDate: '2025-12-30',
            daysUntilDue: 333,
            batteryExpirationDate: '2027-03-01',
            batteryReplaced: '2023-03-01',
            eltType: '406MHz',
            eltRegistered: true,
            noaaRegistrationNumber: 'ELT456789012',
            cost: 85,
            notes: 'Performed with annual'
        },
        vorCheck: {
            status: 'current',
            required: true,
            lastCompletedDate: addDays(today, -10),
            dueDate: addDays(today, 20),
            daysUntilDue: 20,
            method: 'ground_checkpoint',
            location: 'KFDK',
            bearingError: 3,
            performedBy: 'Tom Richards, CFI',
            notes: ''
        },
        pitotStaticInspection: {
            status: 'current',
            required: true,
            lastCompletedDate: '2024-04-18',
            dueDate: '2026-04-30',
            daysUntilDue: 516,
            performedBy: 'Leading Edge Avionics',
            notes: 'Combined with altimeter/static'
        }
    },

    airworthinessDirectives: {
        allCurrent: true,
        lastReviewDate: '2024-09-12',
        applicableADs: [
            {
                adNumber: '2024-02-08',
                description: 'Fuel system inspection',
                applicableTo: 'airframe',
                adType: 'one_time',
                lastComplianceDate: '2024-09-12',
                lastComplianceTach: 3024.0,
                nextDueDate: null,
                nextDueTach: 0,
                status: 'current',
                complianceMethod: 'One-time inspection completed',
                performedBy: 'Robert Davis, A&P IA #5551234567',
                notes: 'One-time AD complied with'
            }
        ],
        notes: ''
    },

    part135Requirements: {
        applicable: false,
        camp: { required: false, approved: false, approvalDate: null, programType: '', notes: '' },
        mel: { required: false, opspecNumber: '', approvalDate: null, tailSpecific: true, lastRevisionDate: null, deferredItems: [], notes: '' },
        cdl: { applicable: false, approved: false, deviations: [], notes: '' },
        engineTrendMonitoring: { required: false, oilAnalysisInterval: 0, lastOilAnalysis: null, lastOilAnalysisTach: 0, nextDueTach: 0, provider: '', notes: '' },
        tboCompliance: { required: false, engineTBO: 2000, engineTimeSinceMajorOverhaul: 345, propellerTBO: 0, propellerTimeSinceOverhaul: 0, notes: '' }
    },

    time: {
        airframeTotal: 3045.2,
        engineTotal: 345.8,
        propellerTotal: 3045.2,
        tachometer: 3045.2,
        hobbsMeter: 3062.1,
        lastUpdated: today.toISOString().split('T')[0],
        hoursThisMonth: 52,
        hoursThisYear: 385,
        averageHoursPerMonth: 32.1,
        lifeLimitedParts: []
    },

    operationalStatus: {
        currentStatus: 'available',
        airworthy: true,
        grounded: false,
        groundingReasons: [],
        restrictions: {
            ifrRestricted: false,
            ifrRestrictionReason: '',
            internationalRestricted: false,
            internationalRestrictionReason: '',
            nightRestricted: false,
            nightRestrictionReason: '',
            customRestrictions: []
        },
        lastStatusUpdate: today.toISOString().split('T')[0],
        notes: 'Fully compliant for international operations'
    },

    rates: {
        hourlyRate: 130,
        hourlyRateInstructor: 115,
        minimumCharge: 1.5,
        overnightFee: 75,
        currency: 'USD'
    },

    insurance: {
        company: 'Global Aviation Insurance',
        policyNumber: 'GAI-2024-3344',
        effectiveDate: '2024-06-01',
        expirationDate: '2025-06-01',
        daysUntilExpiration: 212,
        coverage: {
            hullValue: 280000,
            liability: 2000000,
            passengerLiability: 200000
        },
        pilotRequirements: {
            minTotalTime: 250,
            minPIC: 100,
            minRetract: 25,
            minComplex: 0,
            minInType: 10
        },
        notes: 'International operations coverage included'
    },

    equipment: {
        ifrCertified: true,
        gpsType: 'waas',
        autopilot: true,
        autopilotType: 'Garmin GFC 500',
        complex: false,
        highPerformance: true,
        tailwheel: false,
        multiEngine: false,
        pressurized: false,
        adsb: true,
        transponderMode: 'S',
        tcas: false,
        weatherRadar: false,
        deiceEquipment: false,
        oxygenSystem: true,
        radios: ['Garmin GTR 225A', 'Garmin GTR 225B'],
        navEquipment: ['Garmin GTN 750', 'Garmin G5 (2)', 'VOR/LOC'],
        notes: 'High-performance endorsement required (>200 HP)'
    },

    pilotRequirements: {
        minimumCertificate: 'private',
        endorsementsRequired: ['high_performance'],
        checkoutRequired: true,
        minimumHours: 150,
        minimumPIC: 75,
        currency: {
            landingsDay: 3,
            landingsNight: 3,
            instrumentApproaches: 6
        },
        notes: 'High-performance endorsement required'
    },

    maintenanceRecords: {
        logbooksComplete: true,
        logbookLocation: 'Main office safe',
        lastLogbookReview: '2024-09-12',
        discrepancies: [],
        squawks: [],
        notes: ''
    },

    location: {
        homeBase: 'KFDK',
        currentLocation: 'KFDK',
        hangarNumber: 'H-8',
        tieDownSpot: '',
        notes: ''
    },

    scheduling: {
        available: true,
        bookingLeadTime: 4,
        maxBookingDuration: 72,
        minimumBooking: 2,
        notes: 'Popular aircraft - book in advance'
    },

    contacts: {
        owner: 'ServantAir LLC',
        maintenanceFacility: 'Premier Aviation - KFDK',
        insuranceAgent: 'Lisa Chen - Global Aviation Insurance',
        avionicsShop: 'Leading Edge Avionics',
        notes: ''
    },

    metadata: {
        createdDate: '2023-06-20',
        createdBy: 'System Admin',
        lastModified: today.toISOString().split('T')[0],
        lastModifiedBy: 'System',
        version: 1
    }
};

// Export all aircraft
const sampleAircraftFleet = [
    aircraft_N123AB,
    aircraft_N456CD,
    aircraft_N789EF
];

// Export for use in HTML file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sampleAircraftFleet,
        aircraft_N123AB,
        aircraft_N456CD,
        aircraft_N789EF
    };
}
