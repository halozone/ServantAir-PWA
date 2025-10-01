// Navigation loader for ServantAir Application
// This script creates the navigation component directly in JavaScript

function loadNavigation() {
    console.log('Loading navigation...');
    // First, inject the necessary CSS styles
    injectNavigationCSS();
    
    // Navigation HTML template
    const navigationHTML = `
        <!-- Mobile Header -->
        <header class="mobile-header">
            <div class="hamburger-menu" id="hamburgerMenu">
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
                <div class="hamburger-line"></div>
            </div>
            <div class="logo-mobile">
                <div class="logo-icon-mobile">✈</div>
                <div class="logo-text-mobile">ServantAir</div>
            </div>
            <div class="user-avatar-mobile">JD</div>
        </header>

        <!-- Sidebar Overlay -->
        <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
        <nav class="sidebar-overlay" id="sidebarOverlay">
            <div class="logo">
                <div class="logo-icon-mobile">✈</div>
                <div class="logo-text-mobile" style="color: white; margin-left: 8px;">ServantAir</div>
            </div>
            
            <ul class="nav-menu">
                <li class="nav-item" data-page="dashboard">
                    <a href="/dashboard.html" class="nav-link">
                        <div class="nav-icon">📊</div>
                        Operations
                    </a>
                </li>
                <li class="nav-item" data-page="flight-line">
                    <a href="/flight-line.html" class="nav-link">
                        <div class="nav-icon">✈️</div>
                        Flight Line
                    </a>
                </li>
                <li class="nav-item" data-page="calendar">
                    <a href="/calendar/index.html" class="nav-link">
                        <div class="nav-icon">📅</div>
                        Calendar
                    </a>
                </li>
                <li class="nav-item" data-page="aircraft">
                    <a href="/aircraft.html" class="nav-link">
                        <div class="nav-icon">✈️</div>
                        Aircraft
                    </a>
                </li>
                <li class="nav-item" data-page="profile">
                    <a href="/profile.html" class="nav-link">
                        <div class="nav-icon">👤</div>
                        Profile
                    </a>
                </li>
                <li class="nav-item" data-page="membership">
                    <a href="/membership.html" class="nav-link">
                        <div class="nav-icon">👥</div>
                        Membership
                    </a>
                </li>
                <li class="nav-item" data-page="payments">
                    <a href="/payments.html" class="nav-link">
                        <div class="nav-icon">💳</div>
                        Payments
                    </a>
                </li>
                <li class="nav-item" data-page="messages">
                    <a href="/messages.html" class="nav-link">
                        <div class="nav-icon">💬</div>
                        Messages
                    </a>
                </li>
                <li class="nav-item" data-page="roles">
                    <a href="/roles.html" class="nav-link">
                        <div class="nav-icon">🛡️</div>
                        Roles
                    </a>
                </li>
                <li class="nav-item" data-page="settings">
                    <a href="/settings.html" class="nav-link">
                        <div class="nav-icon">⚙️</div>
                        Settings
                    </a>
                </li>
            </ul>
        </nav>
    `;
    
    // Insert navigation into the page
    const appContainer = document.querySelector('.app-container');
    console.log('App container found:', !!appContainer);
    if (appContainer) {
        // Remove any existing navigation elements first
        const existingNavs = appContainer.querySelectorAll('.mobile-header, .sidebar-overlay, .sidebar-backdrop, nav[class*="sidebar"], nav[class*="navigation"]');
        if (existingNavs.length > 0) {
            console.log('Removing existing navigation elements:', existingNavs.length);
            existingNavs.forEach(nav => nav.remove());
        }
        
        // Also remove any duplicate navigation containers
        const allNavs = appContainer.querySelectorAll('nav, .sidebar, .navigation');
        if (allNavs.length > 1) {
            console.log('Found multiple navigation containers, cleaning up...');
            // Keep only the first one and remove the rest
            for (let i = 1; i < allNavs.length; i++) {
                allNavs[i].remove();
            }
        }
        
        // Create a temporary div to hold the navigation HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = navigationHTML;
        
        // Find the main content div to preserve order
        const mainContent = appContainer.querySelector('.main-content, main');
        
        // Insert navigation elements before main content
        const elementsToInsert = [];
        for (let child of tempDiv.children) {
            if (child.nodeType === 1) { // Only element nodes
                elementsToInsert.push(child.cloneNode(true));
            }
        }
        
        // Insert all navigation elements
        console.log('Inserting navigation elements:', elementsToInsert.length);
        elementsToInsert.forEach(element => {
            if (mainContent) {
                appContainer.insertBefore(element, mainContent);
            } else {
                appContainer.appendChild(element);
            }
        });
        
        // Initialize navigation functionality after insertion
        initializeNavigationJS();
        
        // Verify navigation was loaded
        const newNav = appContainer.querySelector('.sidebar-overlay');
        if (newNav) {
            console.log('✅ Navigation loaded successfully with Flight Line menu item');
            
            // Final cleanup - ensure only one navigation exists
            const allSidebars = document.querySelectorAll('.sidebar-overlay, .sidebar, nav[class*="sidebar"]');
            if (allSidebars.length > 1) {
                console.log('Final cleanup: removing duplicate navigation elements');
                // Keep only the one we just created
                for (let i = 1; i < allSidebars.length; i++) {
                    allSidebars[i].remove();
                }
            }
        } else {
            console.log('❌ Navigation failed to load');
        }
    }
}

