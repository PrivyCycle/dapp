import React from 'react';
import type { LogEntry, CyclePhase } from '../../lib/types/cycle';

interface CalendarProps {
  entries: LogEntry[];
  currentCycle?: {
    startDate: Date;
    phase: CyclePhase;
    dayOfCycle: number;
    cycleLength: number;
  } | null;
  onDateClick?: (date: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  hasEntry: boolean;
  entry?: LogEntry;
  cycleDay?: number;
  phase?: CyclePhase;
}

const getPhaseColor = (phase: CyclePhase): string => {
  const colors = {
    menstrual: 'bg-error/20 border-error/40',
    follicular: 'bg-accent/20 border-accent/40', 
    ovulation: 'bg-success/20 border-success/40',
    luteal: 'bg-warning/20 border-warning/40'
  };
  return colors[phase];
};

const getPhaseForDay = (cycleDay: number): CyclePhase => {
  if (cycleDay <= 5) return 'menstrual';
  if (cycleDay <= 13) return 'follicular';
  if (cycleDay <= 16) return 'ovulation';
  return 'luteal';
};

export const Calendar: React.FC<CalendarProps> = ({ 
  entries, 
  currentCycle, 
  onDateClick 
}) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get first day of month and calculate calendar grid
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Create calendar days array
  const calendarDays: CalendarDay[] = [];

  // Add previous month's trailing days
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i);
    const entry = entries.find(e => 
      e.date.toDateString() === date.toDateString()
    );
    
    calendarDays.push({
      date,
      isCurrentMonth: false,
      hasEntry: !!entry,
      entry
    });
  }

  // Add current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const entry = entries.find(e => 
      e.date.toDateString() === date.toDateString()
    );

    let cycleDay: number | undefined;
    let phase: CyclePhase | undefined;

    if (currentCycle) {
      const daysDiff = Math.floor((date.getTime() - currentCycle.startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < currentCycle.cycleLength) {
        cycleDay = daysDiff + 1;
        phase = getPhaseForDay(cycleDay);
      }
    }

    calendarDays.push({
      date,
      isCurrentMonth: true,
      hasEntry: !!entry,
      entry,
      cycleDay,
      phase
    });
  }

  // Add next month's leading days to complete the grid
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(currentYear, currentMonth + 1, day);
    const entry = entries.find(e => 
      e.date.toDateString() === date.toDateString()
    );

    calendarDays.push({
      date,
      isCurrentMonth: false,
      hasEntry: !!entry,
      entry
    });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-bg-secondary rounded-xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-text-primary">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-error/20 border border-error/40 rounded"></div>
            <span className="text-text-secondary">Menstrual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent/20 border border-accent/40 rounded"></div>
            <span className="text-text-secondary">Follicular</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success/20 border border-success/40 rounded"></div>
            <span className="text-text-secondary">Ovulation</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning/20 border border-warning/40 rounded"></div>
            <span className="text-text-secondary">Luteal</span>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-text-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const isToday = day.date.toDateString() === today.toDateString();
          const phaseColor = day.phase ? getPhaseColor(day.phase) : '';
          
          return (
            <div
              key={index}
              className={`
                relative h-12 flex items-center justify-center text-sm cursor-pointer
                transition-all duration-200 rounded-lg border
                ${day.isCurrentMonth 
                  ? 'text-text-primary hover:bg-bg-tertiary' 
                  : 'text-text-muted'
                }
                ${isToday 
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-secondary' 
                  : ''
                }
                ${day.phase && day.isCurrentMonth
                  ? phaseColor
                  : 'border-transparent hover:border-border-primary'
                }
              `}
              onClick={() => onDateClick?.(day.date)}
            >
              <span className="relative z-10">
                {day.date.getDate()}
              </span>
              
              {/* Cycle Day Indicator */}
              {day.cycleDay && day.isCurrentMonth && (
                <span className="absolute top-1 right-1 text-xs font-medium text-primary">
                  {day.cycleDay}
                </span>
              )}
              
              {/* Entry Indicator */}
              {day.hasEntry && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className={`w-2 h-2 rounded-full ${
                    day.entry?.flow 
                      ? 'bg-primary' 
                      : 'bg-secondary'
                  }`}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border-primary">
        <div className="flex items-center justify-center space-x-6 text-xs text-text-secondary">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Period logged</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span>Symptoms logged</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-primary rounded-full"></div>
            </div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
