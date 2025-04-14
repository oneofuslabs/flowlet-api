# GitHub Actions Workflow Setup

This directory contains GitHub Actions workflows for this project.

## PR Checks Workflow

The `pr-checks.yml` workflow runs on every pull request to main/master branches and:

1. Runs ESLint to check code quality
2. Runs Jest tests to ensure all tests pass
3. Uploads test coverage reports as artifacts

## Branch Protection Setup

To enforce these checks and prevent merging PRs that fail tests or linting, set up branch protection rules:

1. Go to your repository on GitHub
2. Navigate to Settings > Branches
3. Under "Branch protection rules" click "Add rule"
4. For "Branch name pattern" enter `main` (or `master` if that's your default branch)
5. Enable the following options:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ In the "Status checks that are required" search box, add:
     - `Lint and Test`
     - `Status Check`
6. Click "Create" or "Save changes"

This ensures PRs cannot be merged unless all linting and tests pass.
