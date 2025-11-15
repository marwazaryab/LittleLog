import React from 'react';
import Timeline from '../components/Timeline';
import '../styles/Timeline.css';

const TimelinePage = () => {
  return (
    <div className="timeline-page">
      <div className="timeline-page-header">
        <h1 className="timeline-page-title">Health Timeline</h1>
        <p className="timeline-page-subtitle">
          Chronological record of your child's health observations
        </p>
      </div>
      <Timeline />
    </div>
  );
};

export default TimelinePage;

