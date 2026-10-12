import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { FleetsProvider } from './features/fleet/context/FleetsContext.jsx'
import RequireAuth from './features/auth/components/RequireAuth.jsx'
import Layout from './components/layout/Layout.jsx'
import GlobalLoader from './components/common/GlobalLoader.jsx'
import { Toaster } from 'react-hot-toast'

const Login = lazy(() => import('./features/auth/pages/Login.jsx'))
const Register = lazy(() => import('./features/auth/pages/Register.jsx'))
const VerifyEmail = lazy(() => import('./features/auth/pages/VerifyEmail.jsx'))
const ForgotPassword = lazy(() => import('./features/auth/pages/ForgotPassword.jsx'))
const Dashboard = lazy(() => import('./features/dashboard/pages/Dashboard.jsx'))
const Fleets = lazy(() => import('./features/fleet/pages/Fleets.jsx'))
const Users = lazy(() => import('./features/users/pages/Users.jsx'))
const Settings = lazy(() => import('./features/super-admin/pages/Settings.jsx'))
const MyFleet = lazy(() => import('./features/fleet/pages/MyFleet.jsx'))
const Vehicles = lazy(() => import('./features/fleet/pages/Vehicles.jsx'))
const Drivers = lazy(() => import('./features/fleet/pages/Drivers.jsx'))
const CreateDriverPage = lazy(() => import('./features/fleet/pages/CreateDriverPage.jsx'))
const EditDriverPage = lazy(() => import('./features/fleet/pages/EditDriverPage.jsx'))
const Attorneys = lazy(() => import('./features/users/pages/Attorneys.jsx'))
const AttorneyProfile = lazy(() => import('./features/users/pages/AttorneyProfile.jsx'))
const DetentionCenter = lazy(() => import('./features/intelligence/pages/DetentionCenter.jsx'))
const VehicleDetail = lazy(() => import('./features/fleet/pages/VehicleDetail.jsx'))
const Subscription = lazy(() => import('./features/super-admin/pages/Subscription.jsx'))
const CaseTracker = lazy(() => import('./features/intelligence/pages/CaseTracker.jsx'))
const IntelligenceHub = lazy(() => import('./features/intelligence/pages/IntelligenceHub.jsx'))
const SosIncidents = lazy(() => import('./features/intelligence/pages/SosIncidents.jsx'))
const PartnerOnboarding = lazy(() => import('./features/users/pages/PartnerOnboarding.jsx'))
const CaseDetail = lazy(() => import('./features/intelligence/pages/CaseDetail.jsx'))
const ManageSubscriptionPlans = lazy(() => import('./features/super-admin/pages/ManageSubscriptionPlans.jsx'))
const FleetCaseStatus = lazy(() => import('./features/fleet/pages/FleetCaseStatus.jsx'))
const Templates = lazy(() => import('./features/super-admin/pages/Templates.jsx'))

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SocketProvider>
          <Toaster
            position="top-right"
            containerStyle={{ zIndex: 99999 }}
            toastOptions={{
              className:
                'glass-panel !text-zinc-50 !bg-zinc-900 text-sm font-medium tracking-wide',
              style: {
                borderRadius: '12px',
              },
              success: {
                iconTheme: {
                  primary: '#00E5FF',
                  secondary: '#1A1B23',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#1A1B23',
                },
              },
            }}
          />
          <FleetsProvider>
          <Suspense fallback={<GlobalLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                element={
                  <RequireAuth>
                    <Layout />
                  </RequireAuth>
                }
              >
                {/* Shared */}
                <Route path="/" element={<Dashboard />} />

                {/* Super Admin only */}
                <Route path="/fleets" element={<Fleets />} />
                <Route path="/fleets/onboard" element={<PartnerOnboarding />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
                {/* Super Admin Drivers page temporarily disabled
                <Route path="/all-drivers" element={<AllDrivers />} />
                <Route path="/all-drivers/:driverId" element={<AdminDriverProfile />} />
                */}
                <Route path="/templates" element={<Templates />} />
                <Route path="/case-tracker" element={<CaseTracker />} />
                <Route path="/intelligence" element={<IntelligenceHub />} />
                <Route path="/case-tracker/:caseId" element={<CaseDetail />} />
                <Route path="/sos-incidents" element={<SosIncidents />} />
                <Route path="/subscription/plans" element={<ManageSubscriptionPlans />} />

                {/* Fleet Owner only */}
                <Route path="/my-fleet" element={<MyFleet />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/drivers/new" element={<CreateDriverPage />} />
                <Route path="/drivers/:driverId/edit" element={<EditDriverPage />} />
                <Route path="/attorneys" element={<Attorneys />} />
                <Route path="/attorneys/:attorneyId" element={<AttorneyProfile />} />
                <Route path="/case-status" element={<FleetCaseStatus />} />
                <Route path="/facility/dc-4" element={<DetentionCenter />} />
                <Route path="/my-fleet/vehicle/:unitId" element={<VehicleDetail />} />
                <Route path="/subscription" element={<Subscription />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          </FleetsProvider>
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

