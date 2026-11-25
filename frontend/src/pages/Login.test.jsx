import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from './Login';

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('Login page', () => {
  it('renders a username field, a password field and a submit button', () => {
    const { container } = renderLogin();
    // username is a plain text input
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // password input (no textbox role)
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    // submit button
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
