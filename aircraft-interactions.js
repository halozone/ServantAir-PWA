/**
 * Aircraft Interactions - ServantAir
 *
 * Handles all button clicks and modal interactions for aircraft management
 */

// Store reference to current aircraft fleet
let currentFleet = [];

/**
 * Find aircraft by tail number
 */
function findAircraftByTailNumber(tailNumber) {
    if (typeof sampleAircraftFleet !== 'undefined') {
        return sampleAircraftFleet.find(a => a.identification.tailNumber === tailNumber);
    }
    return currentFleet.find(a => a.identification.tailNumber === tailNumber);
}

/**
 * Show aircraft details modal
 */
function showAircraftDetails(tailNumber) {
    const aircraft = findAircraftByTailNumber(tailNumber);
    if (!aircraft) {
        alert('Aircraft not found: ' + tailNumber);
        return;
    }

    const modal = document.getElementById('aircraftDetailsModal');
    const modalBody = document.getElementById('aircraftDetailsBody');

    if (!modal || !modalBody) {
        console.error('Aircraft details modal not found');
        return;
    }

    // Populate modal content
    modalBody.innerHTML = generateAircraftDetailsHTML(aircraft);

    // Show modal
    modal.style.display = 'flex';

    // Close button handler
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal('aircraftDetailsModal');
    }
}

/**
 * Generate detailed aircraft HTML
 */
function generateAircraftDetailsHTML(aircraft) {
    return `
        <div class="aircraft-details">
            <!-- Header Section -->
            <div class="detail-section" style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 8px 0;">${aircraft.identification.tailNumber}</h2>
                <h3 style="margin: 0; opacity: 0.9; font-weight: 500;">${aircraft.identification.manufacturer} ${aircraft.identification.model} (${aircraft.identification.year})</h3>
                <div style="margin-top: 16px;">
                    ${renderOperationTypeBadgesWhite(aircraft.operationType)}
                </div>
            </div>

            <!-- Grounding/Restrictions -->
            ${aircraft.operationalStatus.grounded ? `
                <div style="background: #fed7d7; border-left: 4px solid #e53e3e; padding: 16px; margin-bottom: 24px; border-radius: 8px;">
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
            ` : ''}

            ${generateRestrictionHTML(aircraft)}

            <!-- Aircraft Information -->
            <div class="detail-section">
                <h3>📋 Aircraft Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Registration</div>
                        <div class="detail-value">${aircraft.identification.tailNumber}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Type</div>
                        <div class="detail-value">${aircraft.identification.manufacturer} ${aircraft.identification.model}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Year</div>
                        <div class="detail-value">${aircraft.identification.year}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Serial Number</div>
                        <div class="detail-value">${aircraft.identification.serialNumber}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Total Hours</div>
                        <div class="detail-value">${aircraft.time.airframeTotal.toFixed(1)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Engine Hours</div>
                        <div class="detail-value">${aircraft.time.engineTotal.toFixed(1)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Hourly Rate</div>
                        <div class="detail-value">$${aircraft.rates.hourlyRate}/hr</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Status</div>
                        <div class="detail-value" style="color: ${getStatusColor(aircraft.operationalStatus.currentStatus)}">
                            ${aircraft.operationalStatus.currentStatus.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Specifications -->
            <div class="detail-section">
                <h3>✈️ Specifications</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Engine Type</div>
                        <div class="detail-value">${formatEngineType(aircraft.specifications.engineType)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Seats</div>
                        <div class="detail-value">${aircraft.specifications.seats.total} (${aircraft.specifications.seats.passenger} pax)</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Max Gross Weight</div>
                        <div class="detail-value">${aircraft.specifications.weights.maxGrossWeight} lbs</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Useful Load</div>
                        <div class="detail-value">${aircraft.specifications.weights.usefulLoad} lbs</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Fuel Capacity</div>
                        <div class="detail-value">${aircraft.specifications.fuel.capacity} gal (${aircraft.specifications.fuel.type})</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Cruise Speed</div>
                        <div class="detail-value">${aircraft.specifications.performance.cruiseSpeed} kts</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Range</div>
                        <div class="detail-value">${aircraft.specifications.performance.range} nm</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Service Ceiling</div>
                        <div class="detail-value">${aircraft.specifications.performance.serviceCeiling.toLocaleString()} ft</div>
                    </div>
                </div>
            </div>

            <!-- Equipment & Avionics -->
            <div class="detail-section">
                <h3>🎛️ Equipment & Avionics</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px;">
                    ${generateEquipmentBadge('IFR Certified', aircraft.equipment.ifrCertified)}
                    ${generateEquipmentBadge('Autopilot', aircraft.equipment.autopilot)}
                    ${generateEquipmentBadge('ADS-B Out', aircraft.equipment.adsb)}
                    ${generateEquipmentBadge('Complex', aircraft.equipment.complex)}
                    ${generateEquipmentBadge('High Performance', aircraft.equipment.highPerformance)}
                    ${generateEquipmentBadge('Multi-Engine', aircraft.equipment.multiEngine)}
                </div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">GPS Type</div>
                        <div class="detail-value">${aircraft.equipment.gpsType.toUpperCase()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Transponder</div>
                        <div class="detail-value">Mode ${aircraft.equipment.transponderMode}</div>
                    </div>
                </div>
            </div>

            <!-- Compliance Status -->
            <div class="detail-section">
                <h3>✅ Compliance Status</h3>
                ${generateComplianceTable(aircraft)}
            </div>

            <!-- Insurance -->
            <div class="detail-section">
                <h3>🛡️ Insurance</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Company</div>
                        <div class="detail-value">${aircraft.insurance.company}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Policy Number</div>
                        <div class="detail-value">${aircraft.insurance.policyNumber}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Expires</div>
                        <div class="detail-value">${formatDate(aircraft.insurance.expirationDate)} (${aircraft.insurance.daysUntilExpiration} days)</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Hull Value</div>
                        <div class="detail-value">$${aircraft.insurance.coverage.hullValue.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <!-- Pilot Requirements -->
            <div class="detail-section">
                <h3>👨‍✈️ Pilot Requirements</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Minimum Certificate</div>
                        <div class="detail-value">${aircraft.pilotRequirements.minimumCertificate.toUpperCase()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Minimum Hours</div>
                        <div class="detail-value">${aircraft.pilotRequirements.minimumHours}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Minimum PIC</div>
                        <div class="detail-value">${aircraft.pilotRequirements.minimumPIC}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Checkout Required</div>
                        <div class="detail-value">${aircraft.pilotRequirements.checkoutRequired ? 'Yes' : 'No'}</div>
                    </div>
                </div>
                ${aircraft.pilotRequirements.endorsementsRequired.length > 0 ? `
                    <div style="margin-top: 12px; padding: 12px; background: #fef5e7; border-left: 3px solid #f39c12; border-radius: 6px;">
                        <strong>Required Endorsements:</strong> ${aircraft.pilotRequirements.endorsementsRequired.join(', ')}
                    </div>
                ` : ''}
            </div>

            <!-- Location -->
            <div class="detail-section">
                <h3>📍 Location</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">Home Base</div>
                        <div class="detail-value">${aircraft.location.homeBase}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Current Location</div>
                        <div class="detail-value">${aircraft.location.currentLocation}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Hangar</div>
                        <div class="detail-value">${aircraft.location.hangarNumber || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Tie-Down</div>
                        <div class="detail-value">${aircraft.location.tieDownSpot || 'N/A'}</div>
                    </div>
                </div>
            </div>

            <!-- Edit Aircraft Button (Mechanics Only) -->
            <div class="mechanic-only" style="margin-top: 24px; text-align: center; padding: 16px; background: #f7fafc; border-radius: 8px;">
                <button onclick="handleEditAircraft('${aircraft.identification.tailNumber}')" style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); color: white; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(86, 180, 233, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    ✏️ Edit Aircraft Details
                </button>
            </div>
        </div>
    `;
}

