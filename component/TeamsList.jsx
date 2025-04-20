import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../src/TeamsList.css';

const TeamsList = ({ league, onSelectTeams, onBack }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);

  // Map our internal league names to thesportsdb league names
  const leagueNameMap = {
    'English Premier League': 'English Premier League',
    'La Liga': 'Spanish La Liga',
    'Bundesliga': 'German Bundesliga',
    'Serie A': 'Italian Serie A',
    'Ligue 1': 'French Ligue 1',
    'Moroccan League': 'Moroccan Championship'
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the league name from our mapping
        const leagueName = leagueNameMap[league.name];
        
        if (!leagueName) {
          throw new Error('League not supported');
        }
        
        // Fetch all teams and filter by league name
        const response = await axios.get(
          `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=${encodeURIComponent(leagueName)}`
        );
        
        if (!response.data || !response.data.teams) {
          throw new Error('No teams data received');
        }
        
        // Transform the API response to match our expected format
        const formattedTeams = response.data.teams.map(team => ({
          team: {
            id: team.idTeam,
            name: team.strTeam,
            logo: team.strBadge,
            stadium: team.strStadium,
            country: team.strCountry,
            description: team.strDescriptionEN,
            founded: team.intFormedYear,
            jersey: team.strEquipment
          }
        }));
        
        setTeams(formattedTeams);
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Failed to fetch teams. Please try again later.');
        
        // Fallback to mock data with league-specific teams if API fails
        const mockTeams = getMockTeamsForLeague(league.name);
        setTeams(mockTeams);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [league]);

  // Helper function to provide league-specific mock data
  const getMockTeamsForLeague = (leagueName) => {
    const mockTeamsMap = {
      'English Premier League': [
        { team: { id: '133604', name: 'Arsenal', logo: 'https://www.thesportsdb.com/images/media/team/badge/xtwxyt1421431860.png' }},
        { team: { id: '133602', name: 'Chelsea', logo: 'https://www.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png' }},
        { team: { id: '133601', name: 'Liverpool', logo: 'https://www.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png' }},
        { team: { id: '133610', name: 'Manchester City', logo: 'https://www.thesportsdb.com/images/media/team/badge/qttvpr1448813355.png' }},
        { team: { id: '133612', name: 'Manchester United', logo: 'https://www.thesportsdb.com/images/media/team/badge/trwqyw1448813215.png' }}
      ],
      'La Liga': [
        { team: { id: '133738', name: 'Barcelona', logo: 'https://www.thesportsdb.com/images/media/team/badge/xxvryt1448813219.png' }},
        { team: { id: '133739', name: 'Real Madrid', logo: 'https://www.thesportsdb.com/images/media/team/badge/qzqkst1448813215.png' }},
        { team: { id: '133740', name: 'Atletico Madrid', logo: 'https://www.thesportsdb.com/images/media/team/badge/yvwvtu1448813215.png' }},
        { team: { id: '133741', name: 'Sevilla', logo: 'https://www.thesportsdb.com/images/media/team/badge/rrrrtt1448813215.png' }},
        { team: { id: '133742', name: 'Valencia', logo: 'https://www.thesportsdb.com/images/media/team/badge/tyttyy1448813215.png' }}
      ],
      'Bundesliga': [
        { team: { id: '133674', name: 'Bayern Munich', logo: 'https://www.thesportsdb.com/images/media/team/badge/xxvryt1448813219.png' }},
        { team: { id: '133675', name: 'Borussia Dortmund', logo: 'https://www.thesportsdb.com/images/media/team/badge/qzqkst1448813215.png' }}
      ],
      'Serie A': [
        { team: { id: '133602', name: 'Juventus', logo: 'https://www.thesportsdb.com/images/media/team/badge/xxvryt1448813219.png' }},
        { team: { id: '133603', name: 'AC Milan', logo: 'https://www.thesportsdb.com/images/media/team/badge/qzqkst1448813215.png' }}
      ],
      'Ligue 1': [
        { team: { id: '133613', name: 'PSG', logo: 'https://www.thesportsdb.com/images/media/team/badge/xxvryt1448813219.png' }},
        { team: { id: '133614', name: 'Marseille', logo: 'https://www.thesportsdb.com/images/media/team/badge/qzqkst1448813215.png' }}
      ],
      'Moroccan League': [
        { team: { id: '136157', name: 'Wydad Casablanca', logo: 'https://www.thesportsdb.com/images/media/team/badge/wydad.png' }},
        { team: { id: '136158', name: 'Raja Casablanca', logo: 'https://www.thesportsdb.com/images/media/team/badge/raja.png' }},
        { team: { id: '136159', name: 'AS FAR', logo: 'https://www.thesportsdb.com/images/media/team/badge/far.png' }}
      ]
    };

    return mockTeamsMap[leagueName] || [
      { team: { id: '1', name: 'Team 1', logo: 'https://via.placeholder.com/150' }},
      { team: { id: '2', name: 'Team 2', logo: 'https://via.placeholder.com/150' }}
    ];

  };
  const handleTeamSelect = (team) => {
    if (!homeTeam) {
      setHomeTeam(team);
    } else if (!awayTeam && team.id !== homeTeam.id) {
      setAwayTeam(team);
    } else if (team.id === homeTeam.id) {
      setHomeTeam(null);
    } else if (team.id === awayTeam.id) {
      setAwayTeam(null);
    }
  };

  const handleSubmit = () => {
    if (homeTeam && awayTeam) {
      onSelectTeams(homeTeam, awayTeam);
    }
  };

  const isSelected = (team) => {
    return (homeTeam && team.id === homeTeam.id) || (awayTeam && team.id === awayTeam.id);
  };

  // ... rest of the component code remains the same ...
  // (handleTeamSelect, handleSubmit, isSelected, and render methods)

  return (
    <div className="teams-container">
      <button onClick={onBack} className="back-button">← Back to Leagues</button>
      <h2>Select Teams from {league.name}</h2>
      
      {loading && <div className="loading-spinner">Loading teams...</div>}
      {error && <p className="error">{error}</p>}
      
      <div className="teams-grid">
        {teams.map(({ team }) => (
          <div
            key={team.id}
            className={`team-card ${isSelected(team) ? 'selected' : ''}`}
            onClick={() => handleTeamSelect(team)}
          >
            <img 
              src={team.logo || 'https://via.placeholder.com/150'} 
              alt={team.name} 
              className="team-logo" 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
            <h3>{team.name}</h3>
            {isSelected(team) && (
              <span className="selection-badge">
                {team.id === homeTeam?.id ? 'Home' : 'Away'}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {homeTeam && awayTeam && (
        <button onClick={handleSubmit} className="predict-button">
          Predict Match
        </button>
      )}
      
      <div className="selected-teams">
        {homeTeam && (
          <div className="selected-team">
            <h4>Home Team:</h4>
            <img 
              src={homeTeam.logo || 'https://via.placeholder.com/150'} 
              alt={homeTeam.name} 
              className="team-logo-small" 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
            <p>{homeTeam.name}</p>
            {homeTeam.stadium && <p className="team-stadium">{homeTeam.stadium}</p>}
          </div>
        )}
        
        {awayTeam && (
          <div className="selected-team">
            <h4>Away Team:</h4>
            <img 
              src={awayTeam.logo || 'https://via.placeholder.com/150'} 
              alt={awayTeam.name} 
              className="team-logo-small" 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
            <p>{awayTeam.name}</p>
            {awayTeam.stadium && <p className="team-stadium">{awayTeam.stadium}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsList;