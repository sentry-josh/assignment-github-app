# Assignment Github App

A web application that creates ranking reports for GitHub users based on their follower networks, with configurable depth traversal.

## 🎯 Problem Statement

This project implements a GitHub follower ranking system that:

1. **Fetches follower data** from GitHub's REST API for a given username
2. **Traverses the follower network** to a specified depth level
3. **Calculates follower ranks** based on direct and indirect connections
4. **Displays interactive reports** with sorting and pagination capabilities

### Example Scenario

Given this follower network:

```
User A → Followers: B, C, D
User B → Followers: D, E, K
User C → Followers: K, L
User D → Followers: K
```

- **Depth 1**: User A's followers = [B, C, D] → Rank: 3
- **Depth 2**: User A's followers = [B, C, D, E, K, L] → Rank: 6

## 🚀 Solution Overview

### Architecture & Design Principles

This solution prioritizes **scalability**, **maintainability**, and **separation of concerns**:

#### 🏗️ **Modular Architecture**

- **Service Layer**: GitHub API integration with mock data fallback
- **Data Layer**: Efficient follower graph traversal algorithms
- **UI Layer**: React components with clean separation

#### ⚡ **Performance Optimizations**

- Memoized API calls to prevent duplicate requests
- Virtual scrolling for large datasets
- Efficient graph traversal with cycle detection

### Core Features

#### 📊 **Ranking Dashboard**

- **User Information Display**:
  - Username with GitHub profile link
  - User avatar image
  - Account creation date
  - Calculated followers-rank score

#### 🔍 **Advanced Sorting & Filtering**

- Sort by: Username (A-Z), Creation Date, Followers Rank
- Real-time search functionality
- Filter by date ranges and follower thresholds

#### 📄 **Pagination & Performance**

- Client-side pagination with configurable page sizes
- Lazy loading for smooth user experience
- Progress indicators for long-running operations

### Technical Implementation

#### 🔌 **API Integration Strategy**

```javascript
// Flexible service layer supporting both real and mock APIs
class GitHubService {
  constructor(useMockData = true) {
    this.dataSource = useMockData ? new MockGitHubAPI() : new RealGitHubAPI();
  }

  async getFollowersWithDepth(username, depth) {
    // Implements BFS traversal with cycle detection
  }
}
```

#### 🧮 **Follower Rank Algorithm (Depth First Search)**

```javascript
// Efficient graph traversal with memoization
const calculateFollowersRank = async (username, depth, visited = new Set()) => {
  if (depth === 0 || visited.has(username)) return [];

  const followers = await fetchFollowers(username);
  const allFollowers = [...followers];

  // Recursive traversal for deeper levels
  for (const follower of followers) {
    const subFollowers = await calculateFollowersRank(
      follower.login,
      depth - 1,
      visited,
    );
    allFollowers.push(...subFollowers);
  }

  return [...new Set(allFollowers)]; // Remove duplicates
};
```

#### 🎨 **Component Architecture**

- `<RankingDashboard />` - Main container component
- `<UserCard />` - Individual user display component
- `<SortingControls />` - Sorting and filtering interface
- `<PaginationControls />` - Page navigation
- `<SearchInput />` - Real-time search functionality

### 🧪 Mock Data Strategy

Since GitHub API has rate limits, the application includes:

- **Realistic mock data** that simulates GitHub API responses
- **Configurable network depth** for testing complex scenarios
- **Edge case simulation** (users with no followers, API errors, etc.)
- **Performance testing data** with large follower networks

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive, utility-first design
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks

## 📦 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── UserCard/
│   ├── SortingControls/
│   └── PaginationControls/
├── services/            # API integration layer
│   ├── GitHubService.ts
│   ├── MockGitHubAPI.ts
│   └── types.ts
├── hooks/               # Custom React hooks
│   ├── useFollowerData.ts
│   └── usePagination.ts
├── utils/               # Helper functions
│   ├── ranking.ts
│   └── sorting.ts
└── __tests__/           # Test files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Setup

```bash
# Clone the repository
git clone [https://github.com/sentry-josh/assignment-github-app.git]
cd github-ranking-report

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### Usage

1. **Enter GitHub Username**: Input any GitHub username in the search field
2. **Set Depth Level**: Choose how deep to traverse the follower network (1-3 recommended)
3. **View Results**: Explore the ranking dashboard with sorting and filtering options
4. **Navigate Pages**: Use pagination controls for large result sets

## 🎯 Key Quality Indicators

This codebase demonstrates:

- **Clean Architecture**: Clear separation between UI, business logic, and data layers
- **Type Safety**: Full TypeScript integration with comprehensive type definitions
- **Error Handling**: User-friendly error messages
- **Performance**: Optimized algorithms and React rendering patterns
- **Testability**: Modular design with comprehensive unit but due to time constraints from me i reduced some of this