/**
 * Helper functions for details modal
 */
function renderOperationTypeBadgesWhite(operationTypes) {
    const badges = {
        'part_91_flying_club': { text: 'Part 91 Club', color: 'rgba(255,255,255,0.3)' },
        'part_61_flight_school': { text: 'Part 61 School', color: 'rgba(255,255,255,0.3)' },
        'part_141_flight_school': { text: 'Part 141 School', color: 'rgba(255,255,255,0.3)' },
        'part_135_charter': { text: 'Part 135 Charter', color: 'rgba(255,255,255,0.3)' }
    };

    return operationTypes.map(type => {
        const badge = badges[type] || { text: type, color: 'rgba(255,255,255,0.3)' };
        return `<span style="display: inline-block; padding: 6px 12px; background: ${badge.color}; color: white; border: 1px solid rgba(255,255,255,0.5); border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 6px; margin-bottom: 6px;">${badge.text}</span>`;
    }).join('');
}

function generateRestrictionHTML(aircraft) {
    const restrictions = aircraft.operationalStatus.restrictions;
    let html = '';

    if (restrictions.ifrRestricted) {
        html += `
            <div style="background: #feebc8; border-left: 3px solid #ed8936; padding: 12px 16px; margin-bottom: 16px; border-radius: 6px;">
                <strong style="color: #c05621;">⚠️ IFR Operations Not Permitted</strong>
                <div style="color: #7c2d12; font-size: 13px; margin-top: 4px;">${restrictions.ifrRestrictionReason}</div>
            </div>
        `;
    }

    if (restrictions.internationalRestricted) {
        html += `
            <div style="background: #feebc8; border-left: 3px solid #ed8936; padding: 12px 16px; margin-bottom: 16px; border-radius: 6px;">
                <strong style="color: #c05621;">⚠️ International Operations Not Permitted</strong>
                <div style="color: #7c2d12; font-size: 13px; margin-top: 4px;">${restrictions.internationalRestrictionReason}</div>
            </div>
        `;
    }

    return html;
}

function getStatusColor(status) {
    const colors = {
        'available': '#48bb78',
        'maintenance': '#ed8936',
        'booked': '#e53e3e',
        'grounded': '#c53030'
    };
    return colors[status] || '#718096';
}

function formatEngineType(type) {
    const types = {
        'single_piston': 'Single Piston',
        'multi_piston': 'Multi-Engine Piston',
        'turboprop': 'Turboprop',
        'jet': 'Jet'
    };
    return types[type] || type;
}

function generateEquipmentBadge(label, hasFeature) {
    return `
        <div style="padding: 8px 12px; background: ${hasFeature ? '#d4edda' : '#f8d7da'}; border-radius: 6px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 16px;">${hasFeature ? '✓' : '✗'}</span>
            <span style="font-size: 13px; font-weight: 500; color: ${hasFeature ? '#155724' : '#721c24'};">${label}</span>
        </div>
    `;
}

