# Contributing to Chinayandua

Thank you for your interest in contributing! Here's how to get started.

## Code of Conduct

Be respectful and professional in all interactions.

## Getting Started

1. **Fork the repository**

```bash
git clone https://github.com/your-username/chinayandua.git
cd chinayandua
```

2. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

3. **Install dependencies**

```bash
npm install
```

## Development

### Available Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Run npm run lint before committing
- Use meaningful variable and function names

## Commit Messages

Use conventional commits for clarity:

- `feat`: for new features
- `fix`: for bug fixes
- `docs`: for documentation
- `style`: for formatting
- `refactor`: for code restructuring
- `test`: for tests
- `chore`: for maintenance

Example:

```bash
git commit -m "feat: add new gacha feature"
git commit -m "fix: resolve homepage loading issue"
```

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Test your changes locally

## Pull Request Process

1. **Create a PR** from your feature branch to develop
2. **Fill out the PR template** completely
3. **Link related issues** using Fixes #issue_number
4. **Ensure CI checks pass** (no red X's)
5. **Wait for code review** - maintainers will provide feedback
6. **Make requested changes** if needed
7. **Merge** once approved

### PR Guidelines

- Keep PRs focused on a single feature/fix
- Write clear, descriptive PR titles and descriptions
- Reference issues and PRs as needed
- Keep commits clean and logical
- Include tests for new functionality

## Branches

- **main** - Production code (protected)
- **develop** - Development branch (base for features)

### Branch Naming

- Feature: `feature/description`
- Bug fix: `fix/description`
- Hotfix: `hotfix/description`

## Workflow

```
develop (main development)
    ↑
feature/my-feature (your feature branch)
    ↓
PR → Review → Merge to develop
    ↓
develop → (when ready) → Release PR to main
```

## Issues

### Reporting Bugs

Include:

- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

### Requesting Features

Include:

- Use case and motivation
- Proposed solution (if any)
- Alternative approaches
- Examples

## Security

- Do not commit sensitive information (API keys, passwords)
- Use .env.local for local configuration
- Report security issues privately to the maintainers

## Questions?

- Check existing issues/PRs first
- Ask in the issue/PR comments
- Be specific and provide context

## Thank You!

Your contributions make this project better! 🚀
