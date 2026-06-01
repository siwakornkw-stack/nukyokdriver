'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';

import { AuthGuard } from '@/components/auth/auth-guard';
import { MainNav } from '@/components/dashboard/layout/main-nav';
import { SideNav } from '@/components/dashboard/layout/side-nav';
import { ToastContainer } from 'react-toastify';
import { ShareWrapper } from '@/contexts/share-context';
import { NotificationWrapper } from '@/contexts/notification-context';
import 'react-toastify/dist/ReactToastify.css';
import "sweetalert2/dist/sweetalert2.min.css";
import '../../../public/styles/swal-alert.scss';
import "animate.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const queryClient = new QueryClient()
  return (
    <AuthGuard>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '56px',
            '--MainNav-zIndex': 1000,
            '--SideNav-width': '280px',
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
          },
          '.Toastify__toast-container, .Toastify__toast, .Toastify__toast-body': {
            fontFamily: 'inherit !important',

            strong: {
              fontSize: '15px',
            },

            span: {
              fontSize: '14px',
              fontWeight: '400',
            },
          },
        }}
      />
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        <NotificationWrapper>
          <ShareWrapper>
            <SideNav />
            <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
              <MainNav />
              <main>
                <Container maxWidth="xl" sx={{ py: '20px' }}>
                  <QueryClientProvider client={queryClient}>
                    {children}
                  </QueryClientProvider>
                </Container>
              </main>
            </Box>
          </ShareWrapper>
          <ToastContainer />
        </NotificationWrapper>
      </Box>
    </AuthGuard>
  );
}
