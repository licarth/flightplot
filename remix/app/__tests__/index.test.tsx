// Testing library
import { render, screen } from '@testing-library/react';
import fetch from 'node-fetch';
import { MemoryRouter } from 'react-router-dom';

// App
import Index from '~/routes/index';
beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(fetch);
});

afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
});

// Fails because of error "TypeError: Cannot use 'in' operator to search for '_leaflet_id' in null" when a react-leaflet Polygon is rendered
describe('Home page', () => {
    it('renders a page', () => {
        // Arrange
        render(<Index />, { wrapper: MemoryRouter });
        // Act
        const heading = screen.getByTestId('modal-root');
        // Assert
        expect(heading).toBeInTheDocument();
    });
});