function generateComplianceTable(aircraft) {
    const inspections = [
        { name: 'Annual Inspection', data: aircraft.inspections.annualInspection },
        { name: '100-Hour Inspection', data: aircraft.inspections.hundredHourInspection },
        { name: 'Transponder', data: aircraft.inspections.transponderInspection },
        { name: 'Altimeter/Static', data: aircraft.inspections.altimeterStaticInspection },
        { name: 'ELT Inspection', data: aircraft.inspections.eltInspection },
        { name: 'VOR Check', data: aircraft.inspections.vorCheck }
    ];

    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="background: #f7fafc; border-bottom: 2px solid #e2e8f0;"><th style="padding: 12px; text-align: left; font-size: 13px;">Item</th><th style="padding: 12px; text-align: left; font-size: 13px;">Due Date</th><th style="padding: 12px; text-align: center; font-size: 13px;">Status</th></tr></thead><tbody>';

    inspections.forEach(item => {
        if (!item.data.required && item.data.status === 'n/a') return;

        const statusColor = {
            'current': '#48bb78',
            'warning': '#ed8936',
            'expired': '#e53e3e',
            'n/a': '#cbd5e0'
        }[item.data.status] || '#cbd5e0';

        const statusIcon = {
            'current': '✓',
            'warning': '⚠',
            'expired': '✗',
            'n/a': '—'
        }[item.data.status] || '?';

        let dueDateText = 'N/A';
        if (item.data.dueDate) {
            dueDateText = formatDate(item.data.dueDate);
            if (item.data.daysUntilDue !== null) {
                dueDateText += ` (${item.data.daysUntilDue} days)`;
            }
        } else if (item.data.nextDueTach) {
            dueDateText = `${item.data.nextDueTach.toFixed(1)} tach`;
        }

        html += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-size: 14px;">${item.name}</td>
                <td style="padding: 12px; font-size: 13px; color: #4a5568;">${dueDateText}</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: ${statusColor}; color: white; font-weight: bold; font-size: 14px;">${statusIcon}</span>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    return html;
}

/**
 * Handle Book Now button
 */
function handleBookNow(tailNumber) {
    const aircraft = findAircraftByTailNumber(tailNumber);
    if (!aircraft) return;

    if (aircraft.operationalStatus.grounded) {
        alert(`⛔ ${tailNumber} is currently grounded and cannot be booked.\n\nReasons:\n${aircraft.operationalStatus.groundingReasons.join('\n')}`);
        return;
    }

    // Redirect to calendar with aircraft pre-selected
    window.location.href = `calendar/index.html?aircraft=${tailNumber}`;
}

/**
 * Check if current user is a mechanic
 * In production, this would check actual user role from database
 */
function isUserMechanic() {
    // For demo purposes, check localStorage
    const userRole = localStorage.getItem('userRole') || 'pilot';
    return userRole === 'mechanic' || userRole === 'admin' || userRole === 'flightline_manager';
}

/**
 * Handle Report Maintenance button (available to all users)
 */
function handleReportMaintenance(tailNumber) {
    const aircraft = findAircraftByTailNumber(tailNumber);
    if (!aircraft) return;

    const modal = document.getElementById('maintenanceModal');
    const modalBody = document.getElementById('maintenanceModalBody');

    if (!modal || !modalBody) {
        console.error('Maintenance modal not found');
        return;
    }

    // Get current user info (in production, this would come from auth)
    const currentUser = localStorage.getItem('userName') || 'Unknown User';

    modalBody.innerHTML = `
        <div class="maintenance-form">
            <div style="background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h3 style="margin: 0;">🔧 Report Maintenance Issue</h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">${tailNumber} - ${aircraft.identification.manufacturer} ${aircraft.identification.model}</p>
            </div>

            <div style="background: #fef5e7; border-left: 3px solid #f39c12; padding: 12px; margin-bottom: 20px; border-radius: 6px;">
                <strong>✏️ Pilot/User Issue Report</strong>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #7c6d4e;">Use this form to report any maintenance issues, squawks, or abnormalities discovered during preflight or flight operations.</p>
            </div>

            <div class="form-group">
                <label class="form-label">Issue Type *</label>
                <select class="form-select" id="issueType" required>
                    <option value="">Select issue type</option>
                    <option value="preflight-discrepancy">Preflight Discrepancy</option>
                    <option value="in-flight-issue">In-Flight Issue</option>
                    <option value="engine-abnormality">Engine Abnormality</option>
                    <option value="avionics-issue">Avionics/Electrical Issue</option>
                    <option value="instrument-issue">Instrument Issue</option>
                    <option value="structural-damage">Structural Damage</option>
                    <option value="landing-gear">Landing Gear Issue</option>
                    <option value="control-surface">Control Surface Issue</option>
                    <option value="oil-leak">Oil/Fluid Leak</option>
                    <option value="cosmetic">Cosmetic/Interior Issue</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Detailed Description *</label>
                <textarea class="form-textarea" id="issueDescription" rows="4" placeholder="Describe the issue in detail... Include what you observed, when it occurred, and any relevant flight conditions." required></textarea>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Date/Time Discovered *</label>
                    <input type="datetime-local" class="form-input" id="issueDateTime" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Severity *</label>
                    <select class="form-select" id="issueSeverity" required>
                        <option value="minor">Minor - Does not affect airworthiness</option>
                        <option value="major">Major - Affects airworthiness</option>
                        <option value="grounding">Grounding - Unsafe to fly</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Flight Conditions When Discovered</label>
                <select class="form-select" id="flightConditions">
                    <option value="preflight">During Preflight</option>
                    <option value="taxi">During Taxi</option>
                    <option value="takeoff">During Takeoff</option>
                    <option value="cruise">During Cruise</option>
                    <option value="landing">During Landing</option>
                    <option value="postflight">During Postflight</option>
                    <option value="n/a">Not Applicable</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Reported By *</label>
                <input type="text" class="form-input" id="reportedBy" value="${currentUser}" required>
            </div>

            <div class="form-group" style="background: #fff5f5; border: 2px solid #fc8181; border-radius: 8px; padding: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="groundAircraft" style="width: 20px; height: 20px;">
                    <span style="font-weight: 600; color: #c53030;">⚠️ Ground aircraft immediately (unsafe to fly)</span>
                </label>
                <p style="margin: 8px 0 0 28px; font-size: 12px; color: #742a2a;">Check this box if the aircraft should be grounded due to safety concerns.</p>
            </div>

            <div class="form-group">
                <label class="form-label">Additional Notes</label>
                <textarea class="form-textarea" id="issueNotes" rows="2" placeholder="Any additional information that might be helpful..."></textarea>
            </div>
        </div>
    `;

    // Set default date/time to now
    const now = new Date();
    const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    document.getElementById('issueDateTime').value = localDateTime;

    modal.style.display = 'flex';

    // Auto-check ground aircraft box when severity is "grounding"
    const severitySelect = document.getElementById('issueSeverity');
    const groundCheckbox = document.getElementById('groundAircraft');

    if (severitySelect && groundCheckbox) {
        severitySelect.addEventListener('change', function() {
            if (this.value === 'grounding') {
                groundCheckbox.checked = true;
                console.log('✅ Auto-checked ground aircraft box (severity: grounding)');
            }
        });
    }

    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal('maintenanceModal');
    }

    const submitBtn = modal.querySelector('.btn-primary');
    if (submitBtn) {
        submitBtn.onclick = () => submitIssueReport(tailNumber);
    }
}

/**
 * Submit issue report
 */
function submitIssueReport(tailNumber) {
    const issueType = document.getElementById('issueType').value;
    const description = document.getElementById('issueDescription').value;
    const dateTime = document.getElementById('issueDateTime').value;
    const severity = document.getElementById('issueSeverity').value;
    const conditions = document.getElementById('flightConditions').value;
    const reportedBy = document.getElementById('reportedBy').value;
    const ground = document.getElementById('groundAircraft').checked;

    if (!issueType || !description || !dateTime || !severity || !reportedBy) {
        alert('⚠️ Please fill in all required fields (marked with *)');
        return;
    }

    // In production, save to database
    console.log('Issue Report:', {
        aircraft: tailNumber,
        issueType,
        description,
        dateTime,
        severity,
        conditions,
        reportedBy,
        ground,
        timestamp: new Date().toISOString()
    });

    let message = `✅ Maintenance issue reported for ${tailNumber}\n\nType: ${issueType}\nSeverity: ${severity.toUpperCase()}\nReported by: ${reportedBy}`;

    if (ground) {
        message += '\n\n🚫 Aircraft has been GROUNDED\nA mechanic will be notified immediately.';
    } else {
        message += '\n\n✉️ Maintenance team has been notified.';
    }

    message += '\n\nThis would be saved to the database in production.';

    alert(message);
    closeModal('maintenanceModal');
}

/**
 * Handle Schedule Maintenance button (mechanics only)
 */
function handleScheduleMaintenance(tailNumber) {
    if (!isUserMechanic()) {
        alert('⛔ Access Denied\n\nOnly mechanics and administrators can schedule maintenance.\n\nIf you need to report an issue, please use the "Report Issue" button.');
        return;
    }

    const aircraft = findAircraftByTailNumber(tailNumber);
    if (!aircraft) return;

    const modal = document.getElementById('maintenanceModal');
    const modalBody = document.getElementById('maintenanceModalBody');

    if (!modal || !modalBody) {
        console.error('Maintenance modal not found');
        return;
    }

    modalBody.innerHTML = `
        <div class="maintenance-form">
            <div style="background: linear-gradient(135deg, #667eea 0%, #4c51bf 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h3 style="margin: 0;">📅 Schedule Maintenance</h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">${tailNumber} - ${aircraft.identification.manufacturer} ${aircraft.identification.model}</p>
            </div>

            <div style="background: #e0e7ff; border-left: 3px solid #667eea; padding: 12px; margin-bottom: 20px; border-radius: 6px;">
                <strong>🔧 Mechanic Scheduling Tool</strong>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #4c51bf;">Schedule upcoming maintenance, inspections, or repairs.</p>
            </div>

            <div class="form-group">
                <label class="form-label">Maintenance Type *</label>
                <select class="form-select" id="maintenanceType" required>
                    <option value="">Select maintenance type</option>
                    <optgroup label="Required Inspections">
                        <option value="annual">Annual Inspection (FAR 91.409)</option>
                        <option value="100-hour">100-Hour Inspection (FAR 91.409)</option>
                        <option value="transponder">Transponder Inspection (FAR 91.413)</option>
                        <option value="altimeter">Altimeter/Static System (FAR 91.411)</option>
                        <option value="elt">ELT Inspection (FAR 91.207)</option>
                        <option value="vor">VOR Check (FAR 91.171)</option>
                    </optgroup>
                    <optgroup label="Engine/Powerplant">
                        <option value="oil-change">Oil Change</option>
                        <option value="compression-check">Compression Check</option>
                        <option value="spark-plugs">Spark Plug Service</option>
                        <option value="engine-overhaul">Engine Overhaul</option>
                    </optgroup>
                    <optgroup label="Airframe">
                        <option value="tire-change">Tire Change</option>
                        <option value="brake-service">Brake Service</option>
                        <option value="control-cable">Control Cable Inspection</option>
                        <option value="fabric-repair">Fabric/Paint Repair</option>
                    </optgroup>
                    <optgroup label="Avionics">
                        <option value="avionics-repair">Avionics Repair</option>
                        <option value="pitot-static">Pitot-Static System</option>
                        <option value="radio-repair">Radio Repair</option>
                    </optgroup>
                    <optgroup label="Other">
                        <option value="ad-compliance">AD Compliance</option>
                        <option value="sb-compliance">Service Bulletin</option>
                        <option value="squawk">Squawk Repair</option>
                        <option value="preventive">Preventive Maintenance</option>
                        <option value="modification">Modification/STC</option>
                        <option value="other">Other</option>
                    </optgroup>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Work Description *</label>
                <textarea class="form-textarea" id="workDescription" rows="3" placeholder="Describe the maintenance work to be performed..." required></textarea>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Start Date *</label>
                    <input type="date" class="form-input" id="scheduledStartDate" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Start Time *</label>
                    <input type="time" class="form-input" id="scheduledStartTime" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">End Date *</label>
                    <input type="date" class="form-input" id="scheduledEndDate" required>
                </div>
                <div class="form-group">
                    <label class="form-label">End Time *</label>
                    <input type="time" class="form-input" id="scheduledEndTime" required>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Maintenance Facility *</label>
                <input type="text" class="form-input" id="maintenanceFacility" value="${aircraft.contacts.maintenanceFacility || ''}" placeholder="Facility name" required>
            </div>

            <div class="form-group">
                <label class="form-label">Assigned Mechanic/IA</label>
                <input type="text" class="form-input" id="assignedMechanic" placeholder="Mechanic name and certificate number">
            </div>

            <div class="form-group">
                <label class="form-label">Parts Required</label>
                <textarea class="form-textarea" id="partsRequired" rows="3" placeholder="List parts needed (include part numbers if known)..."></textarea>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Estimated Cost ($)</label>
                    <input type="number" class="form-input" id="estimatedCost" placeholder="0.00" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Priority</label>
                    <select class="form-select" id="maintenancePriority">
                        <option value="routine">Routine</option>
                        <option value="important">Important</option>
                        <option value="urgent">Urgent</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Ground Aircraft During Maintenance</label>
                <select class="form-select" id="groundDuringMaint">
                    <option value="yes">Yes - Ground aircraft (no bookings allowed)</option>
                    <option value="no">No - Aircraft remains available</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Work Order / Reference Number</label>
                <input type="text" class="form-input" id="workOrderNumber" placeholder="Work order or reference number">
            </div>

            <div class="form-group">
                <label class="form-label">Additional Notes</label>
                <textarea class="form-textarea" id="schedulingNotes" rows="2" placeholder="Any special instructions or considerations..."></textarea>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal('maintenanceModal');
    }

    const submitBtn = modal.querySelector('.btn-primary');
    if (submitBtn) {
        submitBtn.onclick = () => submitScheduledMaintenance(tailNumber);
    }
}

/**
 * Submit scheduled maintenance
 */
function submitScheduledMaintenance(tailNumber) {
    const type = document.getElementById('maintenanceType').value;
    const description = document.getElementById('workDescription').value;
    const startDate = document.getElementById('scheduledStartDate').value;
    const startTime = document.getElementById('scheduledStartTime').value;
    const endDate = document.getElementById('scheduledEndDate').value;
    const endTime = document.getElementById('scheduledEndTime').value;
    const facility = document.getElementById('maintenanceFacility').value;

    if (!type || !description || !startDate || !startTime || !endDate || !endTime || !facility) {
        alert('⚠️ Please fill in all required fields (marked with *)');
        return;
    }

    // Combine date and time for calendar integration
    const startDateTime = `${startDate}T${startTime}`;
    const endDateTime = `${endDate}T${endTime}`;

    const mechanic = document.getElementById('assignedMechanic').value;
    const parts = document.getElementById('partsRequired').value;
    const cost = document.getElementById('estimatedCost').value;
    const priority = document.getElementById('maintenancePriority').value;
    const ground = document.getElementById('groundDuringMaint').value;
    const workOrder = document.getElementById('workOrderNumber').value;

    // In production, save to database and create calendar event
    console.log('Scheduled Maintenance:', {
        aircraft: tailNumber,
        type,
        description,
        startDateTime,
        endDateTime,
        facility,
        mechanic,
        parts,
        cost,
        priority,
        ground,
        workOrder,
        scheduledBy: localStorage.getItem('userName') || 'Unknown',
        timestamp: new Date().toISOString()
    });

    let message = `✅ Maintenance scheduled for ${tailNumber}\n\nType: ${type}\nStart: ${startDate} ${startTime}\nEnd: ${endDate} ${endTime}\nFacility: ${facility}\nPriority: ${priority.toUpperCase()}`;

    if (ground === 'yes') {
        message += '\n\n⚠️ Aircraft will be grounded during maintenance.';
    }

    if (cost) {
        message += `\nEstimated Cost: $${parseFloat(cost).toFixed(2)}`;
    }

    message += '\n\nCalendar has been updated and notifications sent.\n\nThis would be saved to the database in production.';

    alert(message);
    closeModal('maintenanceModal');
}

/**
 * Handle Maintenance Log button (mechanics only)
 */
function handleMaintenanceLog(tailNumber) {
    if (!isUserMechanic()) {
        alert('⛔ Access Denied\n\nOnly mechanics and administrators can view and edit the maintenance log.\n\nIf you need to report an issue, please use the "Report Issue" button.');
        return;
    }

    const aircraft = findAircraftByTailNumber(tailNumber);
    if (!aircraft) return;

    const modal = document.getElementById('maintenanceModal');
    const modalBody = document.getElementById('maintenanceModalBody');

    if (!modal || !modalBody) {
        console.error('Maintenance modal not found');
        return;
    }

    // Sample maintenance history (in production, this would come from database)
    const maintenanceHistory = [
        {
            date: '2024-03-15',
            type: 'Oil Change',
            description: 'Changed engine oil and filter. Phillips X/C 20W-50, 6 quarts.',
            hours: 5234.5,
            mechanic: 'John Smith, A&P 1234567',
            cost: 125.00,
            logbookEntry: 'FAR 43.9'
        },
        {
            date: '2024-02-01',
            type: 'Annual Inspection',
            description: 'Completed annual inspection per FAR 91.409. Aircraft found airworthy with no discrepancies.',
            hours: 5198.2,
            mechanic: 'Jane Doe, IA 7654321',
            cost: 1850.00,
            logbookEntry: 'FAR 43.11'
        },
        {
            date: '2024-01-10',
            type: 'Transponder Check',
            description: 'Transponder and altimeter system inspection completed per FAR 91.413 and 91.411. All systems within tolerances.',
            hours: 5180.0,
            mechanic: 'Avionics Plus, CRS AB123',
            cost: 350.00,
            logbookEntry: 'FAR 43.9'
        }
    ];

    modalBody.innerHTML = `
        <div class="maintenance-log">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h3 style="margin: 0;">📖 Maintenance Log</h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">${tailNumber} - ${aircraft.identification.manufacturer} ${aircraft.identification.model}</p>
                <div style="margin-top: 12px; display: flex; gap: 16px; font-size: 13px;">
                    <div><strong>Airframe:</strong> ${aircraft.time.airframeTotal.toFixed(1)} hrs</div>
                    <div><strong>Engine:</strong> ${aircraft.time.engineTotal.toFixed(1)} hrs</div>
                </div>
            </div>

            <div style="background: #d1fae5; border-left: 3px solid #10b981; padding: 12px; margin-bottom: 20px; border-radius: 6px;">
                <strong>📋 Complete Maintenance History</strong>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #065f46;">View and manage all maintenance records, inspections, and logbook entries for this aircraft.</p>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h4 style="margin: 0;">Recent Maintenance Entries</h4>
                <button onclick="addNewLogEntry('${tailNumber}')" style="background: var(--primary-color); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">+ Add Entry</button>
            </div>

            <div class="maintenance-history">
                ${maintenanceHistory.map((entry, index) => `
                    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: white;">
                        <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 12px;">
                            <div style="flex: 1;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                                    <span style="font-weight: 700; font-size: 15px; color: #1a202c;">${entry.type}</span>
                                    <span style="background: #edf2f7; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: #4a5568;">${entry.hours} hrs</span>
                                </div>
                                <div style="font-size: 13px; color: #718096;">${entry.date}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 600; color: #10b981; font-size: 15px;">$${entry.cost.toFixed(2)}</div>
                                <div style="font-size: 11px; color: #718096; margin-top: 2px;">${entry.logbookEntry}</div>
                            </div>
                        </div>

                        <div style="margin-bottom: 10px; font-size: 14px; color: #4a5568; line-height: 1.5;">
                            ${entry.description}
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #e2e8f0;">
                            <div style="font-size: 12px; color: #718096;">
                                <strong>Performed by:</strong> ${entry.mechanic}
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="editLogEntry(${index})" style="background: #edf2f7; color: #4a5568; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">✏️ Edit</button>
                                <button onclick="viewLogbookEntry(${index})" style="background: #e0e7ff; color: #4c51bf; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">📄 View Entry</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="margin-top: 24px; padding: 16px; background: #f7fafc; border-radius: 8px; text-align: center;">
                <button onclick="exportMaintenanceLog('${tailNumber}')" style="background: white; color: #4a5568; border: 2px solid #cbd5e0; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600; margin-right: 8px;">📥 Export Log</button>
                <button onclick="printMaintenanceLog('${tailNumber}')" style="background: white; color: #4a5568; border: 2px solid #cbd5e0; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600;">🖨️ Print Log</button>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal('maintenanceModal');
    }
}

/**
 * Maintenance log helper functions
 */
function addNewLogEntry(tailNumber) {
    console.log('📝 Opening Add Log Entry form for:', tailNumber);

    const aircraft = findAircraftByTailNumber(tailNumber);
    if (!aircraft) {
        console.error('Aircraft not found:', tailNumber);
        return;
    }

    const modal = document.getElementById('maintenanceModal');
    const modalBody = document.getElementById('maintenanceModalBody');

    if (!modal || !modalBody) {
        console.error('Modal not found');
        return;
    }

    // Get current date and hobbs/tach
    const today = new Date().toISOString().split('T')[0];
    const currentMechanic = localStorage.getItem('userName') || 'Unknown Mechanic';

    modalBody.innerHTML = `
        <div class="log-entry-form">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h3 style="margin: 0;">📝 Add Maintenance Log Entry</h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">${tailNumber} - ${aircraft.identification.manufacturer} ${aircraft.identification.model}</p>
            </div>

            <div style="background: #d1fae5; border-left: 3px solid #10b981; padding: 12px; margin-bottom: 20px; border-radius: 6px;">
                <strong>✍️ FAR 43.9/43.11 Logbook Entry</strong>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #065f46;">Record completed maintenance, inspections, or modifications per FAA requirements.</p>
            </div>

            <!-- Entry Type -->
            <div class="form-group">
                <label class="form-label">Entry Type *</label>
                <select class="form-select" id="logEntryType" required>
                    <option value="">Select entry type</option>
                    <optgroup label="Required Inspections">
                        <option value="annual">Annual Inspection (FAR 43.11)</option>
                        <option value="100-hour">100-Hour Inspection (FAR 43.9)</option>
                        <option value="transponder">Transponder Inspection</option>
                        <option value="altimeter">Altimeter/Static Inspection</option>
                        <option value="elt">ELT Inspection</option>
                        <option value="vor">VOR Check</option>
                    </optgroup>
                    <optgroup label="Maintenance">
                        <option value="preventive">Preventive Maintenance</option>
                        <option value="repair">Repair</option>
                        <option value="modification">Modification/Alteration</option>
                        <option value="ad-compliance">AD Compliance</option>
                        <option value="sb-compliance">Service Bulletin Compliance</option>
                    </optgroup>
                    <optgroup label="Other">
                        <option value="oil-change">Oil Change</option>
                        <option value="component-replacement">Component Replacement</option>
                        <option value="other">Other</option>
                    </optgroup>
                </select>
            </div>

            <!-- Date and Hours -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Date Completed *</label>
                    <input type="date" class="form-input" id="logEntryDate" value="${today}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Airframe Hours *</label>
                    <input type="number" class="form-input" id="logAirframeHours" value="${aircraft.time.airframeTotal.toFixed(1)}" step="0.1" required>
                </div>
            </div>

            <!-- Logbook Entry Text -->
            <div class="form-group">
                <label class="form-label">Logbook Entry Description *</label>
                <textarea class="form-textarea" id="logEntryDescription" rows="4" placeholder="Describe the work performed in accordance with FAR 43.9 or 43.11..." required></textarea>
                <div style="font-size: 12px; color: #718096; margin-top: 4px;">
                    Include: Work performed, parts used, reference data (ADs, SBs, service manuals), and airworthiness determination
                </div>
            </div>

            <!-- Mechanic Information -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Performed By *</label>
                    <input type="text" class="form-input" id="logMechanicName" value="${currentMechanic}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Certificate Number *</label>
                    <input type="text" class="form-input" id="logMechanicCert" placeholder="A&P 1234567 or IA 7654321" required>
                </div>
            </div>

            <!-- Parts and Materials -->
            <div class="form-group">
                <label class="form-label">Parts and Materials Used</label>
                <textarea class="form-textarea" id="logPartsUsed" rows="2" placeholder="List parts with part numbers and quantities (e.g., Oil Filter - Champion CH48108, Qty: 1)"></textarea>
            </div>

            <!-- Reference Information -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Reference Data</label>
                    <input type="text" class="form-input" id="logReferenceData" placeholder="e.g., Service Manual Section 5.3, AD 2024-01-02">
                </div>
                <div class="form-group">
                    <label class="form-label">Work Order Number</label>
                    <input type="text" class="form-input" id="logWorkOrder" placeholder="WO-2024-123">
                </div>
            </div>

            <!-- Cost -->
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Labor Hours</label>
                    <input type="number" class="form-input" id="logLaborHours" placeholder="0.0" step="0.1" min="0">
                </div>
                <div class="form-group">
                    <label class="form-label">Total Cost ($)</label>
                    <input type="number" class="form-input" id="logTotalCost" placeholder="0.00" step="0.01" min="0">
                </div>
            </div>

            <!-- Airworthiness Determination -->
            <div class="form-group" style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="logAirworthy" style="width: 20px; height: 20px;">
                    <span style="font-weight: 600; color: #0369a1;">✈️ Aircraft returned to service and approved for return to service</span>
                </label>
                <p style="margin: 8px 0 0 28px; font-size: 12px; color: #075985;">Check this box to certify that the aircraft is airworthy and approved for return to service per FAR 43.9/43.11.</p>
            </div>

            <!-- Update Inspection Due Dates -->
            <div class="form-group">
                <label class="form-label">Update Inspection Due Date (Optional)</label>
                <select class="form-select" id="logUpdateInspection">
                    <option value="">Don't update any inspection</option>
                    <option value="annual">Update Annual Inspection Due Date</option>
                    <option value="100-hour">Update 100-Hour Inspection Due Date</option>
                    <option value="transponder">Update Transponder Inspection Due Date</option>
                    <option value="altimeter">Update Altimeter/Static Inspection Due Date</option>
                    <option value="elt">Update ELT Inspection Due Date</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Additional Notes</label>
                <textarea class="form-textarea" id="logNotes" rows="2" placeholder="Any additional notes or observations..."></textarea>
            </div>
        </div>
    `;

    modal.style.display = 'flex';

    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal('maintenanceModal');
    }

    const submitBtn = modal.querySelector('.btn-primary');
    if (submitBtn) {
        submitBtn.textContent = 'Save Log Entry';
        submitBtn.onclick = () => submitLogEntry(tailNumber);
    }

    console.log('✅ Add Log Entry form displayed');
}

/**
 * Submit log entry
 */
function submitLogEntry(tailNumber) {
    const entryType = document.getElementById('logEntryType').value;
    const date = document.getElementById('logEntryDate').value;
    const hours = document.getElementById('logAirframeHours').value;
    const description = document.getElementById('logEntryDescription').value;
    const mechanicName = document.getElementById('logMechanicName').value;
    const mechanicCert = document.getElementById('logMechanicCert').value;

    if (!entryType || !date || !hours || !description || !mechanicName || !mechanicCert) {
        alert('⚠️ Please fill in all required fields (marked with *)');
        return;
    }

    const partsUsed = document.getElementById('logPartsUsed').value;
    const referenceData = document.getElementById('logReferenceData').value;
    const workOrder = document.getElementById('logWorkOrder').value;
    const laborHours = document.getElementById('logLaborHours').value;
    const totalCost = document.getElementById('logTotalCost').value;
    const airworthy = document.getElementById('logAirworthy').checked;
    const updateInspection = document.getElementById('logUpdateInspection').value;
    const notes = document.getElementById('logNotes').value;

    // In production, save to database and update aircraft records
    const logEntry = {
        aircraft: tailNumber,
        entryType,
        date,
        airframeHours: parseFloat(hours),
        description,
        mechanicName,
        mechanicCert,
        partsUsed,
        referenceData,
        workOrder,
        laborHours: laborHours ? parseFloat(laborHours) : null,
        totalCost: totalCost ? parseFloat(totalCost) : null,
        airworthy,
        updateInspection,
        notes,
        createdBy: localStorage.getItem('userName') || 'Unknown',
        timestamp: new Date().toISOString()
    };

    console.log('📝 Maintenance Log Entry:', logEntry);

    let message = `✅ Maintenance log entry saved for ${tailNumber}\n\n`;
    message += `Type: ${entryType}\n`;
    message += `Date: ${date}\n`;
    message += `Hours: ${hours}\n`;
    message += `Performed by: ${mechanicName}\n`;
    message += `Certificate: ${mechanicCert}\n`;

    if (airworthy) {
        message += `\n✈️ Aircraft approved for return to service`;
    }

    if (updateInspection) {
        message += `\n📅 ${updateInspection} inspection due date will be updated`;
    }

    if (totalCost) {
        message += `\n💰 Total cost: $${parseFloat(totalCost).toFixed(2)}`;
    }

    message += '\n\nThis would be saved to the database in production.';

    alert(message);
    closeModal('maintenanceModal');
}

function editLogEntry(index) {
    alert(`✏️ Edit Log Entry\n\nThis would open an editing form for maintenance entry #${index + 1}.\n\nIn production, this would allow mechanics to edit or update existing maintenance records.`);
}

function viewLogbookEntry(index) {
    alert(`📄 View Logbook Entry\n\nThis would display the complete logbook entry text and any supporting documents for entry #${index + 1}.\n\nIn production, this would show:\n- Full FAR 43.9/43.11 compliant entry\n- Mechanic signature and certificate\n- Supporting work orders and invoices\n- Before/after photos if applicable`);
}

function exportMaintenanceLog(tailNumber) {
    alert(`📥 Export Maintenance Log\n\nThis would export the complete maintenance log for ${tailNumber} to PDF or CSV format.\n\nIn production, this would generate a formatted report suitable for:\n- Pre-buy inspections\n- Insurance claims\n- Annual review\n- Regulatory compliance`);
}

function printMaintenanceLog(tailNumber) {
    alert(`🖨️ Print Maintenance Log\n\nThis would open a print dialog for ${tailNumber}'s maintenance log.\n\nIn production, this would generate a printer-friendly version of the complete maintenance history.`);
}

/**
 * Submit maintenance entry
 */
function submitMaintenanceEntry(tailNumber) {
    const type = document.getElementById('maintenanceType').value;
    const description = document.getElementById('maintenanceDescription').value;
    const date = document.getElementById('maintenanceDate').value;
    const priority = document.getElementById('maintenancePriority').value;
    const ground = document.getElementById('maintenanceGround').value;

    if (!type || !description) {
        alert('Please fill in all required fields (marked with *)');
        return;
    }

    // In production, this would save to database
    console.log('Maintenance Entry:', {
        aircraft: tailNumber,
        type,
        description,
        date,
        priority,
        ground
    });

    alert(`✅ Maintenance entry created for ${tailNumber}\n\nType: ${type}\nPriority: ${priority.toUpperCase()}\n${ground === 'yes' ? '\n⚠️ Aircraft has been grounded' : ''}\n\nThis would be saved to the database in production.`);

    closeModal('maintenanceModal');
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Format date helper
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

/**
 * Initialize event listeners when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Store fleet reference
    if (typeof sampleAircraftFleet !== 'undefined') {
        currentFleet = sampleAircraftFleet;
    }

    // Close modals when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    console.log('Aircraft interactions initialized');
});

/**
 * Handle Add Aircraft button (mechanics, flightline managers, and admins only)
 */
function handleAddAircraft() {
    console.log('🚀 handleAddAircraft() called');

    // Check role-based access
    const userRole = localStorage.getItem('userRole') || 'pilot';
    console.log('🔍 Current user role:', userRole);
    console.log('🔍 isUserMechanic():', isUserMechanic());

    if (!isUserMechanic()) {
        console.warn('⛔ Access denied - user is not mechanic/admin');
        alert('⛔ Access Denied\n\nOnly mechanics, flightline managers, and administrators can add new aircraft.\n\nPlease contact your administrator if you need to add an aircraft to the fleet.');
        return;
    }

    console.log('✅ Access granted - opening modal');

    const modal = document.getElementById('maintenanceModal');
    const modalBody = document.getElementById('maintenanceModalBody');

    console.log('🔍 Modal element:', modal);
    console.log('🔍 Modal body element:', modalBody);

    if (!modal || !modalBody) {
        console.error('❌ Modal not found!');
        return;
    }

    console.log('✅ Modal found, populating form...');

    modalBody.innerHTML = `
        <div class="add-aircraft-form">
            <div style="background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h3 style="margin: 0;">✈️ Add New Aircraft</h3>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">Register a new aircraft to the fleet</p>
            </div>

            <div style="background: #e0f2fe; border-left: 3px solid var(--primary-color); padding: 12px; margin-bottom: 20px; border-radius: 6px;">
                <strong>📋 Aircraft Registration</strong>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #075985;">Enter all required information for the new aircraft. All fields marked with * are required.</p>
            </div>

            <!-- Basic Information -->
            <h4 style="margin: 20px 0 12px 0; color: var(--primary-color);">Basic Information</h4>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Tail Number (N-Number) *</label>
                    <input type="text" class="form-input" id="addTailNumber" placeholder="N12345" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Serial Number *</label>
                    <input type="text" class="form-input" id="addSerialNumber" placeholder="Aircraft serial number" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Manufacturer *</label>
                    <input type="text" class="form-input" id="addManufacturer" placeholder="e.g., Cessna, Piper" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Model *</label>
                    <input type="text" class="form-input" id="addModel" placeholder="e.g., 172S, PA-28" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Year *</label>
                    <input type="number" class="form-input" id="addYear" placeholder="2020" min="1900" max="2025" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Engine Type *</label>
                    <select class="form-select" id="addEngineType" required>
                        <option value="">Select engine type</option>
                        <option value="single_piston">Single Piston</option>
                        <option value="multi_piston">Multi-Engine Piston</option>
                        <option value="turboprop">Turboprop</option>
                        <option value="jet">Jet</option>
                    </select>
                </div>
            </div>

            <!-- Operation Types -->
            <h4 style="margin: 20px 0 12px 0; color: var(--primary-color);">Operation Types</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px; background: #f7fafc; border-radius: 6px; cursor: pointer;">
                    <input type="checkbox" id="opTypeFlyingClub" value="part_91_flying_club">
                    <span>Part 91 Flying Club</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px; background: #f7fafc; border-radius: 6px; cursor: pointer;">
                    <input type="checkbox" id="opTypePart61" value="part_61_flight_school">
                    <span>Part 61 Flight School</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px; background: #f7fafc; border-radius: 6px; cursor: pointer;">
                    <input type="checkbox" id="opTypePart141" value="part_141_flight_school">
                    <span>Part 141 Flight School</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 10px; background: #f7fafc; border-radius: 6px; cursor: pointer;">
                    <input type="checkbox" id="opTypePart135" value="part_135_charter">
                    <span>Part 135 Charter</span>
                </label>
            </div>

            <!-- Time & Rates -->
            <h4 style="margin: 20px 0 12px 0; color: var(--primary-color);">Time & Rates</h4>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Airframe Total Hours *</label>
                    <input type="number" class="form-input" id="addAirframeHours" placeholder="0.0" step="0.1" min="0" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Engine Total Hours *</label>
                    <input type="number" class="form-input" id="addEngineHours" placeholder="0.0" step="0.1" min="0" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Hourly Rate ($) *</label>
                    <input type="number" class="form-input" id="addHourlyRate" placeholder="150.00" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Instructor Rate ($)</label>
                    <input type="number" class="form-input" id="addInstructorRate" placeholder="75.00" step="0.01" min="0">
                </div>
            </div>

            <!-- Location -->
            <h4 style="margin: 20px 0 12px 0; color: var(--primary-color);">Location</h4>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Home Base *</label>
                    <input type="text" class="form-input" id="addHomeBase" placeholder="e.g., KBOS" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Hangar/Tie-Down</label>
                    <input type="text" class="form-input" id="addHangar" placeholder="Hangar B-12 or Tiedown T-5">
                </div>
            </div>

            <!-- Insurance -->
            <h4 style="margin: 20px 0 12px 0; color: var(--primary-color);">Insurance Information</h4>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Insurance Company *</label>
                    <input type="text" class="form-input" id="addInsuranceCompany" placeholder="Insurance provider name" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Policy Number *</label>
                    <input type="text" class="form-input" id="addPolicyNumber" placeholder="Policy number" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Insurance Expiration *</label>
                    <input type="date" class="form-input" id="addInsuranceExpiry" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Hull Value ($) *</label>
                    <input type="number" class="form-input" id="addHullValue" placeholder="150000" min="0" required>
                </div>
            </div>

            <div style="margin-top: 20px; padding: 16px; background: #fef5e7; border-left: 3px solid #f39c12; border-radius: 6px;">
                <strong>ℹ️ Note:</strong> Inspection dates and compliance items can be added after creating the aircraft record by viewing the aircraft details and clicking "Schedule Maintenance".
            </div>
        </div>
    `;

    console.log('✅ Form HTML populated');
    console.log('🔍 Setting modal display to flex...');
    modal.style.display = 'flex';
    console.log('✅ Modal display set:', modal.style.display);

    const closeBtn = modal.querySelector('.close');
    console.log('🔍 Close button:', closeBtn);
    if (closeBtn) {
        closeBtn.onclick = () => closeModal('maintenanceModal');
        console.log('✅ Close button handler attached');
    }

    const submitBtn = modal.querySelector('.btn-primary');
    console.log('🔍 Submit button:', submitBtn);
    if (submitBtn) {
        submitBtn.onclick = () => submitAddAircraft();
        console.log('✅ Submit button handler attached');
    }

    console.log('🎉 handleAddAircraft() completed successfully');
}

/**
 * Submit new aircraft
 */
function submitAddAircraft() {
    // Get all form values
    const tailNumber = document.getElementById('addTailNumber').value.trim().toUpperCase();
    const serialNumber = document.getElementById('addSerialNumber').value.trim();
    const manufacturer = document.getElementById('addManufacturer').value.trim();
    const model = document.getElementById('addModel').value.trim();
    const year = parseInt(document.getElementById('addYear').value);
    const engineType = document.getElementById('addEngineType').value;
    const airframeHours = parseFloat(document.getElementById('addAirframeHours').value);
    const engineHours = parseFloat(document.getElementById('addEngineHours').value);
    const hourlyRate = parseFloat(document.getElementById('addHourlyRate').value);
    const instructorRate = parseFloat(document.getElementById('addInstructorRate').value) || 0;
    const homeBase = document.getElementById('addHomeBase').value.trim();
    const hangar = document.getElementById('addHangar').value.trim();
    const insuranceCompany = document.getElementById('addInsuranceCompany').value.trim();
    const policyNumber = document.getElementById('addPolicyNumber').value.trim();
    const insuranceExpiry = document.getElementById('addInsuranceExpiry').value;
    const hullValue = parseFloat(document.getElementById('addHullValue').value);

    // Get operation types
    const operationTypes = [];
    if (document.getElementById('opTypeFlyingClub').checked) operationTypes.push('part_91_flying_club');
    if (document.getElementById('opTypePart61').checked) operationTypes.push('part_61_flight_school');
    if (document.getElementById('opTypePart141').checked) operationTypes.push('part_141_flight_school');
    if (document.getElementById('opTypePart135').checked) operationTypes.push('part_135_charter');

    // Validate required fields
    if (!tailNumber || !serialNumber || !manufacturer || !model || !year || !engineType ||
        isNaN(airframeHours) || isNaN(engineHours) || isNaN(hourlyRate) ||
        !homeBase || !insuranceCompany || !policyNumber || !insuranceExpiry || isNaN(hullValue)) {
        alert('⚠️ Please fill in all required fields (marked with *)');
        return;
    }

    if (operationTypes.length === 0) {
        alert('⚠️ Please select at least one operation type');
        return;
    }

    // Validate tail number format (basic check)
    if (!tailNumber.match(/^N[0-9A-Z]+$/)) {
        alert('⚠️ Invalid tail number format. Must start with N followed by numbers/letters (e.g., N12345)');
        return;
    }

    // Check for duplicate tail number
    const existingAircraft = findAircraftByTailNumber(tailNumber);
    if (existingAircraft) {
        alert(`⚠️ Aircraft ${tailNumber} already exists in the fleet!`);
        return;
    }

    // In production, this would save to database
    const newAircraft = {
        tailNumber,
        serialNumber,
        manufacturer,
        model,
        year,
        engineType,
        operationTypes,
        airframeHours,
        engineHours,
        hourlyRate,
        instructorRate,
        homeBase,
        hangar,
        insuranceCompany,
        policyNumber,
        insuranceExpiry,
        hullValue,
        createdAt: new Date().toISOString()
    };

    console.log('New Aircraft:', newAircraft);

    let message = `✅ Aircraft ${tailNumber} has been added to the fleet!\n\n`;
    message += `${manufacturer} ${model} (${year})\n`;
    message += `Serial: ${serialNumber}\n`;
    message += `Home Base: ${homeBase}\n`;
    message += `Operations: ${operationTypes.length} type(s)\n`;
    message += `Rate: $${hourlyRate.toFixed(2)}/hr\n\n`;
    message += `📋 Next Steps:\n`;
    message += `1. Schedule required inspections\n`;
    message += `2. Enter compliance dates\n`;
    message += `3. Upload aircraft documents\n`;
    message += `4. Set pilot requirements\n\n`;
    message += `This would be saved to the database in production.`;

    alert(message);
    closeModal('maintenanceModal');

    // In production, refresh the aircraft list
    // location.reload();
}

/**
 * Handle Edit Aircraft (mechanics only) - Opens prepopulated form
 */
function handleEditAircraft(tailNumber) {
    console.log('✏️ Opening Edit Aircraft form for:', tailNumber);

    // Check role-based access
    if (!isUserMechanic()) {
        alert('⛔ Access Denied\n\nOnly mechanics, flightline managers, and administrators can edit aircraft details.');
        return;
    }

    const aircraft = findAircraftByTailNumber(tailNumber);
    if (!aircraft) {
        console.error('Aircraft not found:', tailNumber);
        alert(`❌ Aircraft ${tailNumber} not found!`);
        return;
    }

    // Close the details modal first
    closeModal('aircraftDetailsModal');

    // Small delay to allow details modal to close before opening edit modal
    setTimeout(() => {
        alert(`✏️ Edit Aircraft: ${tailNumber}\n\nThis would open a form prepopulated with:\n\n` +
            `• Registration: ${aircraft.identification.tailNumber}\n` +
            `• Manufacturer: ${aircraft.identification.manufacturer}\n` +
            `• Model: ${aircraft.identification.model}\n` +
            `• Year: ${aircraft.identification.year}\n` +
            `• Hours: ${aircraft.time.airframeTotal.toFixed(1)}\n` +
            `• Rate: $${aircraft.rates.hourlyRate}/hr\n` +
            `• Home Base: ${aircraft.location.homeBase}\n\n` +
            `You would then be able to edit any of these fields and save the changes.\n\n` +
            `This functionality will be implemented in the next iteration.`);
    }, 300);
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.showAircraftDetails = showAircraftDetails;
    window.handleBookNow = handleBookNow;
    window.handleReportMaintenance = handleReportMaintenance;
    window.handleScheduleMaintenance = handleScheduleMaintenance;
    window.handleMaintenanceLog = handleMaintenanceLog;
    window.handleAddAircraft = handleAddAircraft;
    window.handleEditAircraft = handleEditAircraft;
    window.closeModal = closeModal;
    window.addNewLogEntry = addNewLogEntry;
    window.submitLogEntry = submitLogEntry;
    window.editLogEntry = editLogEntry;
    window.viewLogbookEntry = viewLogbookEntry;
    window.exportMaintenanceLog = exportMaintenanceLog;
    window.printMaintenanceLog = printMaintenanceLog;
}
