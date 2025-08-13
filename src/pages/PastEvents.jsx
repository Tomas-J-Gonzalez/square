import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import Card from '../components/Card';
import Icon from '../components/Icon';

const PastEvents = () => {
  const [filter, setFilter] = useState('all');

  // Mock data for past events
  const pastEvents = [
    {
      id: 'abc123',
      title: 'Friday Night Dinner',
      date: '2024-01-15',
      time: '19:00',
      location: 'Joe\'s Pizza',
      decisionMode: 'vote',
      punishment: 'Buy Coffee',
      winner: 'Sarah',
      loser: 'Mike',
      flakeCount: 2
    },
    {
      id: 'def456',
      title: 'Movie Night',
      date: '2024-01-10',
      time: '20:00',
      location: 'Cinema Center',
      decisionMode: 'chance',
      punishment: 'Clean House',
      winner: 'Alex',
      loser: 'Emma',
      flakeCount: 1
    },
    {
      id: 'ghi789',
      title: 'Board Game Night',
      date: '2024-01-05',
      time: '18:00',
      location: 'Tom\'s House',
      decisionMode: 'game',
      punishment: 'Cook Dinner',
      winner: 'David',
      loser: 'Lisa',
      flakeCount: 3
    }
  ];

  const getDecisionModeIcon = (mode) => {
    switch (mode) {
      case 'vote': return 'vote-yea';
      case 'chance': return 'dice';
      case 'game': return 'gamepad';
      default: return 'question';
    }
  };

  const getDecisionModeColor = (mode) => {
    switch (mode) {
      case 'vote': return 'text-blue-500';
      case 'chance': return 'text-purple-500';
      case 'game': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const filteredEvents = filter === 'all' 
    ? pastEvents 
    : pastEvents.filter(event => event.decisionMode === filter);

  return (
    <Section>
      <div className="text-center mb-64">
        <h1 className="text-heading-1 text-content-default mb-16">
          Past Events
        </h1>
        <p className="text-body-lg text-content-subtle">
          See who got punished and track the flake count!
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex justify-center mb-48">
        <div className="flex space-x-8 bg-background-surface rounded-full p-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-16 py-8 rounded-full text-body-sm font-medium transition-colors duration-200 ${
              filter === 'all'
                ? 'bg-background-brand-brand-primary text-content-knockout'
                : 'text-content-subtle hover:text-content-default'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('vote')}
            className={`px-16 py-8 rounded-full text-body-sm font-medium transition-colors duration-200 ${
              filter === 'vote'
                ? 'bg-background-brand-brand-primary text-content-knockout'
                : 'text-content-subtle hover:text-content-default'
            }`}
          >
            Vote
          </button>
          <button
            onClick={() => setFilter('chance')}
            className={`px-16 py-8 rounded-full text-body-sm font-medium transition-colors duration-200 ${
              filter === 'chance'
                ? 'bg-background-brand-brand-primary text-content-knockout'
                : 'text-content-subtle hover:text-content-default'
            }`}
          >
            Chance
          </button>
          <button
            onClick={() => setFilter('game')}
            className={`px-16 py-8 rounded-full text-body-sm font-medium transition-colors duration-200 ${
              filter === 'game'
                ? 'bg-background-brand-brand-primary text-content-knockout'
                : 'text-content-subtle hover:text-content-default'
            }`}
          >
            Game
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-24">
        {filteredEvents.map(event => (
          <Card key={event.id} className="p-24">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              {/* Event Info */}
              <div className="flex-1">
                <div className="flex items-center mb-16">
                  <Icon 
                    name={getDecisionModeIcon(event.decisionMode)} 
                    style="solid" 
                    size="sm" 
                    className={`mr-12 ${getDecisionModeColor(event.decisionMode)}`} 
                  />
                  <h3 className="text-heading-4 text-content-default">
                    {event.title}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
                  <div className="flex items-center">
                    <Icon name="calendar" style="solid" size="sm" className="text-content-subtle mr-8" />
                    <span className="text-body-sm text-content-subtle">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </span>
                  </div>
                  {event.location && (
                    <div className="flex items-center">
                      <Icon name="map-marker-alt" style="solid" size="sm" className="text-content-subtle mr-8" />
                      <span className="text-body-sm text-content-subtle">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Icon name="exclamation-triangle" style="solid" size="sm" className="text-content-subtle mr-8" />
                    <span className="text-body-sm text-content-subtle">
                      {event.flakeCount} flake{event.flakeCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Result */}
                <div className="bg-background-subtle rounded-md p-16">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-body-sm text-content-subtle">Winner: </span>
                      <span className="text-body-sm font-medium text-content-default">{event.winner}</span>
                    </div>
                    <div>
                      <span className="text-body-sm text-content-subtle">Loser: </span>
                      <span className="text-body-sm font-medium text-content-default">{event.loser}</span>
                    </div>
                    <div>
                      <span className="text-body-sm text-content-subtle">Punishment: </span>
                      <span className="text-body-sm font-medium text-content-default">{event.punishment}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-16 md:mt-0 md:ml-24">
                <Link
                  to={`/event/${event.id}`}
                  className="inline-flex items-center px-16 py-8 bg-background-brand-brand-primary text-content-knockout rounded-full text-body-sm font-medium hover:bg-background-brand-brand-primary-hover transition-colors duration-200"
                >
                  <Icon name="eye" style="solid" size="sm" className="mr-8" />
                  View Details
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card className="text-center p-64">
          <Icon name="calendar-times" style="solid" size="2xl" className="text-content-subtle mb-24" />
          <h3 className="text-heading-4 text-content-default mb-16">
            No {filter === 'all' ? '' : filter} events found
          </h3>
          <p className="text-body-md text-content-subtle">
            {filter === 'all' 
              ? 'No past events yet. Create your first event to get started!'
              : `No past events with ${filter} decision mode. Try creating one!`
            }
          </p>
        </Card>
      )}
    </Section>
  );
};

export default PastEvents;
