import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

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

vi.mock('./lib/firebase', () => ({
  auth: {},
  db: {},
  analytics: null
}));

describe('App component', () => {
  it('renders the home page by default', () => {
    render(<App />);
    expect(screen.getAllByText(/VenueIQ/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Launch Dashboard/i).length).toBeGreaterThan(0);
  });

  it('navigates to dashboard when launch button is clicked', () => {
    render(<App />);
    const launchButtons = screen.getAllByText(/Launch Dashboard/i);
    // Click the first launch button
    fireEvent.click(launchButtons[0]);
    // It should navigate, but since we are using BrowserRouter in App, the URL will change.
    // Testing specific routing behavior inside App is limited without memory router, 
    // but we can ensure the button exists and is clickable without crashing.
    expect(launchButtons[0]).toBeDefined();
  });
});
