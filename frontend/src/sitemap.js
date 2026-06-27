// src/sitemap.js
export const hostSitemap = {
  // Public Routes
  public: [
    { 
      path: '/', 
      name: 'Home', 
      icon: '🏠',
      component: 'LandingPage'
    },
    { 
      path: '/about', 
      name: 'About', 
      icon: 'ℹ️',
      component: 'AboutPage'
    },
    { 
      path: '/contact', 
      name: 'Contact', 
      icon: '📞',
      component: 'ContactPage'
    },
    { 
      path: '/pricing', 
      name: 'Pricing', 
      icon: '💰',
      component: 'PricingPage'
    }
  ],
  
  // Auth Routes
  auth: [
    { 
      path: '/login', 
      name: 'Sign In', 
      icon: '🔐',
      component: 'LoginPage'
    },
    { 
      path: '/signup', 
      name: 'Sign Up', 
      icon: '📝',
      component: 'SignUpPage'
    },
    { 
      path: '/forgot-password', 
      name: 'Forgot Password', 
      icon: '🔑',
      component: 'ForgotPasswordPage'
    }
  ],
  
  // Host Dashboard Routes (Protected)
  host: [
    {
      section: 'Dashboard',
      routes: [
        { 
          path: '/host/dashboard', 
          name: 'Overview', 
          icon: '📊',
          description: 'View all your event statistics'
        },
        { 
          path: '/host/home', 
          name: 'Events', 
          icon: '📅',
          description: 'Manage your events'
        }
      ]
    },
    {
      section: 'Event Management',
      routes: [
        { 
          path: '/host/create-event', 
          name: 'Create Event', 
          icon: '➕',
          description: 'Create a new event'
        },
        { 
          path: '/host/guest-list', 
          name: 'Guest List', 
          icon: '👥',
          description: 'Manage your guests'
        },
        { 
          path: '/host/invitation', 
          name: 'Invitations', 
          icon: '📨',
          description: 'Send and track invitations'
        },
        { 
          path: '/host/admin-roles', 
          name: 'Admin Roles', 
          icon: '🛡️',
          description: 'Manage team permissions'
        }
      ]
    },
    {
      section: 'Event Experience',
      routes: [
        { 
          path: '/gallery', 
          name: 'Gallery', 
          icon: '🖼️',
          description: 'Event photos and videos'
        },
        { 
          path: '/timeline', 
          name: 'Timeline', 
          icon: '⏳',
          description: 'Event timeline and memories'
        },
        { 
          path: '/scan-qr', 
          name: 'Scan QR', 
          icon: '📱',
          description: 'QR code check-in'
        }
      ]
    },
    {
      section: 'Account',
      routes: [
        { 
          path: '/profile', 
          name: 'Profile', 
          icon: '👤',
          description: 'Your profile settings'
        },
        { 
          path: '/settings', 
          name: 'Settings', 
          icon: '⚙️',
          description: 'Account settings'
        },
        { 
          path: '/notification', 
          name: 'Notifications', 
          icon: '🔔',
          description: 'Your notifications'
        }
      ]
    }
  ]
};
