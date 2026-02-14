import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface CursorPosition {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  section?: string;
  lastActive: Date;
}

const CURSOR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'
];

// Simulated team members for demo
const DEMO_MEMBERS = [
  { id: 'member-1', name: 'Sarah Chen' },
  { id: 'member-2', name: 'Mike Johnson' },
  { id: 'member-3', name: 'Emily Davis' },
];

interface LiveCursorsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  sectionIds: string[];
  isEnabled?: boolean;
}

export function LiveCursors({ containerRef, sectionIds, isEnabled = true }: LiveCursorsProps) {
  const { user } = useAuth();
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [activeCollaborators, setActiveCollaborators] = useState<string[]>([]);

  // Simulate random cursor movements from team members
  useEffect(() => {
    if (!isEnabled || !containerRef.current) return;

    // Randomly add/remove collaborators
    const collaboratorInterval = setInterval(() => {
      setActiveCollaborators(prev => {
        const shouldAdd = Math.random() > 0.5 && prev.length < 2;
        const shouldRemove = Math.random() > 0.7 && prev.length > 0;

        if (shouldAdd) {
          const available = DEMO_MEMBERS.filter(m => !prev.includes(m.id));
          if (available.length > 0) {
            const random = available[Math.floor(Math.random() * available.length)];
            return [...prev, random.id];
          }
        }

        if (shouldRemove) {
          return prev.slice(0, -1);
        }

        return prev;
      });
    }, 5000);

    return () => clearInterval(collaboratorInterval);
  }, [isEnabled, containerRef]);

  // Move cursors periodically
  useEffect(() => {
    if (!isEnabled || !containerRef.current || activeCollaborators.length === 0) return;

    const moveCursors = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      
      setCursors(activeCollaborators.map((memberId, index) => {
        const member = DEMO_MEMBERS.find(m => m.id === memberId);
        const randomSection = sectionIds[Math.floor(Math.random() * sectionIds.length)];
        
        return {
          id: memberId,
          name: member?.name || 'Unknown',
          color: CURSOR_COLORS[index % CURSOR_COLORS.length],
          x: Math.random() * (rect.width - 100) + 50,
          y: Math.random() * (rect.height - 100) + 50,
          section: randomSection,
          lastActive: new Date(),
        };
      }));
    };

    moveCursors();
    const interval = setInterval(moveCursors, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, [isEnabled, containerRef, activeCollaborators, sectionIds]);

  if (!isEnabled || cursors.length === 0) return null;

  return (
    <>
      {/* Cursor indicators */}
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute pointer-events-none z-50 transition-all duration-500 ease-out"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor arrow */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: cursor.color }}
          >
            <path
              d="M5.65376 12.4563L10.7094 16.8259C11.3154 17.3653 12.2618 16.9398 12.2618 16.1307V11.1848L16.3445 11.1848C17.1525 11.1848 17.5781 10.2379 17.0386 9.63187L12.6698 4.57542C12.2692 4.12498 11.572 4.12498 11.1714 4.57542L6.80261 9.63187C6.26312 10.2379 6.68875 11.1848 7.49672 11.1848L11.5794 11.1848V16.1307"
              fill="currentColor"
              transform="rotate(-45 12 12)"
            />
          </svg>
          
          {/* Name badge */}
          <Badge
            className="absolute left-5 top-5 whitespace-nowrap text-xs px-2 py-0.5 shadow-lg"
            style={{ 
              backgroundColor: cursor.color,
              color: 'white',
              borderColor: cursor.color,
            }}
          >
            {cursor.name}
          </Badge>
        </div>
      ))}

      {/* Active collaborators indicator */}
      <div className="absolute top-4 right-4 z-40">
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg">
          <div className="flex -space-x-2">
            {cursors.map((cursor, i) => (
              <div
                key={cursor.id}
                className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-xs font-medium text-white"
                style={{ 
                  backgroundColor: cursor.color,
                  zIndex: cursors.length - i,
                }}
                title={cursor.name}
              >
                {cursor.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {cursors.length} editing
          </span>
        </div>
      </div>
    </>
  );
}
