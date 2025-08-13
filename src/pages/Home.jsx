import React from 'react';
import { Link } from 'react-router-dom';
import Section from '../components/Section';
import Card from '../components/Card';
import Icon from '../components/Icon';

const Home = () => {
  // Mock data for active event
  const activeEvent = {
    id: 'abc123',
    title: 'Friday Night Dinner',
    date: '2024-01-20',
    time: '19:00',
    participants: 4
  };

  return (
    <Section>
      <div className="text-center mb-64">
        <h1 className="text-heading-1 text-content-default mb-16">
          Anti-Flake
        </h1>
        <p className="text-body-lg text-content-subtle">
          Never get flaked on again! Create events and let fate decide the punishment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-32">
        {/* Create Event Card */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <Link to="/create" className="block">
            <div className="text-center">
              <div className="w-64 h-64 bg-background-brand-brand-primary rounded-full flex items-center justify-center mx-auto mb-24">
                <Icon name="plus" style="solid" size="xl" className="text-content-knockout" />
              </div>
              <h3 className="text-heading-4 text-content-default mb-16">
                Create Event
              </h3>
              <p className="text-body-md text-content-subtle mb-24">
                Set up a new event and choose how to decide who gets punished.
              </p>
              <div className="inline-flex items-center text-background-brand-brand-primary font-medium">
                Get Started
                <Icon name="arrow-right" style="solid" size="sm" className="ml-8" />
              </div>
            </div>
          </Link>
        </Card>

        {/* View/Join Event Card */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          {activeEvent ? (
            <Link to={`/event/${activeEvent.id}`} className="block">
              <div className="text-center">
                <div className="w-64 h-64 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-24">
                  <Icon name="calendar-check" style="solid" size="xl" className="text-content-knockout" />
                </div>
                <h3 className="text-heading-4 text-content-default mb-16">
                  Active Event
                </h3>
                <p className="text-body-md text-content-subtle mb-16">
                  {activeEvent.title}
                </p>
                <div className="flex items-center justify-center space-x-16 text-body-sm text-content-subtle mb-24">
                  <span className="flex items-center">
                    <Icon name="calendar" style="solid" size="sm" className="mr-4" />
                    {new Date(activeEvent.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Icon name="users" style="solid" size="sm" className="mr-4" />
                    {activeEvent.participants} participants
                  </span>
                </div>
                <div className="inline-flex items-center text-green-600 font-medium">
                  Join Event
                  <Icon name="arrow-right" style="solid" size="sm" className="ml-8" />
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-center">
              <div className="w-64 h-64 bg-background-subtle rounded-full flex items-center justify-center mx-auto mb-24">
                <Icon name="calendar-times" style="solid" size="xl" className="text-content-subtle" />
              </div>
              <h3 className="text-heading-4 text-content-default mb-16">
                No Active Event
              </h3>
              <p className="text-body-md text-content-subtle mb-24">
                Create an event or join one with an invite link.
              </p>
              <div className="inline-flex items-center text-content-subtle font-medium">
                Create One
                <Icon name="arrow-right" style="solid" size="sm" className="ml-8" />
              </div>
            </div>
          )}
        </Card>

        {/* Past Events Card */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <Link to="/past" className="block">
            <div className="text-center">
              <div className="w-64 h-64 bg-background-brand-brand-primary rounded-full flex items-center justify-center mx-auto mb-24">
                <Icon name="history" style="solid" size="xl" className="text-content-knockout" />
              </div>
              <h3 className="text-heading-4 text-content-default mb-16">
                Past Events
              </h3>
              <p className="text-body-md text-content-subtle mb-24">
                See who got punished and track the flake count over time.
              </p>
              <div className="inline-flex items-center text-background-brand-brand-primary font-medium">
                View History
                <Icon name="arrow-right" style="solid" size="sm" className="ml-8" />
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </Section>
  );
};

export default Home;
