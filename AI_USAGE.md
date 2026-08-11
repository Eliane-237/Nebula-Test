# AI Usage Log

This document records how AI assistance (Claude) was used during development of the Nebula coaching platform.

## Scope of AI Assistance

All feature implementation was completed with Claude Code (claude-sonnet-4-6) acting as a pair programmer / implementation agent throughout the project.

### What AI helped with

| Area | Description |
|------|-------------|
| **Architecture** | Recommended the server-component + client-component split pattern for Next.js 15 App Router, dynamic `import()` workaround for webpack/pg bundling conflict |
| **Database schema** | Designed the Prisma schema (`Program`, `Cohort`, `Session`, `Enrollment`, `Exploration`, `ExplorationResponse`) and wrote migrations |
| **Server actions** | Authored all server actions (`createCohortAction`, `enrollAction`, `submitExplorationResponse`, `addCoachFeedback`, etc.) and query helpers (`adminQueries`, `coachQueries`, `studentQueries`) |
| **UI components** | Built all role-specific views: `CoachProgramsView`, `CoachProgramDetailView`, `CohortManageView`, `CohortCreateForm`, `MyProgramsView`, `AdminDashboard`, `CoachDashboard`, `StudentDashboard` |
| **Bug fixes** | Resolved webpack `fs` bundling error, TypeScript type mismatches, React controlled-input state issues, Prisma client regeneration after schema change |
| **Routing** | Designed the routing structure for coach program management: `/coach/programs/[id]` → `/coach/programs/[id]/cohort/new` → `/coach/cohorts/[cohortId]` |
| **CSS / Layout** | Fixed sidebar height/overflow so sign-out is always visible; designed the overall layout system |

### What AI did NOT do

- AI did not make product decisions — the feature set comes from the provided case study specification.
- AI did not access external services or APIs beyond the local codebase and database.
- All generated code was reviewed in context and tested against the running application.

## Prompting Approach

Development proceeded through a series of feature-by-feature prompts, each scoped to a specific requirement from the case study PDF. Errors surfaced in the browser or TypeScript compiler were fed back to the AI for diagnosis and correction within the same session.

## Model

- **Model**: `claude-sonnet-4-6` 
- **Session date**: 2026-08-10
