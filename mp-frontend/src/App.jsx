import React from 'react';
import { Routes, Route } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './components/AdminLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

// Constituents
import ConstituentsList from './features/constituents/ConstituentsList.jsx';
import ConstituentsCreate from './features/constituents/ConstituentsCreate.jsx';
import ConstituentsUpdate from './features/constituents/ConstituentsUpdate.jsx';

// Categories
import CategoriesList from './features/categories/CategoriesList.jsx';
import CategoriesCreate from './features/categories/CategoriesCreate.jsx';
import CategoriesUpdate from './features/categories/CategoriesUpdate.jsx';

// Applications
import ApplicationList from './features/applications/ApplicationList.jsx';
import ApplicationCreate from './features/applications/ApplicationCreate.jsx';
import ApplicationUpdate from './features/applications/ApplicationUpdate.jsx';

// Events
import EventList from './features/events/EventList.jsx';
import EventCreate from './features/events/EventCreate.jsx';
import EventUpdate from './features/events/EventUpdate.jsx';
import EventView from './features/events/EventView.jsx';

// Projects
import ProjectList from './features/projects/ProjectList.jsx';
import ProjectCreate from './features/projects/ProjectCreate.jsx';
import ProjectUpdate from './features/projects/ProjectUpdate.jsx';
import ProjectView from './features/projects/ProjectView.jsx';

// Project Activities
import ProjectActivityList from './features/project-activities/ProjectActivityList.jsx';
import ProjectActivityCreate from './features/project-activities/ProjectActivityCreate.jsx';
import ProjectActivityUpdate from './features/project-activities/ProjectActivityUpdate.jsx';
import ProjectActivityView from './features/project-activities/ProjectActivityView.jsx';

// Budgets
import BudgetList from './features/budgets/BudgetList.jsx';
import BudgetCreate from './features/budgets/BudgetCreate.jsx';
import BudgetUpdate from './features/budgets/BudgetUpdate.jsx';
import BudgetView from './features/budgets/BudgetView.jsx';

// Expenditures
import ExpenditureList from './features/expenditures/ExpenditureList.jsx';
import ExpenditureCreate from './features/expenditures/ExpenditureCreate.jsx';
import ExpenditureUpdate from './features/expenditures/ExpenditureUpdate.jsx';
import ExpenditureView from './features/expenditures/ExpenditureView.jsx';

// Payments
import PaymentList from './features/payments/PaymentList.jsx';
import PaymentCreate from './features/payments/PaymentCreate.jsx';
import PaymentUpdate from './features/payments/PaymentUpdate.jsx';
import PaymentView from './features/payments/PaymentView.jsx';

// Audit Logs
import AuditLogList from './features/audit-logs/AuditLogList.jsx';
import AuditLogView from './features/audit-logs/AuditLogView.jsx';

// Documents
import DocumentList from './features/documents/DocumentList';
import DocumentUpload from './features/documents/DocumentUpload';
import DocumentView from './features/documents/DocumentView';

// Notifications (Arifa)
import NotificationList from './features/notifications/NotificationList.jsx';
import NotificationView from './features/notifications/NotificationView.jsx';
import NotificationCreate from './features/notifications/NotificationCreate.jsx';

// Users (Watumiaji)
import UserList from './features/users/UserList.jsx';
import UserCreate from './features/users/UserCreate.jsx';
import UserUpdate from './features/users/UserUpdate.jsx';

// Reports (Ripoti)
import ReportsHome from './features/reports/ReportsHome.jsx';
import RequestsReport from './features/reports/RequestsReport.jsx';
import FinancialReport from './features/reports/FinancialReport.jsx';
import ProjectsReport from './features/reports/ProjectsReport.jsx';
import ConstituentsReport from './features/reports/ConstituentsReport.jsx';

//
import About from './pages/About.jsx';
import Contacts from './pages/Contacts.jsx';



