import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { FlowSelector } from '../components/logging/FlowSelector';
import { SymptomPicker } from '../components/logging/SymptomPicker';
import { useLogEntries } from '../hooks/data/useLogEntries';
import type { FlowIntensity, Symptom, Mood } from '../lib/types/cycle';

export const LogEntry: React.FC = () => {
  const { addEntry } = useLogEntries();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState<FlowIntensity | ''>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [mood, setMood] = useState<Mood | ''>('');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const moodOptions: { value: Mood; label: string; emoji: string }[] = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'energetic', label: 'Energetic', emoji: '⚡' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'tired', label: 'Tired', emoji: '😴' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'irritable', label: 'Irritable', emoji: '😤' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' }
  ];

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      addEntry({
        date: new Date(selectedDate),
        flow: flow || undefined,
        symptoms: selectedSymptoms,
        mood: mood || undefined,
        energyLevel,
        notes: notes.trim() || undefined
      });

      // Reset form
      setFlow('');
      setSelectedSymptoms([]);
      setMood('');
      setEnergyLevel(3);
      setNotes('');
      
      // Show success (in a real app, this would be a toast notification)
      alert('Entry logged successfully!');
    } catch (error) {
      console.error('Error logging entry:', error);
      alert('Error logging entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Log Entry</h1>
              <p className="text-text-secondary">Track your period, symptoms, and mood</p>
            </div>
            <Button variant="ghost" size="sm">
              View History
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="max-w-xs"
              />
            </CardContent>
          </Card>

          {/* Flow Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Intensity</CardTitle>
            </CardHeader>
            <CardContent>
              <FlowSelector value={flow} onChange={setFlow} />
            </CardContent>
          </Card>

          {/* Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <SymptomPicker selectedSymptoms={selectedSymptoms} onChange={setSelectedSymptoms} />
            </CardContent>
          </Card>

          {/* Mood */}
          <Card>
            <CardHeader>
              <CardTitle>Mood</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(mood === option.value ? '' : option.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      mood === option.value
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-border-primary bg-bg-tertiary hover:border-border-secondary'
                    }`}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-xs text-text-secondary">{option.label}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Energy Level */}
          <Card>
            <CardHeader>
              <CardTitle>Energy Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Low</span>
                  <span className="text-text-secondary">High</span>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setEnergyLevel(level)}
                      className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                        energyLevel >= level
                          ? 'border-accent-primary bg-accent-primary'
                          : 'border-border-primary bg-bg-tertiary hover:border-border-secondary'
                      }`}
                    >
                      <span className="text-sm font-medium text-text-primary">{level}</span>
                    </button>
                  ))}
                </div>
                <div className="text-center text-text-secondary text-sm">
                  Current: {energyLevel}/5
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional notes about how you're feeling today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex space-x-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="flex-1"
            >
              Save Entry
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                setFlow('medium');
                setSelectedSymptoms(['cramps']);
                setMood('tired');
                setEnergyLevel(2);
                setNotes('Period started today');
              }}
            >
              Quick: Period Started
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
