import React from 'react';
import { render, screen } from '@testing-library/react';
import PageContainer from './PageContainer';

describe('PageContainer', () => {
  it('renders title correctly', () => {
    render(<PageContainer title="Test Page">content</PageContainer>);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <PageContainer title="Test Page">
        <div data-testid="child-element">Child content</div>
      </PageContainer>
    );
    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('applies padding correctly', () => {
    const { container } = render(
      <PageContainer title="Test Page">
        <div data-testid="child-element">Child content</div>
      </PageContainer>
    );
    // Check if the Box component has padding
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle('padding-top: 32px');
    expect(box).toHaveStyle('padding-bottom: 32px');
    expect(box).toHaveStyle('padding-left: 16px');
    expect(box).toHaveStyle('padding-right: 16px');
  });

  it('renders without subtitle when not provided', () => {
    const { container } = render(
      <PageContainer title="Test Page">
        <div data-testid="child-element">Child content</div>
      </PageContainer>
    );
    // There should be only one Typography element for the title
    const typographyElements = container.querySelectorAll('.MuiTypography-root');
    expect(typographyElements.length).toBe(1);
  });

  it('accepts additional props', () => {
    render(
      <PageContainer title="Test Page" data-testid="custom-page-container">
        <div data-testid="child-element">Child content</div>
      </PageContainer>
    );
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByTestId('custom-page-container')).toBeInTheDocument();
  });
});
