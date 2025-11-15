import React, { createContext, useContext, useState } from 'react';

const TimelineContext = createContext();

export const useTimeline = () => useContext(TimelineContext);

export const TimelineProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  const addEvent = (event) => {
    setEvents((prev) => [...prev, event].sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const updateEvent = (id, updatedEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? updatedEvent : e)));
  };

  return (
    <TimelineContext.Provider value={{ events, addEvent, updateEvent }}>
      {children}
    </TimelineContext.Provider>
  );
};
