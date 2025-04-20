import React from 'react';
import '../src/LeaguesList.css';

const leaguesData = [
  {
    name: 'English Premier League',
    key: 'epl',
    logo: 'https://media.api-sports.io/football/leagues/39.png',
    id: '4328'
  },
  {
    name: 'La Liga',
    key: 'liga',
    logo: 'https://media.api-sports.io/football/leagues/140.png',
    id: '4335'
  },
  {
    name: 'Bundesliga',
    key: 'bundesliga',
    logo: 'https://media.api-sports.io/football/leagues/78.png',
    id: '4331'
  },
  {
    name: 'Serie A',
    key: 'serie',
    logo: 'https://media.api-sports.io/football/leagues/135.png',
    id: '4332'
  },
  {
    name: 'Ligue 1',
    key: 'ligue',
    logo: 'https://media.api-sports.io/football/leagues/61.png',
    id: '4334'
  },
  {
    name: 'Moroccan League',
    key: 'inwi',
    logo: 'https://media.api-sports.io/football/leagues/200.png',
    id: '4520'
  }
];

const LeaguesList = ({ onSelectLeague }) => {
  return (
    <div className="leagues-container">
      <h2>Select a League</h2>
      <div className="leagues-grid">
        {leaguesData.map(league => (
          <div 
            key={league.id} 
            className="league-card"
            onClick={() => onSelectLeague(league)}
          >
            <img src={league.logo} alt={league.name} className="league-logo" />
            <h3>{league.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaguesList;