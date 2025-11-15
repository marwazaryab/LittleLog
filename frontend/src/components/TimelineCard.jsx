import React, { useState } from 'react';
import { useTimeline } from '../context/TimelineContext';
import { severityColours } from '../utils/severityColours';
import '../styles/Timeline.css';

const TimelineCard = ({ event }) => {
  const { updateEvent } = useTimeline();
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(event);

  const borderColor = severityColours[event.severity] || severityColours.low;

  const handleSave = () => {
    updateEvent(event.id, editedEvent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEvent(event);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateString;
    }
  };

  if (isEditing) {
    return (
      <div className="timeline-card timeline-card-editing" style={{ '--border-color': borderColor }}>
        <div className="timeline-card-content">
          <div className="timeline-card-edit-header">
            <input
              type="text"
              value={editedEvent.title}
              onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
              className="timeline-card-edit-input timeline-card-edit-title"
              placeholder="Event title"
            />
            <div className="timeline-card-edit-actions">
              <button onClick={handleSave} className="timeline-card-btn timeline-card-btn-save">
                Save
              </button>
              <button onClick={handleCancel} className="timeline-card-btn timeline-card-btn-cancel">
                Cancel
              </button>
            </div>
          </div>

          <div className="timeline-card-date">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {formatDate(event.date)}
          </div>

          <textarea
            value={editedEvent.description}
            onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
            className="timeline-card-edit-textarea"
            rows="3"
            placeholder="Description"
          />

          <input
            type="text"
            value={editedEvent.tags.join(', ')}
            onChange={(e) => setEditedEvent({ ...editedEvent, tags: e.target.value.split(',').map(t => t.trim()) })}
            className="timeline-card-edit-input"
            placeholder="Tags (comma separated)"
          />

          <div className="timeline-card-severity-edit">
            <label>Severity:</label>
            <select
              value={editedEvent.severity}
              onChange={(e) => setEditedEvent({ ...editedEvent, severity: e.target.value })}
              className="timeline-card-edit-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-card" style={{ '--border-color': borderColor }}>
      <div className="timeline-card-content">
        <div className="timeline-card-header">
          <h3 className="timeline-card-title">{event.title}</h3>
          <div className="timeline-card-header-right">
            <span className="timeline-card-severity-badge">{event.severity}</span>
            <button onClick={() => setIsEditing(true)} className="timeline-card-btn timeline-card-btn-edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="timeline-card-date">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {formatDate(event.date)}
        </div>

        <p className="timeline-card-description">{event.description}</p>

        <div className="timeline-card-tags">
          {event.tags.map((tag, index) => (
            <span key={index} className="timeline-card-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;