// Wrapper inayounganisha ProtectedRoute + AdminLayout kwa page zote za ndani
function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/contacts" element={<Contacts />} />

      {/* Dashboard */}
      <Route path="/" element={<Protected><Dashboard /></Protected>} />

      {/* Change Password */}
      <Route path="/change-password" element={<Protected><ChangePassword /></Protected>} />

      {/* Constituents */}
      <Route path="/constituents" element={<Protected><ConstituentsList /></Protected>} />
      <Route path="/constituents/create" element={<Protected><ConstituentsCreate /></Protected>} />
      <Route path="/constituents/:id/edit" element={<Protected><ConstituentsUpdate /></Protected>} />

      {/* Categories */}
      <Route path="/categories" element={<Protected><CategoriesList /></Protected>} />
      <Route path="/categories/create" element={<Protected><CategoriesCreate /></Protected>} />
      <Route path="/categories/:id/edit" element={<Protected><CategoriesUpdate /></Protected>} />

      {/* Applications (Maombi) */}
      <Route path="/applications" element={<Protected><ApplicationList /></Protected>} />
      <Route path="/applications/create" element={<Protected><ApplicationCreate /></Protected>} />
      <Route path="/applications/:id/edit" element={<Protected><ApplicationUpdate /></Protected>} />

      {/* Events (Matukio) */}
      <Route path="/events" element={<Protected><EventList /></Protected>} />
      <Route path="/events/create" element={<Protected><EventCreate /></Protected>} />
      <Route path="/events/:id" element={<Protected><EventView /></Protected>} />
      <Route path="/events/:id/edit" element={<Protected><EventUpdate /></Protected>} />

      {/* Projects (Miradi) */}
      <Route path="/projects" element={<Protected><ProjectList /></Protected>} />
      <Route path="/projects/create" element={<Protected><ProjectCreate /></Protected>} />
      <Route path="/projects/:id" element={<Protected><ProjectView /></Protected>} />
      <Route path="/projects/:id/edit" element={<Protected><ProjectUpdate /></Protected>} />

      {/* Project Activities (Shughuli za Mradi) */}
      <Route path="/project-activities" element={<Protected><ProjectActivityList /></Protected>} />
      <Route path="/project-activities/create" element={<Protected><ProjectActivityCreate /></Protected>} />
      <Route path="/project-activities/:id" element={<Protected><ProjectActivityView /></Protected>} />
      <Route path="/project-activities/:id/edit" element={<Protected><ProjectActivityUpdate /></Protected>} />

      {/* Budgets (Bajeti) */}
      <Route path="/budgets" element={<Protected><BudgetList /></Protected>} />
      <Route path="/budgets/create" element={<Protected><BudgetCreate /></Protected>} />
      <Route path="/budgets/:id" element={<Protected><BudgetView /></Protected>} />
      <Route path="/budgets/:id/edit" element={<Protected><BudgetUpdate /></Protected>} />

      {/* Expenditures (Matumizi) */}
      <Route path="/expenditures" element={<Protected><ExpenditureList /></Protected>} />
      <Route path="/expenditures/create" element={<Protected><ExpenditureCreate /></Protected>} />
      <Route path="/expenditures/:id" element={<Protected><ExpenditureView /></Protected>} />
      <Route path="/expenditures/:id/edit" element={<Protected><ExpenditureUpdate /></Protected>} />

      {/* Payments (Malipo) */}
      <Route path="/payments" element={<Protected><PaymentList /></Protected>} />
      <Route path="/payments/create" element={<Protected><PaymentCreate /></Protected>} />
      <Route path="/payments/:id" element={<Protected><PaymentView /></Protected>} />
      <Route path="/payments/:id/edit" element={<Protected><PaymentUpdate /></Protected>} />

      {/* Documents (Nakala) */}
      
<Route
  path="/documents"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <DocumentList />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/documents/upload"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <DocumentUpload />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/documents/:id"
  element={
    <ProtectedRoute>
      <AdminLayout>
        <DocumentView />
      </AdminLayout>
    </ProtectedRoute>
  }
/>

      {/* Audit Logs (Kumbukumbu za Matendo) */}
      <Route path="/audit-logs" element={<Protected><AuditLogList /></Protected>} />
      <Route path="/audit-logs/:id" element={<Protected><AuditLogView /></Protected>} />

      {/* Notifications (Arifa) */}
      <Route path="/notifications" element={<Protected><NotificationList /></Protected>} />
      <Route path="/notifications/send" element={<Protected><NotificationCreate /></Protected>} />
      <Route path="/notifications/:id" element={<Protected><NotificationView /></Protected>} />

      {/* Users (Watumiaji) */}
      <Route path="/users" element={<Protected><UserList /></Protected>} />
      <Route path="/users/create" element={<Protected><UserCreate /></Protected>} />
      <Route path="/users/:id/edit" element={<Protected><UserUpdate /></Protected>} />

      {/* Reports (Ripoti) */}
      <Route path="/reports" element={<Protected><ReportsHome /></Protected>} />
      <Route path="/reports/requests" element={<Protected><RequestsReport /></Protected>} />
      <Route path="/reports/financial" element={<Protected><FinancialReport /></Protected>} />
      <Route path="/reports/projects" element={<Protected><ProjectsReport /></Protected>} />
      <Route path="/reports/constituents" element={<Protected><ConstituentsReport /></Protected>} />
    </Routes>
  );
}
