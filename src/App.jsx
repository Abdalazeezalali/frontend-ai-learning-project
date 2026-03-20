import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ProtectedRoute from './auth/ProtectedRoute';
import DashboardPage from './dashboard/DashboardPage';
import DocumentListPage from './dashboard/DocumentListPage';
import DocumentDetailPage from './dashboard/DocumentDetailPage';
import FlashcardsPage from './dashboard/FlashcardsPage';
import FlashcardsListPage from './dashboard/FlashcardsListPage';
import QuizListPage from './dashboard/QuizListPage';
import QuizTakePage from './dashboard/QuizTakePage';
import QuizResultPage from './dashboard/QuizResultPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentListPage />} />
            <Route path="/documents/:id" element={<DocumentDetailPage />} />
            <Route path="/flashcards" element={<FlashcardsListPage />} />
            <Route path="/flashcards/:documentId" element={<FlashcardsPage />} />
            <Route path="/quizzes/:documentId" element={<QuizListPage />} />
            <Route path="/quiz/:id" element={<QuizTakePage />} />
            <Route path="/quiz/:id/results" element={<QuizResultPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
