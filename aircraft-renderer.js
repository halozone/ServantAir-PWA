/**
 * Aircraft Card Renderer - ServantAir
 *
 * Dynamically renders aircraft cards with comprehensive compliance tracking
 */

// Import data (will be available from included scripts)
// aircraft-data-model.js and aircraft-sample-data.js must be loaded first

/**
 * Calculate days until a date
 */
function calculateDaysUntil(dateString) {
    if (!dateString) return null;
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get compliance status class based on days until due
 */
function getComplianceStatusClass(daysUntil) {
    if (daysUntil === null) return 'n/a';
    if (daysUntil < 0) return 'expired';
    if (daysUntil <= 30) return 'warning';
    return 'current';
}

/**
 * Get status icon based on compliance status
 */
function getStatusIcon(status) {
    switch(status) {
        case 'current': return '✓';
        case 'warning': return '⚠';
        case 'expired': return '✗';
        case 'n/a': return '—';
        default: return '?';
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

/**
 * Get days until text with color
 */
function getDaysUntilText(daysUntil, status) {
    if (daysUntil === null) return '';

    if (daysUntil < 0) {
        const overdue = Math.abs(daysUntil);
        return `<span style="color: #e53e3e; font-weight: bold;">(${overdue} days overdue)</span>`;
    } else if (status === 'warning') {
        return `<span style="color: #d69e2e; font-weight: bold;">(${daysUntil} days)</span>`;
    }
    return '';
}

/**
 * Render operation type badges
 */
function renderOperationTypeBadges(operationTypes) {
    const badges = {
        'part_91_flying_club': { text: 'Part 91 Club', color: '#4299e1' },
        'part_61_flight_school': { text: 'Part 61 School', color: '#48bb78' },
        'part_141_flight_school': { text: 'Part 141 School', color: '#9f7aea' },
        'part_135_charter': { text: 'Part 135 Charter', color: '#ed8936' }
    };

    return operationTypes.map(type => {
        const badge = badges[type] || { text: type, color: '#718096' };
        return `<span style="display: inline-block; padding: 4px 10px; background: ${badge.color}; color: white; border-radius: 12px; font-size: 11px; font-weight: 600; margin-right: 4px; margin-bottom: 4px;">${badge.text}</span>`;
    }).join('');
}

/**
 * Render grounding banner
 */
function renderGroundingBanner(aircraft) {
    if (!aircraft.operationalStatus.grounded) return '';

    return `
        <div style="background: #fed7d7; border-left: 4px solid #e53e3e; padding: 16px; margin-bottom: 16px; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 24px;">🚫</span>
                <strong style="color: #c53030; font-size: 16px;">AIRCRAFT GROUNDED</strong>
            </div>
            <div style="color: #742a2a; font-size: 14px;">
                ${aircraft.operationalStatus.groundingReasons.map(reason =>
                    `<div style="margin-bottom: 4px;">• ${reason}</div>`
                ).join('')}
            </div>
        </div>
    `;
}

/**
 * Render operation restrictions
 */
function renderRestrictions(aircraft) {
    const restrictions = aircraft.operationalStatus.restrictions;
    const restrictionBadges = [];

    if (restrictions.ifrRestricted) {
        restrictionBadges.push(`
            <div style="background: #feebc8; border-left: 3px solid #ed8936; padding: 8px 12px; margin-bottom: 8px; border-radius: 6px; font-size: 13px;">
                <strong style="color: #c05621;">⚠️ IFR Operations Not Permitted</strong>
                <div style="color: #7c2d12; font-size: 12px; margin-top: 4px;">${restrictions.ifrRestrictionReason}</div>
            </div>
        `);
    }

    if (restrictions.internationalRestricted) {
        restrictionBadges.push(`
            <div style="background: #feebc8; border-left: 3px solid #ed8936; padding: 8px 12px; margin-bottom: 8px; border-radius: 6px; font-size: 13px;">
                <strong style="color: #c05621;">⚠️ International Operations Not Permitted</strong>
                <div style="color: #7c2d12; font-size: 12px; margin-top: 4px;">${restrictions.internationalRestrictionReason}</div>
            </div>
        `);
    }

    if (restrictions.nightRestricted) {
        restrictionBadges.push(`
            <div style="background: #feebc8; border-left: 3px solid #ed8936; padding: 8px 12px; margin-bottom: 8px; border-radius: 6px; font-size: 13px;">
                <strong style="color: #c05621;">⚠️ Night Operations Not Permitted</strong>
                <div style="color: #7c2d12; font-size: 12px; margin-top: 4px;">${restrictions.nightRestrictionReason}</div>
            </div>
        `);
    }

    return restrictionBadges.length > 0 ? restrictionBadges.join('') : '';
}

/**
 * Render certification item
 */
function renderCertItem(name, dateText, status) {
    return `
        <div class="cert-item ${status}">
            <div class="cert-info">
                <div class="cert-name">${name}</div>
                <div class="cert-date">${dateText}</div>
            </div>
            <div class="cert-status-icon ${status}">${getStatusIcon(status)}</div>
        </div>
    `;
}

/**
 * Render Documentation & Certification section
 */
function renderDocumentationSection(aircraft) {
    const docs = aircraft.requiredDocuments;

    return `
        <div class="section-title">📋 Documentation & Certification</div>
        ${renderCertItem(
            'Airworthiness Certificate',
            docs.airworthinessCertificate.displayedInAircraft ? 'Valid • Displayed in aircraft' : 'Valid',
            docs.airworthinessCertificate.status
        )}
        ${renderCertItem(
            'Registration Certificate',
            `Expires: ${formatDate(docs.registrationCertificate.expirationDate)} (${docs.registrationCertificate.daysUntilExpiration} days)`,
            docs.registrationCertificate.status
        )}
        ${renderCertItem(
            'Weight & Balance',
            `Updated: ${formatDate(docs.weightAndBalance.lastUpdated)}`,
            docs.weightAndBalance.status
        )}
        ${renderCertItem(
            'Operating Limitations (POH/AFM)',
            docs.operatingLimitations.pohAfmCurrent ? 'Current • Available onboard' : 'Check status',
            docs.operatingLimitations.status
        )}
    `;
}

/**
 * Render Maintenance & Inspection section
 */
function renderMaintenanceSection(aircraft) {
    const inspections = aircraft.inspections;
    let html = '<div class="section-title">🔧 Maintenance & Inspection</div>';

    // Annual Inspection
    if (inspections.annualInspection.required) {
        const daysUntil = calculateDaysUntil(inspections.annualInspection.dueDate);
        const status = getComplianceStatusClass(daysUntil);
        html += renderCertItem(
            'Annual Inspection',
            `Due: ${formatDate(inspections.annualInspection.dueDate)} ${getDaysUntilText(daysUntil, status)}`,
            status
        );
    }

    // 100-Hour Inspection
    if (inspections.hundredHourInspection.required) {
        const hoursRemaining = inspections.hundredHourInspection.hoursRemaining;
        let status = 'current';
        if (hoursRemaining < 0) status = 'expired';
        else if (hoursRemaining <= 10) status = 'warning';

        html += renderCertItem(
            '100-Hour Inspection',
            hoursRemaining >= 0
                ? `Due: ${inspections.hundredHourInspection.nextDueTach.toFixed(1)} tach (${hoursRemaining.toFixed(1)} hours remaining)`
                : `OVERDUE by ${Math.abs(hoursRemaining).toFixed(1)} hours`,
            status
        );
    }

    // Transponder
    if (inspections.transponderInspection.required) {
        const daysUntil = calculateDaysUntil(inspections.transponderInspection.dueDate);
        const status = getComplianceStatusClass(daysUntil);
        html += renderCertItem(
            'Transponder Inspection',
            `Due: ${formatDate(inspections.transponderInspection.dueDate)} ${getDaysUntilText(daysUntil, status)}`,
            status
        );
    }

    // Altimeter/Static
    if (inspections.altimeterStaticInspection.required) {
        const daysUntil = calculateDaysUntil(inspections.altimeterStaticInspection.dueDate);
        const status = getComplianceStatusClass(daysUntil);
        html += renderCertItem(
            'Altimeter/Static System',
            `Due: ${formatDate(inspections.altimeterStaticInspection.dueDate)} ${getDaysUntilText(daysUntil, status)}`,
            status
        );
    }

    // ELT
    if (inspections.eltInspection.required) {
        const daysUntil = calculateDaysUntil(inspections.eltInspection.dueDate);
        const status = getComplianceStatusClass(daysUntil);
        html += renderCertItem(
            'ELT Inspection',
            `Due: ${formatDate(inspections.eltInspection.dueDate)} ${getDaysUntilText(daysUntil, status)}`,
            status
        );
    }

    // VOR Check
    if (inspections.vorCheck.required) {
        const daysUntil = calculateDaysUntil(inspections.vorCheck.dueDate);
        const status = getComplianceStatusClass(daysUntil);
        html += renderCertItem(
            'VOR Check (IFR)',
            `Due: ${formatDate(inspections.vorCheck.dueDate)} ${getDaysUntilText(daysUntil, status)}`,
            status
        );
    }

    // Airworthiness Directives
    html += renderCertItem(
        'Airworthiness Directives',
        aircraft.airworthinessDirectives.allCurrent
            ? `Current • Reviewed: ${formatDate(aircraft.airworthinessDirectives.lastReviewDate)}`
            : 'NOT COMPLIANT - Action required',
        aircraft.airworthinessDirectives.allCurrent ? 'current' : 'expired'
    );

    return html;
}

/**
 * Render Recent Maintenance Log entries
 */
function renderRecentMaintenanceLog(aircraft) {
    // Sample recent maintenance entries (in production, fetch from database)
    const recentEntries = [
        {
            date: '2024-03-15',
            type: 'Oil Change',
            mechanicInit: 'JS',
            cost: 125.00
        },
        {
            date: '2024-02-01',
            type: 'Annual Inspection',
            mechanicInit: 'JD',
            cost: 1850.00
        }
    ];

    if (recentEntries.length === 0) {
        return '';
    }

    let html = `
        <div style="margin: 16px 0; padding: 12px; background: #f7fafc; border-radius: 8px; border-left: 3px solid #10b981;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <div style="font-weight: 600; font-size: 13px; color: #1a202c;">📋 Recent Maintenance</div>
                <button class="mechanic-only" onclick="handleMaintenanceLog('${aircraft.identification.tailNumber}')" style="background: none; border: none; color: #10b981; font-size: 11px; font-weight: 600; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#d1fae5'" onmouseout="this.style.background='none'">View All →</button>
            </div>
    `;

    recentEntries.forEach(entry => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 12px;">
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #2d3748;">${entry.date}</div>
                    <div style="color: #718096; font-size: 11px;">${entry.type} • ${entry.mechanicInit}</div>
                </div>
                <div style="font-weight: 600; color: #10b981;">$${entry.cost.toFixed(2)}</div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

/**
 * Render International Operations section
 */
function renderInternationalSection(aircraft) {
    if (!aircraft.internationalOperations.enabled) {
        return `
            <div class="section-title">🌍 International Operations</div>
            <div class="cert-item n/a">
                <div class="cert-info">
                    <div class="cert-name">International Operations</div>
                    <div class="cert-date">Not configured for international flights</div>
                </div>
                <div class="cert-status-icon n/a">—</div>
            </div>
        `;
    }

    const intl = aircraft.internationalOperations;
    let html = '<div class="section-title">🌍 International Operations</div>';

    // Customs Decal
    if (intl.customsDecal.required) {
        const daysUntil = calculateDaysUntil(intl.customsDecal.expirationDate);
        const status = getComplianceStatusClass(daysUntil);
        html += renderCertItem(
            'CBP Customs Decal',
            `Expires: ${formatDate(intl.customsDecal.expirationDate)} ${getDaysUntilText(daysUntil, status)}`,
            status
        );
    }

    // eAPIS
    if (intl.eapisRegistration.required) {
        html += renderCertItem(
            'eAPIS Registration',
            intl.eapisRegistration.enrolled
                ? `Enrolled • Account: ${intl.eapisRegistration.accountEmail}`
                : 'NOT ENROLLED - Required for international',
            intl.eapisRegistration.enrolled ? 'current' : 'expired'
        );
    }

    // FCC Radio License
    if (intl.fccRadioLicense.required) {
        const daysUntil = calculateDaysUntil(intl.fccRadioLicense.expirationDate);
        const status = getComplianceStatusClass(daysUntil);
        html += renderCertItem(
            'FCC Radio Station License',
            `Callsign: ${intl.fccRadioLicense.callsign} • Expires: ${formatDate(intl.fccRadioLicense.expirationDate)}`,
            status
        );
    }

    // Radio Operator Permit
    if (intl.restrictedRadioPermit.required) {
        const hasPermitHolders = intl.restrictedRadioPermit.holders && intl.restrictedRadioPermit.holders.length > 0;
        html += renderCertItem(
            'Restricted Radio Operator Permit',
            hasPermitHolders
                ? `${intl.restrictedRadioPermit.holders.length} crew member(s) certified`
                : 'NO CREW CERTIFIED - At least one required',
            hasPermitHolders ? 'current' : 'expired'
        );
    }

    return html;
}

/**
 * Render complete aircraft card
 */
function renderAircraftCard(aircraft) {
    // Update compliance statuses first
    if (typeof updateAllComplianceStatuses === 'function') {
        aircraft = updateAllComplianceStatuses(aircraft);
    }

    const statusClass = aircraft.operationalStatus.currentStatus;
    const statusText = {
        'available': 'Available',
        'maintenance': 'Maintenance',
        'booked': 'Booked',
        'grounded': 'GROUNDED'
    }[statusClass] || statusClass;

    return `
        <div class="aircraft-card" data-tail-number="${aircraft.identification.tailNumber}">
            <div class="aircraft-header" onclick="showAircraftDetails('${aircraft.identification.tailNumber}')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                <div class="aircraft-id">${aircraft.identification.tailNumber}</div>
                <div class="aircraft-type">${aircraft.identification.manufacturer} ${aircraft.identification.model}</div>
                <div class="aircraft-status ${statusClass}">${statusText}</div>
            </div>
            <div class="aircraft-body">
                <!-- Operation Type Badges -->
                <div style="margin-bottom: 16px;">
                    ${renderOperationTypeBadges(aircraft.operationType)}
                </div>

                <!-- Grounding Banner -->
                ${renderGroundingBanner(aircraft)}

                <!-- Operation Restrictions -->
                ${renderRestrictions(aircraft)}

                <!-- Aircraft Specs -->
                <div class="aircraft-specs">
                    <div class="spec-item">
                        <div class="spec-value">${aircraft.time.airframeTotal.toFixed(1)}</div>
                        <div class="spec-label">Total Hours</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-value">$${aircraft.rates.hourlyRate}</div>
                        <div class="spec-label">Hourly Rate</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-value">${aircraft.time.hoursThisMonth}</div>
                        <div class="spec-label">Hours This Month</div>
                    </div>
                    <div class="spec-item">
                        <div class="spec-value">${aircraft.identification.year}</div>
                        <div class="spec-label">Year</div>
                    </div>
                </div>

                <!-- Airworthiness Sections -->
                <div class="airworthiness-sections">
                    ${renderDocumentationSection(aircraft)}
                    ${renderMaintenanceSection(aircraft)}
                    ${renderInternationalSection(aircraft)}
                </div>

                <!-- Recent Maintenance Log -->
                ${renderRecentMaintenanceLog(aircraft)}

                <!-- Actions -->
                <div class="aircraft-actions" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                    ${aircraft.operationalStatus.grounded
                        ? '<button class="action-btn" disabled style="opacity: 0.5; cursor: not-allowed; grid-column: span 2;">Grounded</button>'
                        : `<button class="action-btn primary" onclick="handleBookNow('${aircraft.identification.tailNumber}')" style="grid-column: span 2;">Book Now</button>`
                    }
                    <button class="action-btn" onclick="showAircraftDetails('${aircraft.identification.tailNumber}')" style="grid-column: span 2;">View Details</button>

                    <!-- Maintenance Actions -->
                    <button class="action-btn" onclick="handleReportMaintenance('${aircraft.identification.tailNumber}')" style="background: #feebc8; color: #c05621; border: 2px solid #ed8936;">Report Issue</button>
                    <button class="action-btn mechanic-only" onclick="handleScheduleMaintenance('${aircraft.identification.tailNumber}')" style="background: #e0e7ff; color: #4c51bf; border: 2px solid #667eea;">Schedule Maint.</button>
                    <button class="action-btn mechanic-only" onclick="handleMaintenanceLog('${aircraft.identification.tailNumber}')" style="grid-column: span 2; background: #d1fae5; color: #065f46; border: 2px solid #10b981;">Maintenance Log</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render entire fleet
 */
function renderAircraftFleet(aircraftArray) {
    const container = document.querySelector('.aircraft-grid');
    if (!container) {
        console.error('Aircraft grid container not found');
        return;
    }

    container.innerHTML = aircraftArray.map(aircraft => renderAircraftCard(aircraft)).join('');
}

/**
 * Update fleet statistics
 */
function updateFleetStatistics(aircraftArray) {
    const stats = {
        total: aircraftArray.length,
        available: aircraftArray.filter(a => a.operationalStatus.currentStatus === 'available').length,
        maintenance: aircraftArray.filter(a => a.operationalStatus.currentStatus === 'maintenance').length,
        grounded: aircraftArray.filter(a => a.operationalStatus.grounded).length
    };

    // Update stat cards
    const totalCard = document.querySelector('.fleet-stats .stat-card:nth-child(1) .stat-value');
    const availableCard = document.querySelector('.fleet-stats .stat-card:nth-child(2) .stat-value');
    const maintenanceCard = document.querySelector('.fleet-stats .stat-card:nth-child(3) .stat-value');

    if (totalCard) totalCard.textContent = stats.total;
    if (availableCard) availableCard.textContent = stats.available;
    if (maintenanceCard) maintenanceCard.textContent = stats.maintenance + stats.grounded;

    // Update availability percentage
    const availabilityText = document.querySelector('.fleet-stats .stat-card:nth-child(2) .stat-change');
    if (availabilityText) {
        const percentage = stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0;
        availabilityText.textContent = `${percentage}% availability`;
    }

    // Calculate total hours this month
    const totalHoursThisMonth = aircraftArray.reduce((sum, a) => sum + a.time.hoursThisMonth, 0);
    const avgUtilization = stats.total > 0 ? Math.round((totalHoursThisMonth / (stats.total * 100)) * 100) : 0;

    const utilizationCard = document.querySelector('.fleet-stats .stat-card:nth-child(4) .stat-value');
    if (utilizationCard) utilizationCard.textContent = `${avgUtilization}%`;
}

/**
 * Initialize aircraft display
 */
function initializeAircraftDisplay() {
    if (typeof sampleAircraftFleet !== 'undefined') {
        renderAircraftFleet(sampleAircraftFleet);
        updateFleetStatistics(sampleAircraftFleet);
        console.log('Aircraft fleet rendered successfully');
    } else {
        console.error('Sample aircraft data not loaded');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAircraftDisplay);
} else {
    initializeAircraftDisplay();
}

// Export functions for external use
if (typeof window !== 'undefined') {
    window.AircraftRenderer = {
        renderAircraftCard,
        renderAircraftFleet,
        updateFleetStatistics,
        initializeAircraftDisplay
    };
}
