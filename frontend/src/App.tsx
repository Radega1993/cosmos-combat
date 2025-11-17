import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import HowToPlayPage from './pages/HowToPlayPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LobbyPage />} />
                <Route path="/how-to-play" element={<HowToPlayPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute requireAdmin={true}>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <ProtectedRoute requireAdmin={true}>
                            <AnalyticsPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/game/:gameId" element={<GamePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

