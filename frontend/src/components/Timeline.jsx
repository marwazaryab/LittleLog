import React from 'react';
import { useTimeline } from '../context/TimelineContext';
import TimelineCard from './TimelineCard';
import '../styles/Timeline.css';

const Timeline = () => {
  const { timelineEvents } = useTimeline();

  return (
    <div className="timeline-container">
      <div className="timeline-line"></div>
      <div className="timeline-events">
        {timelineEvents.map((event, index) => (
          <div key={event.id} className="timeline-event-wrapper">
            <TimelineCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