// Initialize navigation JavaScript functionality
function initializeNavigationJS() {
    // Mobile Navigation Toggle
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');

    if (hamburgerMenu && sidebarOverlay && sidebarBackdrop) {
        hamburgerMenu.addEventListener('click', () => {
            sidebarOverlay.classList.add('active');
            sidebarBackdrop.classList.add('active');
        });

        sidebarBackdrop.addEventListener('click', () => {
            sidebarOverlay.classList.remove('active');
            sidebarBackdrop.classList.remove('active');
        });
    }

    // Set active navigation item based on current page
    const currentPage = getCurrentPageName();
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const pageName = item.getAttribute('data-page');
        if (pageName === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Handle navigation clicks for pages without specific href (like current page)
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (link && link.getAttribute('href') === '#') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
            });
        }
    });
}

// Function to get current page name from URL
function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop(); // Get filename
    
    if (page === '' || page === 'index.html') return 'dashboard';
    
    // Remove .html extension and return page name
    return page.replace('.html', '');
}

// Function to inject navigation CSS styles
function injectNavigationCSS() {
    // Check if styles are already injected
    if (document.getElementById('navigation-styles')) return;
    
    const navigationCSS = `
        /* Navigation Styles */
        .mobile-header {
            background: white;
            padding: 16px 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .hamburger-menu {
            width: 24px;
            height: 24px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 2px 0;
        }

        .hamburger-line {
            width: 100%;
            height: 2px;
            background: #4a5568;
            border-radius: 2px;
            transition: all 0.3s ease;
        }

        .logo-mobile {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .logo-icon-mobile {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
        }

        .logo-text-mobile {
            font-size: 20px;
            font-weight: 700;
            color: #1a202c;
        }

        .user-avatar-mobile {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
        }

        /* Sidebar Overlay */
        .sidebar-overlay {
            position: fixed;
            top: 0;
            left: -280px;
            width: 280px;
            height: 100vh;
            background: linear-gradient(180deg, #1a202c 0%, #2d3748 100%);
            z-index: 1000;
            transition: left 0.3s ease;
            padding: 24px;
            overflow-y: auto;
        }

        .sidebar-overlay.active {
            left: 0;
        }

        .sidebar-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .sidebar-backdrop.active {
            opacity: 1;
            visibility: visible;
        }

        .sidebar-overlay .logo {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 32px;
            color: white;
        }

        .nav-menu {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .nav-item {
            margin-bottom: 8px;
            border-radius: 12px;
            overflow: hidden;
        }

        .nav-item.active {
            background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, var(--secondary-color, #764ba2) 100%);
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            color: #a0aec0;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .nav-item.active .nav-link {
            color: white;
        }

        .nav-item:hover:not(.active) {
            background: rgba(255, 255, 255, 0.1);
        }

        .nav-icon {
            font-size: 18px;
            width: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Desktop - Only hide mobile elements, don't change layout */
        @media (min-width: 769px) {
            .mobile-header {
                display: none;
            }
            
            .sidebar-backdrop {
                display: none;
            }
            
            .sidebar-overlay {
                position: relative;
                left: 0;
                width: 280px;
                height: auto;
                transition: none;
                z-index: auto;
            }
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'navigation-styles';
    styleSheet.type = 'text/css';
    styleSheet.innerText = navigationCSS;
    document.head.appendChild(styleSheet);
}

// Auto-load navigation when DOM is ready
document.addEventListener('DOMContentLoaded', loadNavigation);