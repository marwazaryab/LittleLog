import React, { createContext, useContext, useState } from 'react';

const TimelineContext = createContext();

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};

export const TimelineProvider = ({ children }) => {
  // Sample data matching the image - in production this would come from API/database
  const [timelineEvents, setTimelineEvents] = useState([
    {
      id: 1,
      title: 'Mild Fever',
      date: 'January 14, 2025',
      description: 'Temperature slightly elevated at 100.2°F. Child is active and eating normally. Monitoring closely.',
      tags: ['Fever', 'Slight fussiness'],
      severity: 'low'
    },
    {
      id: 2,
      title: 'Persistent Cough',
      date: 'January 12, 2025',
      description: 'Dry cough continuing for 3 days. No fever. Pediatrician recommended fluids and rest.',
      tags: ['Cough', 'Throat irritation'],
      severity: 'medium'
    },
    {
      id: 3,
      title: 'Rash on Arms',
      date: 'January 8, 2025',
      description: 'Small red bumps appeared on both arms. No itching or discomfort. Watching for changes.',
      tags: ['Rash', 'Mild redness'],
      severity: 'low'
    }
  ]);

  const updateEvent = (id, updatedEvent) => {
    setTimelineEvents(prevEvents =>
      prevEvents.map(event => event.id === id ? { ...event, ...updatedEvent } : event)
    );
  };

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now(), // Simple ID generation - in production use proper ID
    };
    setTimelineEvents(prevEvents => [newEvent, ...prevEvents]);
  };

  const deleteEvent = (id) => {
    setTimelineEvents(prevEvents => prevEvents.filter(event => event.id !== id));
  };

  return (
    <TimelineContext.Provider value={{
      timelineEvents,
      updateEvent,
      addEvent,
      deleteEvent
    }}>
      {children}
    </TimelineContext.Provider>
  );
};

