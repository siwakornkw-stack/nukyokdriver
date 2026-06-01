export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    vehicle: '/dashboard/vehicle',
    vehicleEdit: '/dashboard/vehicle/edit',
    driverJobs: '/dashboard/driver-jobs',
    importData: '/dashboard/import',

    integrations: '/dashboard/integrations',
    admin: '/dashboard/settings/admin',
    settings: '/dashboard/settings',
    logout: '/dashboard/logout',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
