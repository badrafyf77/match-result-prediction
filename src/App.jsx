import React, { useState } from 'react';
import LeaguesList from '/component/LeaguesList';
import TeamsList from '/component/TeamsList';
import PredictionResult from '/component/PredictionResult';
import './common.css';

const App = () => {
  const [view, setView] = useState('leagues'); // 'leagues', 'teams', 'prediction'
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedTeams, setSelectedTeams] = useState({ home: null, away: null });
  const [prediction, setPrediction] = useState(null);

  const handleSelectLeague = (league) => {
    setSelectedLeague(league);
    setView('teams');
  };

  const handleSelectTeams = (homeTeam, awayTeam) => {
    setSelectedTeams({ home: homeTeam, away: awayTeam });
    setView('prediction');
    generatePrediction(homeTeam, awayTeam);
  };

  const generatePrediction = async (homeTeam, awayTeam) => {
    // Simulate API call to get prediction
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock prediction data - replace with actual API call
    const mockPrediction = {
      homeScore: Math.floor(Math.random() * 4),
      awayScore: Math.floor(Math.random() * 3),
      winner: Math.random() > 0.6 ? 'home' : (Math.random() > 0.3 ? 'away' : 'draw'),
      probability: {
        home: Math.floor(Math.random() * 40) + 30,
        draw: Math.floor(Math.random() * 30) + 10,
        away: 100 - (Math.floor(Math.random() * 40) + 30) - (Math.floor(Math.random() * 30) + 10)
      },
      expectedGoals: {
        home: (Math.random() * 3).toFixed(2),
        away: (Math.random() * 2).toFixed(2)
      },
      bothTeamsToScore: Math.random() > 0.5,
      overUnder: (Math.random() * 2) + 1.5
    };
    
    setPrediction(mockPrediction);
  };

  const handleBackToLeagues = () => {
    setSelectedLeague(null);
    setView('leagues');
  };

  const handleBackToTeams = () => {
    setPrediction(null);
    setView('teams');
  };

  return (
    <div className="app-container">
      <div className="container">
        <header className="header">
          <h1>Football Match Predictor</h1>
          <p>AI-powered match predictions for top football leagues</p>
        </header>

        {view === 'leagues' && <LeaguesList onSelectLeague={handleSelectLeague} />}
        {view === 'teams' && (
          <TeamsList 
            league={selectedLeague} 
            onSelectTeams={handleSelectTeams} 
            onBack={handleBackToLeagues}
          />
        )}
        {view === 'prediction' && (
          <PredictionResult 
            league={selectedLeague}
            homeTeam={selectedTeams.home}
            awayTeam={selectedTeams.away}
            prediction={prediction}
            onBack={handleBackToTeams}
          />
        )}
      </div>
    </div>
  );
};

export default App;