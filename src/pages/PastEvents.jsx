import React, { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import Icon from '../components/Icon';

const PastEvents = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [pastEvents, setPastEvents] = useState([]);

  useEffect(() => {
    // Load past events from event service
    const events = eventService.getPastEvents();
    setPastEvents(events);
  }, []);

  const getDecisionModeIcon = (mode) => {
    switch (mode) {
      case 'vote': return 'vote-yea';
      case 'chance': return 'dice';
      case 'game': return 'gamepad';
      case 'none': return 'user';
      default: return 'question';
    }
  };

  const getDecisionModeLabel = (mode) => {
    switch (mode) {
      case 'vote': return 'Group Vote';
      case 'chance': return 'Random Chance';
      case 'game': return 'Mini Game';
      case 'none': return 'No Group Decision';
      default: return 'Unknown';
    }
  };

  const getEventStatus = (event) => {
    if (event.status === 'cancelled') {
      return { text: 'Cancelled', icon: 'times-circle', color: 'text-red-500', bgColor: 'bg-red-50' };
    }
    if (event.flakes && event.flakes.length > 0) {
      return { 
        text: `${event.flakes.length} flake${event.flakes.length > 1 ? 's' : ''}`, 
        icon: 'user-times', 
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      };
    }
    return { 
      text: 'No flakes!', 
      icon: 'user-check', 
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    };
  };

  const getFilteredEvents = () => {
    switch (activeTab) {
      case 'cancelled':
        return pastEvents.filter(event => event.status === 'cancelled');
      case 'flakes':
        return pastEvents.filter(event => event.flakes && event.flakes.length > 0);
      case 'no-flakes':
        return pastEvents.filter(event => event.status !== 'cancelled' && (!event.flakes || event.flakes.length === 0));
      default:
        return pastEvents;
    }
  };

  const tabs = [
    {
      id: 'all',
      label: 'All Past Events',
      icon: 'calendar-check',
      count: pastEvents.length
    },
    {
      id: 'cancelled',
      label: 'Events Cancelled',
      icon: 'times-circle',
      count: pastEvents.filter(event => event.status === 'cancelled').length
    },
    {
      id: 'flakes',
      label: 'Events with Flakes',
      icon: 'user-times',
      count: pastEvents.filter(event => event.flakes && event.flakes.length > 0).length
    },
    {
      id: 'no-flakes',
      label: 'Events with No Flakes',
      icon: 'user-check',
      count: pastEvents.filter(event => event.status !== 'cancelled' && (!event.flakes || event.flakes.length === 0)).length
    }
  ];

  const filteredEvents = getFilteredEvents();

  return (
    <div className="section">
      <div className="section-container">
        <div className="section-header">
          <h1 className="section-title">Past Events</h1>
          <p className="section-subtitle">
            See who flaked and what happened to them
          </p>
        </div>

        {/* Enhanced Tab Design */}
        <div className="mb-48">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-8 py-16 px-24 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon name={tab.icon} style="solid" size="sm" />
                  <span>{tab.label}</span>
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                    activeTab === tab.id
                      ? 'bg-pink-100 text-pink-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-32">
          {filteredEvents.map((event) => {
            const status = getEventStatus(event);
            return (
              <div key={event.id} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="space-y-24">
                  {/* Event Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="card-title mb-8">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.dateTime || event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-8">
                      <Icon name="users" style="solid" size="sm" className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {event.participants.length}
                      </span>
                    </div>
                  </div>

                  {/* Event Status */}
                  <div className={`flex items-center justify-between p-16 rounded-md ${status.bgColor}`}>
                    <div className="flex items-center space-x-8">
                      <Icon 
                        name={status.icon} 
                        style="solid" 
                        size="sm" 
                        className={status.color} 
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {status.text}
                      </span>
                    </div>
                    {event.status === 'cancelled' && (
                      <div className="text-sm text-red-600 font-medium">
                        Cancelled
                      </div>
                    )}
                  </div>

                  {/* Decision Method */}
                  <div className="flex items-center space-x-12">
                    <Icon 
                      name={getDecisionModeIcon(event.decisionMode)} 
                      style="solid" 
                      size="sm" 
                      className="text-pink-500" 
                    />
                    <span className="text-sm text-gray-600">
                      {getDecisionModeLabel(event.decisionMode)}
                    </span>
                  </div>

                  {/* Event Details */}
                  {event.status !== 'cancelled' && (
                    <div className="space-y-16">
                      {event.flakes && event.flakes.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-8">
                            Flakes:
                          </h4>
                          <div className="flex flex-wrap gap-8">
                            {event.flakes.map((flake, index) => (
                              <span
                                key={index}
                                className="px-12 py-4 bg-red-100 text-red-800 text-xs rounded-full font-medium"
                              >
                                {flake}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-8">
                          Punishment:
                        </h4>
                        <p className="text-sm text-gray-600">
                          {event.punishment}
                        </p>
                      </div>

                      {event.winner && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-8">
                            Winner (got to decide):
                          </h4>
                          <span className="px-12 py-4 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            {event.winner.name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Flakes Message */}
                  {event.status !== 'cancelled' && (!event.flakes || event.flakes.length === 0) && (
                    <div className="text-center py-24">
                      <Icon name="trophy" style="solid" size="lg" className="text-yellow-500 mx-auto mb-16" />
                      <p className="text-sm text-gray-600">
                        Everyone showed up! 🎉
                      </p>
                    </div>
                  )}

                  {/* Cancelled Message */}
                  {event.status === 'cancelled' && (
                    <div className="text-center py-24">
                      <Icon name="times-circle" style="solid" size="lg" className="text-red-500 mx-auto mb-16" />
                      <p className="text-sm text-gray-600">
                        Event was cancelled
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-64">
            <Icon name="calendar-times" style="solid" size="xl" className="text-gray-400 mx-auto mb-24" />
            <h3 className="text-xl font-semibold text-gray-900 mb-16">
              No events found
            </h3>
            <p className="text-gray-600">
              {activeTab === 'all' 
                ? "You haven't completed any events yet."
                : activeTab === 'cancelled'
                ? "No cancelled events found."
                : activeTab === 'flakes'
                ? "No events with flakes found."
                : "No events without flakes found."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastEvents;
