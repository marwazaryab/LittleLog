import React, { useState, useEffect } from 'react';
import { useTimeline } from '../context/TimelineContext';
import '../styles/Profile.css';

const Profile = () => {
  const { events } = useTimeline();
  const [isEditingChild, setIsEditingChild] = useState(false);
  
  // Load saved profile data from localStorage
  const [parentData, setParentData] = useState(() => {
    const saved = localStorage.getItem('parentProfile');
    return saved ? JSON.parse(saved) : {
      email: 'elyssaqi@gmail.com',
    };
  });

  const [childData, setChildData] = useState(() => {
    const saved = localStorage.getItem('childProfile');
    return saved ? JSON.parse(saved) : {
      name: 'Your Child',
      dateOfBirth: '2023-01-15',
      doctorName: '',
      doctorPhone: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      allergies: '',
      medications: '',
      bloodType: '',
      insurance: '',
    };
  });

  const [editedChildData, setEditedChildData] = useState(childData);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('parentProfile', JSON.stringify(parentData));
  }, [parentData]);

  useEffect(() => {
    localStorage.setItem('childProfile', JSON.stringify(childData));
  }, [childData]);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} month${months !== 1 ? 's' : ''} old`;
    } else if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''} old`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} old`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleEditChild = () => {
    setEditedChildData(childData);
    setIsEditingChild(true);
  };

  const handleSaveChild = () => {
    setChildData(editedChildData);
    setIsEditingChild(false);
  };

  const handleCancelEdit = () => {
    setEditedChildData(childData);
    setIsEditingChild(false);
  };

  const handleInputChange = (field, value) => {
    setEditedChildData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">Profile</h1>
        <p className="profile-subtitle">Manage your account and child information</p>
      </div>

      {/* Parent Account Section */}
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-icon parent-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="profile-card-info">
            <h2 className="profile-card-title">Parent Account</h2>
            <p className="profile-card-email">{parentData.email}</p>
          </div>
        </div>
        <button className="profile-btn profile-btn-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M12 1v6m0 6v6m6-12v6m0 6v6M6 1v6m0 6v6"></path>
            <line x1="2.05" y1="12" x2="22" y2="12"></line>
          </svg>
          Account Settings
        </button>
      </div>

      {/* Child Profile Section */}
      <div className="profile-card">
        <div className="profile-card-header">
          <div className="profile-icon child-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4"></circle>
              <path d="M12 12c-4 0-7 2-7 5v3h14v-3c0-3-3-5-7-5z"></path>
              <path d="M9 8c0-1.5.5-3 1.5-3.5M15 8c0-1.5-.5-3-1.5-3.5"></path>
            </svg>
          </div>
          <div className="profile-card-info">
            <h2 className="profile-card-title">Child Profile</h2>
            <p className="profile-card-age">Age: {calculateAge(childData.dateOfBirth)}</p>
          </div>
        </div>

        {!isEditingChild ? (
          <>
            {/* View Mode */}
            <div className="profile-details">
              <div className="profile-detail-row">
                <span className="profile-detail-label">Name</span>
                <span className="profile-detail-value">{childData.name}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Date of Birth</span>
                <span className="profile-detail-value">{formatDate(childData.dateOfBirth)}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Blood Type</span>
                <span className="profile-detail-value">{childData.bloodType || 'Not specified'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Insurance</span>
                <span className="profile-detail-value">{childData.insurance || 'Not specified'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Doctor Name</span>
                <span className="profile-detail-value">{childData.doctorName || 'Not specified'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Doctor Phone</span>
                <span className="profile-detail-value">{childData.doctorPhone || 'Not specified'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Emergency Contact</span>
                <span className="profile-detail-value">{childData.emergencyContactName || 'Not specified'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Emergency Phone</span>
                <span className="profile-detail-value">{childData.emergencyContactPhone || 'Not specified'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Allergies</span>
                <span className="profile-detail-value">{childData.allergies || 'None reported'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Current Medications</span>
                <span className="profile-detail-value">{childData.medications || 'None'}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-label">Total Entries</span>
                <span className="profile-detail-value">{events.length}</span>
              </div>
            </div>
            <button className="profile-btn profile-btn-primary" onClick={handleEditChild}>
              Edit Child Information
            </button>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <div className="profile-edit-form">
              <div className="profile-form-group">
                <label className="profile-form-label">Name</label>
                <input
                  type="text"
                  className="profile-form-input"
                  value={editedChildData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Child's name"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">Date of Birth</label>
                <input
                  type="date"
                  className="profile-form-input"
                  value={editedChildData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">Blood Type</label>
                <select
                  className="profile-form-input"
                  value={editedChildData.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                >
                  <option value="">Select blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">Insurance Provider</label>
                <input
                  type="text"
                  className="profile-form-input"
                  value={editedChildData.insurance}
                  onChange={(e) => handleInputChange('insurance', e.target.value)}
                  placeholder="Insurance provider name"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">Doctor Name</label>
                <input
                  type="text"
                  className="profile-form-input"
                  value={editedChildData.doctorName}
                  onChange={(e) => handleInputChange('doctorName', e.target.value)}
                  placeholder="Dr. John Smith"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">Doctor Phone</label>
                <input
                  type="tel"
                  className="profile-form-input"
                  value={editedChildData.doctorPhone}
                  onChange={(e) => handleInputChange('doctorPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">Emergency Contact Name</label>
                <input
                  type="text"
                  className="profile-form-input"
                  value={editedChildData.emergencyContactName}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  placeholder="Contact person name"
                />
              </div>
              <div className="profile-form-group">
                <label className="profile-form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  className="profile-form-input"
                  value={editedChildData.emergencyContactPhone}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  placeholder="(555) 987-6543"
                />
              </div>
              <div className="profile-form-group full-width">
                <label className="profile-form-label">Allergies</label>
                <textarea
                  className="profile-form-textarea"
                  value={editedChildData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="List any known allergies"
                  rows="2"
                />
              </div>
              <div className="profile-form-group full-width">
                <label className="profile-form-label">Current Medications</label>
                <textarea
                  className="profile-form-textarea"
                  value={editedChildData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  placeholder="List current medications"
                  rows="2"
                />
              </div>
            </div>
            <div className="profile-btn-group">
              <button className="profile-btn profile-btn-primary" onClick={handleSaveChild}>
                Save Changes
              </button>
              <button className="profile-btn profile-btn-cancel" onClick={handleCancelEdit}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;

