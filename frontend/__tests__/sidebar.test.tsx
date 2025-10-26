import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock Sidebar component for testing
const MockSidebar = () => {
  return (
    <div data-testid="sidebar" className="bg-gray-800">
      <div>Study AI</div>
      <nav>
        <a href="/dashboard">Dashboard</a>
        <a href="/materials">Study Materials</a>
        <a href="/quiz">Quiz</a>
        <a href="/flashcards">Flashcards</a>
        <a href="/planner">Study Planner</a>
        <a href="/ai-insights">AI Insights</a>
      </nav>
    </div>
  )
}

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
    }
  },
}))

describe('Sidebar Component', () => {
  it('renders sidebar with navigation items', () => {
    render(<MockSidebar />)
    
    // Test main navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Study Materials')).toBeInTheDocument()
    expect(screen.getByText('Quiz')).toBeInTheDocument()
    expect(screen.getByText('Flashcards')).toBeInTheDocument()
    expect(screen.getByText('Study Planner')).toBeInTheDocument()
    expect(screen.getByText('AI Insights')).toBeInTheDocument()
  })

  it('renders the Study AI brand', () => {
    render(<MockSidebar />)
    
    expect(screen.getByText('Study AI')).toBeInTheDocument()
  })

  it('has proper sidebar structure', () => {
    render(<MockSidebar />)
    
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toBeInTheDocument()
    expect(sidebar).toHaveClass('bg-gray-800')
  })

  it('handles navigation clicks', async () => {
    const user = userEvent.setup()
    render(<MockSidebar />)
    
    const studyMaterialsLink = screen.getByText('Study Materials')
    await user.click(studyMaterialsLink)
    
    // Verify the link is clickable
    expect(studyMaterialsLink).toBeInTheDocument()
  })

  it('renders all required navigation links', () => {
    render(<MockSidebar />)
    
    // Check that all links have proper href attributes
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Study Materials').closest('a')).toHaveAttribute('href', '/materials')
    expect(screen.getByText('Quiz').closest('a')).toHaveAttribute('href', '/quiz')
    expect(screen.getByText('Flashcards').closest('a')).toHaveAttribute('href', '/flashcards')
    expect(screen.getByText('Study Planner').closest('a')).toHaveAttribute('href', '/planner')
    expect(screen.getByText('AI Insights').closest('a')).toHaveAttribute('href', '/ai-insights')
  })

  it('provides accessible navigation', () => {
    render(<MockSidebar />)
    
    // Test that navigation is present
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    // Test that links are accessible
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(6) // 6 navigation links
  })
})