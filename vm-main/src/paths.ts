export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    vehicle: '/dashboard/vehicle',
    vehicleEdit: '/dashboard/vehicle/edit',
    driver: '/dashboard/driver',
    driverJobs: '/dashboard/driver-jobs',
    importData: '/dashboard/import',
    report: '/dashboard/report',
    dataAdmin: '/dashboard/data-admin',

    integrations: '/dashboard/integrations',
    admin: '/dashboard/settings/admin',
    settings: '/dashboard/settings',
    logout: '/dashboard/logout',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
