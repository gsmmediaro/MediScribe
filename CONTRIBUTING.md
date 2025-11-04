# 🤝 Contributing to MediScribe

Thank you for your interest in contributing to MediScribe! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤗 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and n8n

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/MediScribe.git
   cd MediScribe
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/gsmmediaro/MediScribe.git
   ```

### Install Dependencies

```bash
npm install
```

### Set Up Environment

1. Copy `.env.example` to `.env`
2. Configure your n8n webhook URL
3. Set up your n8n workflow (see [N8N_SETUP.md](./N8N_SETUP.md))

### Run Development Server

```bash
npm run dev
```

## 🔄 Development Workflow

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### Make Your Changes

1. Write clean, readable code
2. Follow the coding standards below
3. Add tests if applicable
4. Update documentation as needed

### Test Your Changes

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format

# Build
npm run build
```

### Commit Your Changes

```bash
git add .
git commit -m "feat: add dark mode toggle"
```

See [Commit Guidelines](#commit-guidelines) below.

### Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template
5. Submit the pull request

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use JSDoc comments for complex functions

Example:
```typescript
/**
 * Validates a Romanian CNP (Personal Numeric Code)
 * @param cnp - The CNP string to validate
 * @returns Validation result with error message if invalid
 */
export const validateCNP = (cnp: string): ValidationResult => {
  // Implementation
};
```

### React

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused (< 200 lines)
- Use meaningful component and prop names
- Add prop types for all components

Example:
```typescript
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, children }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add trailing commas in objects and arrays
- Use arrow functions for callbacks
- Use template literals for string interpolation

Run Prettier to auto-format:
```bash
npm run format
```

### File Organization

```
MediScribe/
├── components/       # React components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── types.ts         # TypeScript type definitions
├── constants.ts     # Application constants
└── App.tsx          # Main application component
```

### Component Structure

```typescript
// 1. Imports
import React, { useState } from 'react';
import { SomeType } from './types';

// 2. Types/Interfaces
interface MyComponentProps {
  // ...
}

// 3. Component
const MyComponent: React.FC<MyComponentProps> = ({ prop1, prop2 }) => {
  // 4. State
  const [state, setState] = useState<string>('');
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 8. Export
export default MyComponent;
```

## 📦 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semicolons, etc.)
- `refactor` - Code refactoring without changing functionality
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependency updates

### Examples

```bash
feat(validation): add CNP validation with control digit check

fix(audio): resolve microphone permission issue in Safari

docs(readme): update installation instructions

refactor(hooks): extract audio processing logic to custom hook

chore(deps): update react to v19.2.0
```

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Tests pass locally
- [ ] TypeScript types are properly defined
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Review Process

1. At least one maintainer must review
2. All comments must be resolved
3. All CI checks must pass
4. No merge conflicts

## 🧪 Testing

### Manual Testing

1. Test on multiple browsers (Chrome, Firefox, Safari)
2. Test audio recording functionality
3. Test file upload functionality
4. Test form validation
5. Test with various audio lengths and qualities
6. Test error scenarios

### Future: Automated Testing

We plan to add:
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing functionality
- Fixing bugs that affect usage
- Updating dependencies with breaking changes

### What to Document

- **README.md** - Overview, installation, usage
- **N8N_SETUP.md** - n8n workflow configuration
- **Code comments** - Complex logic, algorithms
- **JSDoc** - Function parameters and return types

### Documentation Standards

- Write clear, concise explanations
- Use proper grammar and spelling
- Include code examples where helpful
- Keep language simple and accessible
- Use emojis sparingly for visual structure

## 🐛 Reporting Bugs

### Before Reporting

1. Search existing issues
2. Check if it's already fixed in main branch
3. Gather reproduction steps

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of desired solution

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, etc.
```

## 🎯 Priority Areas

We especially welcome contributions in these areas:

1. **Testing** - Unit tests, integration tests, E2E tests
2. **Accessibility** - WCAG compliance, screen reader support
3. **Internationalization** - Multi-language support
4. **Mobile** - Responsive design improvements
5. **Performance** - Optimization, caching, lazy loading
6. **Documentation** - Tutorials, examples, videos

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and ideas
- **Email** - support@mediscribe.ro

## 🙏 Recognition

Contributors will be:
- Listed in the repository's contributors page
- Mentioned in release notes for significant contributions
- Eligible for maintainer status after consistent contributions

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to MediScribe! 🏥💙**

