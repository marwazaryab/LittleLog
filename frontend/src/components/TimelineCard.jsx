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
    return dateString; // Date is already formatted in the data
  };

  return (
    <div className="timeline-card" style={{ '--border-color': borderColor }}>
      <div className="timeline-card-content">
        <div className="timeline-card-header">
          {isEditing ? (
            <input
              type="text"
              value={editedEvent.title}
              onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
              className="timeline-card-edit-input"
            />
          ) : (
            <h3 className="timeline-card-title">{event.title}</h3>
          )}
          <div className="timeline-card-actions">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="timeline-card-btn timeline-card-btn-save">
                  Save
                </button>
                <button onClick={handleCancel} className="timeline-card-btn timeline-card-btn-cancel">
                  Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="timeline-card-btn timeline-card-btn-edit">
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="timeline-card-date">{formatDate(event.date)}</div>

        {isEditing ? (
          <textarea
            value={editedEvent.description}
            onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
            className="timeline-card-edit-textarea"
            rows="3"
          />
        ) : (
          <p className="timeline-card-description">{event.description}</p>
        )}

        <div className="timeline-card-tags">
          {isEditing ? (
            <input
              type="text"
              value={editedEvent.tags.join(', ')}
              onChange={(e) => setEditedEvent({ ...editedEvent, tags: e.target.value.split(',').map(t => t.trim()) })}
              className="timeline-card-edit-input"
              placeholder="Tags (comma separated)"
            />
          ) : (
            event.tags.map((tag, index) => (
              <span key={index} className="timeline-card-tag">{tag}</span>
            ))
          )}
        </div>

        <div className="timeline-card-severity">
          {isEditing ? (
            <select
              value={editedEvent.severity}
              onChange={(e) => setEditedEvent({ ...editedEvent, severity: e.target.value })}
              className="timeline-card-edit-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : (
            <span className="timeline-card-severity-badge">{event.severity}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineCard;

