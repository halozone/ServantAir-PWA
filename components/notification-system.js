/**
 * ServantAir Notification System
 * Handles push notifications, in-app notifications, and scheduling
 *
 * Features:
 * - Flight reminders (24h, 1h before)
 * - Currency expiration alerts
 * - Maintenance due notifications
 * - Weather alerts
 * - Instructor confirmations
 */

class NotificationSystem {
    constructor(options = {}) {
        this.options = {
            enablePush: options.enablePush !== false,
            enableInApp: options.enableInApp !== false,
            swPath: options.swPath || '/sw.js',
            ...options
        };

        this.permission = Notification.permission;
        this.subscription = null;
        this.init();
    }

    async init() {
        console.log('[Notifications] Initializing notification system...');

        // Register service worker if push notifications enabled
        if (this.options.enablePush && 'serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register(this.options.swPath);
                console.log('[Notifications] Service Worker registered:', registration);

                // Check if already subscribed
                this.subscription = await registration.pushManager.getSubscription();
                if (this.subscription) {
                    console.log('[Notifications] Already subscribed to push');
                }
            } catch (error) {
                console.error('[Notifications] Service Worker registration failed:', error);
            }
        }

        // Set up periodic checks for notifications
        this.startPeriodicChecks();

        // Listen for online/offline events
        window.addEventListener('online', () => this.syncPendingNotifications());
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('[Notifications] This browser does not support notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;

            if (permission === 'granted') {
                console.log('[Notifications] Permission granted');
                await this.subscribeToPush();
                return true;
            } else {
                console.warn('[Notifications] Permission denied');
                return false;
            }
        } catch (error) {
            console.error('[Notifications] Permission request failed:', error);
            return false;
        }
    }

    async subscribeToPush() {
        if (!this.options.enablePush || this.subscription) {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.options.vapidPublicKey || '')
            });

            this.subscription = subscription;
            console.log('[Notifications] Subscribed to push:', subscription);

            // Send subscription to server
            await this.sendSubscriptionToServer(subscription);

            return subscription;
        } catch (error) {
            console.error('[Notifications] Push subscription failed:', error);
        }
    }

    async sendSubscriptionToServer(subscription) {
        // This would send to your backend API
        console.log('[Notifications] Sending subscription to server:', subscription);

        try {
            const response = await fetch('/api/push-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            });

            if (response.ok) {
                console.log('[Notifications] Subscription saved to server');
            }
        } catch (error) {
            console.error('[Notifications] Failed to save subscription:', error);
        }
    }

    // Schedule flight reminder notifications
    scheduleFlightReminder(booking) {
        const flightDate = new Date(`${booking.date}T${booking.startTime}`);
        const now = new Date();

        // 24-hour reminder
        const reminder24h = new Date(flightDate.getTime() - (24 * 60 * 60 * 1000));
        if (reminder24h > now) {
            this.scheduleNotification({
                title: '✈️ Flight Tomorrow',
                body: `Your flight in ${booking.aircraft} is tomorrow at ${booking.startTime}`,
                tag: `flight-24h-${booking.id}`,
                data: {
                    type: 'flight-reminder',
                    bookingId: booking.id,
                    time: '24h'
                },
                showAt: reminder24h
            });
        }

        // 1-hour reminder
        const reminder1h = new Date(flightDate.getTime() - (60 * 60 * 1000));
        if (reminder1h > now) {
            this.scheduleNotification({
                title: '✈️ Flight in 1 Hour',
                body: `Your flight in ${booking.aircraft} starts at ${booking.startTime}`,
                tag: `flight-1h-${booking.id}`,
                data: {
                    type: 'flight-reminder',
                    bookingId: booking.id,
                    time: '1h'
                },
                showAt: reminder1h,
                requireInteraction: true
            });
        }
    }

    // Schedule currency expiration notification
    scheduleCurrencyAlert(currency) {
        const expirationDate = new Date(currency.expirationDate);
        const now = new Date();

        const alerts = [
            { days: 30, title: '📅 Currency Expires in 30 Days' },
            { days: 14, title: '⚠️ Currency Expires in 2 Weeks' },
            { days: 7, title: '🚨 Currency Expires in 1 Week' },
            { days: 1, title: '🔴 Currency Expires Tomorrow' }
        ];

        alerts.forEach(alert => {
            const alertDate = new Date(expirationDate.getTime() - (alert.days * 24 * 60 * 60 * 1000));
            if (alertDate > now) {
                this.scheduleNotification({
                    title: alert.title,
                    body: `Your ${currency.type} expires on ${expirationDate.toLocaleDateString()}`,
                    tag: `currency-${currency.type}-${alert.days}d`,
                    data: {
                        type: 'currency-expiration',
                        currencyType: currency.type,
                        daysRemaining: alert.days
                    },
                    showAt: alertDate
                });
            }
        });
    }

    // Schedule maintenance due notification
    scheduleMaintenanceAlert(aircraft) {
        if (!aircraft.nextMaintenance) return;

        const maintenanceDate = new Date(aircraft.nextMaintenance.date);
        const now = new Date();

        const alerts = [
            { days: 30, title: '🔧 Maintenance Due in 30 Days' },
            { days: 7, title: '⚠️ Maintenance Due in 1 Week' },
            { days: 1, title: '🚨 Maintenance Due Tomorrow' }
        ];

        alerts.forEach(alert => {
            const alertDate = new Date(maintenanceDate.getTime() - (alert.days * 24 * 60 * 60 * 1000));
            if (alertDate > now) {
                this.scheduleNotification({
                    title: alert.title,
                    body: `${aircraft.registration} - ${aircraft.nextMaintenance.type}`,
                    tag: `maintenance-${aircraft.id}-${alert.days}d`,
                    data: {
                        type: 'maintenance-due',
                        aircraftId: aircraft.id,
                        maintenanceType: aircraft.nextMaintenance.type
                    },
                    showAt: alertDate
                });
            }
        });
    }

    // Schedule a notification for future display
    scheduleNotification(notification) {
        const scheduledNotifications = this.getScheduledNotifications();
        scheduledNotifications.push(notification);
        localStorage.setItem('scheduled_notifications', JSON.stringify(scheduledNotifications));

        console.log('[Notifications] Scheduled:', notification);
    }

    // Check for due notifications
    async checkScheduledNotifications() {
        const scheduledNotifications = this.getScheduledNotifications();
        const now = new Date();
        const dueNotifications = [];
        const remainingNotifications = [];

        scheduledNotifications.forEach(notification => {
            const showAt = new Date(notification.showAt);
            if (showAt <= now) {
                dueNotifications.push(notification);
            } else {
                remainingNotifications.push(notification);
            }
        });

        // Show due notifications
        for (const notification of dueNotifications) {
            await this.showNotification(notification);
        }

        // Save remaining scheduled notifications
        localStorage.setItem('scheduled_notifications', JSON.stringify(remainingNotifications));

        return dueNotifications.length;
    }

    // Show a notification
    async showNotification(options) {
        const {
            title,
            body,
            icon = '/icons/icon-192x192.png',
            badge = '/icons/badge-72x72.png',
            tag,
            data,
            requireInteraction = false,
            actions = []
        } = options;

        // Check permission
        if (this.permission !== 'granted') {
            console.warn('[Notifications] Permission not granted');
            // Show in-app notification instead
            this.showInAppNotification({ title, body, data });
            return;
        }

        try {
            if (this.options.enablePush && 'serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, {
                    body,
                    icon,
                    badge,
                    tag,
                    data,
                    requireInteraction,
                    vibrate: [200, 100, 200],
                    actions: actions.length > 0 ? actions : [
                        { action: 'view', title: 'View', icon: '/icons/view-icon.png' },
                        { action: 'dismiss', title: 'Dismiss', icon: '/icons/dismiss-icon.png' }
                    ]
                });
            } else {
                // Fallback to Web Notification API
                new Notification(title, {
                    body,
                    icon,
                    badge,
                    tag,
                    data,
                    requireInteraction
                });
            }

            console.log('[Notifications] Notification shown:', title);
        } catch (error) {
            console.error('[Notifications] Failed to show notification:', error);
            this.showInAppNotification({ title, body, data });
        }
    }

    // Show in-app notification (toast)
    showInAppNotification(options) {
        const { title, body, data, type = 'info', duration = 5000 } = options;

        // Create toast container if it doesn't exist
        let container = document.getElementById('inAppNotifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'inAppNotifications';
            container.className = 'notification-container';
            document.body.appendChild(container);
            this.addInAppStyles();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-title">${title}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
            ${body ? `<div class="notification-body">${body}</div>` : ''}
        `;

        container.appendChild(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                notification.classList.add('notification-fade-out');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        // Add click handler if data provided
        if (data && data.url) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', () => {
                window.location.href = data.url;
            });
        }
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            flight: '✈️',
            currency: '📅',
            maintenance: '🔧',
            weather: '🌤️'
        };
        return icons[type] || icons.info;
    }

    getScheduledNotifications() {
        const stored = localStorage.getItem('scheduled_notifications');
        return stored ? JSON.parse(stored) : [];
    }

    clearScheduledNotifications() {
        localStorage.removeItem('scheduled_notifications');
    }

    startPeriodicChecks() {
        // Check every minute for due notifications
        setInterval(() => {
            this.checkScheduledNotifications();
        }, 60000);

        // Initial check
        this.checkScheduledNotifications();
    }

    async syncPendingNotifications() {
        // Sync when coming back online
        console.log('[Notifications] Syncing pending notifications...');
        await this.checkScheduledNotifications();
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    addInAppStyles() {
        if (document.getElementById('notification-system-styles')) return;

        const style = document.createElement('style');
        style.id = 'notification-system-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 400px;
            }

            .notification {
                background: white;
                border-radius: 12px;
                padding: 16px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease-out;
                border-left: 4px solid #4299e1;
            }

            .notification-info { border-left-color: #4299e1; }
            .notification-success { border-left-color: #48bb78; }
            .notification-warning { border-left-color: #ed8936; }
            .notification-error { border-left-color: #e53e3e; }
            .notification-flight { border-left-color: #667eea; }
            .notification-currency { border-left-color: #f56565; }
            .notification-maintenance { border-left-color: #ed8936; }

            .notification-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }

            .notification-icon {
                font-size: 20px;
            }

            .notification-title {
                flex: 1;
                font-weight: 600;
                color: #2d3748;
            }

            .notification-close {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.5;
                padding: 0;
                width: 24px;
                height: 24px;
            }

            .notification-close:hover {
                opacity: 1;
            }

            .notification-body {
                color: #4a5568;
                font-size: 14px;
                line-height: 1.5;
            }

            .notification-fade-out {
                animation: slideOut 0.3s ease-out forwards;
            }

            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }

            @media (max-width: 768px) {
                .notification-container {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-initialize on page load
let notificationSystem;
document.addEventListener('DOMContentLoaded', () => {
    notificationSystem = new NotificationSystem();
    window.notificationSystem = notificationSystem;
});

// Make available globally
window.NotificationSystem = NotificationSystem;
