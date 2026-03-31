import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SymptomTracker.css';

const MOCK_SYMPTOMS_LIST = [
    'Morning Sickness', 'Nausea', 'Vomiting', 'Headache', 'Back Pain',
    'Fatigue', 'Swelling (feet/ hands)', 'Heartburn', 'Dizziness', 'Mood changes'
];

const MOODS_LIST = ['Happy', 'Sad', 'Angry', 'Scared', 'Excited', 'Tired', 'Other'];

const SymptomTracker = ({ profile }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Mood State
    const [selectedMoods, setSelectedMoods] = useState([]);
    const [moodNotes, setMoodNotes] = useState('');

    // Symptoms State
    const [symptoms, setSymptoms] = useState(
        MOCK_SYMPTOMS_LIST.map(name => ({
            name, checked: false, severity: '', timeAM: false, timePM: false
        })).concat({ name: 'Other', checked: false, text: '', severity: '', timeAM: false, timePM: false })
    );

    // Logs State
    const [showLogs, setShowLogs] = useState(false);
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const toggleMood = (mood) => {
        setSelectedMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]);
    };

    const updateSymptom = (index, field, value) => {
        const newSymptoms = [...symptoms];
        newSymptoms[index][field] = value;
        setSymptoms(newSymptoms);
    };

    const fetchLogs = async () => {
        if (!profile?.id) return;
        setLoadingLogs(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/mother/symptoms/${profile.id}`);
            setLogs(res.data);
            setShowLogs(true);
        } catch (error) {
            console.error("Error fetching logs:", error);
            alert("Failed to load logs.");
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Build payload mapped to backend (symptoms, severity, notes)
        const activeSymptoms = symptoms.filter(s => s.checked);
        
        let symptomsString = activeSymptoms.map(s => {
            const name = s.name === 'Other' ? `Other (${s.text})` : s.name;
            const time = [s.timeAM ? 'AM' : null, s.timePM ? 'PM' : null].filter(Boolean).join(', ');
            return `${name}${s.severity ? ` - ${s.severity}` : ''}${time ? ` [${time}]` : ''}`;
        }).join(' | ');

        if (!symptomsString) symptomsString = "No specific symptoms reported";

        // Calculate overarching severity (if any is Severe, then Severe, else Moderate, else Mild)
        let overallSeverity = 'Mild';
        if (activeSymptoms.some(s => s.severity === 'Severe')) overallSeverity = 'Severe';
        else if (activeSymptoms.some(s => s.severity === 'Moderate')) overallSeverity = 'Moderate';

        const notesString = `Date: ${date}\nMood: ${selectedMoods.join(', ')}\nNotes: ${moodNotes}`;

        const payload = {
            mother: { id: profile?.id },
            symptoms: symptomsString,
            severity: overallSeverity,
            notes: notesString
        };

        try {
            await axios.post('http://localhost:8080/api/mother/symptoms', payload);
            setSubmitSuccess(true);
            setTimeout(() => setSubmitSuccess(false), 3000);
            
            // Reset form
            setDate(new Date().toISOString().split('T')[0]);
            setSelectedMoods([]);
            setMoodNotes('');
            setSymptoms(symptoms.map(s => ({ ...s, checked: false, severity: '', timeAM: false, timePM: false, text: '' })));
            
            if (showLogs) fetchLogs(); // Auto refresh if logs open
        } catch (error) {
            console.error("Error submitting symptoms:", error);
            alert("Failed to submit symptoms. Please try again.");
        }
    };

    return (
        <div className="symptom-tracker-container">
            <div className="tracker-header">
                <h2 className="page-title">Mood and Symptom Tracker</h2>
                <button 
                    className="btn-clinical btn-outline"
                    onClick={() => {
                        if (!showLogs) fetchLogs();
                        else setShowLogs(false);
                    }}
                >
                    {loadingLogs ? 'Loading...' : showLogs ? 'Hide Symptom Log' : 'View Symptom Log'}
                </button>
            </div>

            {submitSuccess && (
                <div className="success-banner">
                    Log submitted successfully!
                </div>
            )}

            {showLogs && (
                <div className="logs-panel dashboard-panel">
                    <h3>Your Symptom Log</h3>
                    {logs.length === 0 ? (
                        <p className="no-logs">No previous logs found.</p>
                    ) : (
                        <div className="logs-list">
                            {logs.map((log) => (
                                <div key={log.id} className="log-card">
                                    <div className="log-header">
                                        <span className="log-date">{new Date(log.submittedAt).toLocaleString()}</span>
                                        <span className={`log-severity badge-${log.severity.toLowerCase()}`}>{log.severity}</span>
                                    </div>
                                    <div className="log-body">
                                        <div className="log-section">
                                            <strong>Symptoms:</strong>
                                            <p>{log.symptoms}</p>
                                        </div>
                                        {log.notes && (
                                            <div className="log-section">
                                                <strong>Details:</strong>
                                                <pre className="log-notes-text">{log.notes}</pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="tracker-form">
                
                {/* Mood Tracker Card */}
                <div className="dashboard-panel">
                    <h3>Mood Tracker</h3>
                    <div className="form-group date-group">
                        <label>Date</label>
                        <input 
                            type="date" 
                            className="clinical-input" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>How are you feeling today?</label>
                        <div className="moods-grid">
                            {MOODS_LIST.map(mood => (
                                <label key={mood} className={`mood-chip ${selectedMoods.includes(mood) ? 'selected' : ''}`}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedMoods.includes(mood)}
                                        onChange={() => toggleMood(mood)}
                                        className="hidden-checkbox"
                                    />
                                    {mood}
                                </label>
                            ))}
                        </div>
                        <textarea 
                            className="clinical-input mt-3" 
                            placeholder="How do you feel? (Additional notes)"
                            value={moodNotes}
                            onChange={(e) => setMoodNotes(e.target.value)}
                            rows="2"
                        />
                    </div>
                </div>

                {/* Symptoms Card */}
                <div className="dashboard-panel">
                    <h3>Physical Symptoms</h3>
                    <p className="subtext">Select all symptoms that apply and indicate their severity and time of day.</p>
                    
                    <div className="symptoms-list">
                        {symptoms.map((symptom, index) => (
                            <div key={index} className={`symptom-row ${symptom.checked ? 'active-row' : ''}`}>
                                <div className="symptom-primary">
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={symptom.checked}
                                            onChange={(e) => updateSymptom(index, 'checked', e.target.checked)}
                                        />
                                        <span className="symptom-name">{symptom.name}</span>
                                    </label>
                                    
                                    {symptom.name === 'Other' && symptom.checked && (
                                        <input 
                                            type="text" 
                                            className="clinical-input small-input ml-2" 
                                            placeholder="Specify symptom..."
                                            value={symptom.text}
                                            onChange={(e) => updateSymptom(index, 'text', e.target.value)}
                                        />
                                    )}
                                </div>

                                {symptom.checked && (
                                    <div className="symptom-details">
                                        <div className="severity-selector">
                                            {['Mild', 'Moderate', 'Severe'].map(sev => (
                                                <label key={sev} className="radio-label">
                                                    <input 
                                                        type="radio" 
                                                        name={`severity-${index}`}
                                                        value={sev}
                                                        checked={symptom.severity === sev}
                                                        onChange={(e) => updateSymptom(index, 'severity', e.target.value)}
                                                        required={symptom.checked}
                                                    />
                                                    {sev}
                                                </label>
                                            ))}
                                        </div>
                                        
                                        <div className="time-selector">
                                            <label className="checkbox-label inline-check">
                                                <input 
                                                    type="checkbox" 
                                                    checked={symptom.timeAM}
                                                    onChange={(e) => updateSymptom(index, 'timeAM', e.target.checked)}
                                                />
                                                AM
                                            </label>
                                            <label className="checkbox-label inline-check">
                                                <input 
                                                    type="checkbox" 
                                                    checked={symptom.timePM}
                                                    onChange={(e) => updateSymptom(index, 'timePM', e.target.checked)}
                                                />
                                                PM
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-clinical btn-large">
                        Submit Symptom Log
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SymptomTracker;
