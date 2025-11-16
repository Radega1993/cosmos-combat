import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import HowToPlayPage from './pages/HowToPlayPage';
import './App.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LobbyPage />} />
                <Route path="/how-to-play" element={<HowToPlayPage />} />
                <Route path="/game/:gameId" element={<GamePage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

