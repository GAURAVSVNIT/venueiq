import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInAnonymously: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false)),
  logEvent: vi.fn(),
}));

vi.mock('../lib/firebase', () => ({
  auth: {},
  db: {},
  analytics: null
}));

describe('Dashboard component', () => {
  it('renders dashboard with sidebar and main content', () => {
    render(<Dashboard />);
    // Check if sidebar navigation exists
    expect(screen.getByRole('navigation', { name: /Main Navigation/i })).toBeDefined();
    
    // Check if main content exists
    expect(screen.getByRole('main')).toBeDefined();
    
    // Check for specific tabs in sidebar
    expect(screen.getByTitle(/Dashboard/i)).toBeDefined();
    expect(screen.getByTitle(/Map Analytics/i)).toBeDefined();
    expect(screen.getByTitle(/Live Cameras/i)).toBeDefined();
  });

  it('switches tabs correctly', () => {
    render(<Dashboard />);
    const mapTab = screen.getByTitle(/Map Analytics/i);
    
    // Click map tab
    fireEvent.click(mapTab);
    
    // In our implementation, the active class should be added
    expect(mapTab.classList.contains('active')).toBe(true);
    
    // "Live Zone Analytics" should now be rendered (part of Map tab)
    expect(screen.getByText(/Live Zone Analytics/i)).toBeDefined();
  });
});
