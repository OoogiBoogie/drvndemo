# Commit Message Template for Security Update

## For the Main Branch Security Update Commit

Use this commit message format when pushing the security update to main:

```
chore(security): mandatory security update - upgrade React, Next.js, and dependencies

BREAKING CHANGE: This update requires all contributors to pull from main and update their branches

## Security Issues Addressed

- Fixed compromised React versions (upgraded to 19.2.1)
- Fixed compromised Next.js versions (upgraded to 15.5.7)
- Addressed Vercel security notices for vulnerable packages
- Updated critical SDK packages to secure versions

## Package Updates

### Critical Security Updates
- next: ^15.5.7 (from < 15.5.7) - Security vulnerabilities fixed
- react: ^19.2.1 (from < 19.2.1) - Security vulnerabilities fixed
- react-dom: ^19.2.1 (from < 19.2.1) - Must match React version
- @coinbase/onchainkit: 1.0.3 (exact version required)

### Major Version Updates
- tailwindcss: ^4.1.17 (major version update)
- wagmi: ^2.16.0 (compatibility with React 19)
- viem: ^2.27.2 (security updates)

### Infrastructure Updates
- Node.js requirement: 22.x (from 18.x/20.x)
- Updated CI/CD workflows to check package versions
- Added automated version validation

## Breaking Changes

### React 19 Changes
- Component prop types updated
- Hook behavior changes
- TypeScript type definitions updated

### Next.js 15 Changes
- App Router API updates
- Metadata API changes
- Server Components default behavior

### Tailwind CSS 4 Changes
- New configuration structure
- Updated PostCSS configuration
- New CSS import syntax

## Required Actions for Contributors

All contributors MUST:
1. Pull latest changes from main: `git pull origin main`
2. Merge main into their branch: `git merge main`
3. Update dependencies: `cd Frontend && npm install`
4. Fix any breaking changes in their code
5. Test thoroughly before submitting PR

See SECURITY_UPDATE.md for detailed migration guide.

## CI/CD Updates

- Added version-check.yml workflow to validate package versions
- Updated CI workflow to verify critical package versions
- Added automated checks for Node.js version requirement
- PRs with outdated versions will be automatically rejected

## Testing

- ✅ All existing tests pass
- ✅ Build succeeds with new versions
- ✅ Type checking passes
- ✅ Linting passes
- ✅ Formatting passes
- ✅ Tested in dApp, Farcaster, and Base Mini App environments

Closes #[issue-number]
Related to: Vercel security notice
```

## For Contributors Updating Their Branches

When you merge the security update into your feature branch, use:

```
chore: merge security update from main

- Merged latest changes from main branch
- Updated package.json to match required versions
- Resolved merge conflicts
- Updated dependencies with npm install

See SECURITY_UPDATE.md for details.
```

## For Fixing Breaking Changes

When fixing code after the security update:

```
fix(frontend): update code for React 19 and Next.js 15 compatibility

- Updated component types for React 19
- Fixed Next.js 15 App Router changes
- Updated TypeScript types
- Resolved breaking changes

Related to: Security update (see SECURITY_UPDATE.md)
```

