import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App component', () => {
  it('renders the home page by default', () => {
    render(<App />);
    expect(screen.getAllByText(/VenueIQ/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Launch Dashboard/i).length).toBeGreaterThan(0);
  });
});
