# Product Notes — Nebula Coaching Platform

## Implementation Decisions

### Session & Auth
The platform uses a lightweight cookie-based session system rather than a full auth library (NextAuth, etc.). Three test sessions with hardcoded IDs map to pre-seeded users in the database. In production this would be replaced with proper JWT or database-backed session management.

### Routing Structure

```
/                          → Redirects based on session role
/programs                  → Public program catalog (search + filters)
/programs/[id]             → Program detail + cohort enrollment
/dashboard                 → Role-aware dashboard (student / coach / admin)
/my-programs               → Student enrolled programs + exploration responses
/coach/programs            → Coach's program list with stats
/coach/programs/new        → Create a new program
/coach/programs/[id]       → Program detail: cohorts list + explorations
/coach/programs/[id]/cohort/new  → Create a new cohort for this program
/coach/cohorts/[id]        → Manage existing cohort: sessions + enrolled students
/admin                     → Admin KPI dashboard
```

### Cohort Management Flow
Coaches navigate: **My programs** → click **Cohorts (N)** on a published program → **Program detail page** → click **Gérer** on a cohort → **Cohort management page** (enrolled students + sessions). Creating a new cohort uses the **Nouvelle cohorte** button on the program detail page.

### Exploration Responses (Bonus Feature)
Students can submit written responses to explorations from their **My programs** page. Responses are stored in `ExplorationResponse` with a `@@unique([explorationId, userId])` constraint (one response per student per exploration). Coaches can add feedback via the coach feedback server action.

### Data Integrity
- Cascading deletes: removing a `Program` removes its `Cohort`s, `Session`s, and `Exploration`s.
- Enrollment is blocked if a cohort is full (`maxParticipants` check in `enrollAction`).
- Duplicate enrollment is blocked by `@@unique([cohortId, userId])` on `Enrollment`.

## Known Limitations / Out of Scope

- **In-memory session store**: sessions are held in a `Map` on the Node.js process. They are lost on server restart. Switching to a database-backed or Redis-backed session store (and using bcrypt for passwords) would be the first production-readiness step.
- **No email notifications**: enrollment confirmation, session reminders, and feedback notifications are not implemented.
- **No file uploads**: exploration responses are text-only; no attachment support.
- **Admin cohort view**: the admin sidebar shows all programs but does not have a dedicated cohort management view. Admin can view programs through the catalog.
- **No pagination**: program lists and student lists are fetched without pagination; large datasets would need cursor-based pagination.

## Si j'avais plus de temps — Améliorations prioritaires

### 1. Authentification robuste par rôle

L'implémentation actuelle utilise un `Map` en mémoire et des mots de passe hashés avec un simple SHA-256 maison. En production, les priorités seraient :

**Pour tous les utilisateurs**
- Remplacer le store en mémoire par une table `Session` en base (PostgreSQL) ou Redis, avec TTL et invalidation explicite (logout, changement de mot de passe).
- Passer à `bcrypt` (coût ≥ 12) pour les mots de passe — SHA-256 seul n'est pas adapté au stockage de credentials.
- Ajouter un `CSRF token` sur chaque action mutante (les server actions Next.js ont une protection partielle, mais un token explicite est plus sûr).

**Pour les coachs**
- Flux d'invitation par email : un admin invite un coach, le lien génère un token à usage unique (`CoachInvite` en base, TTL 48h) qui permet de définir son mot de passe lors de la première connexion. Cela évite de créer des comptes coach manuellement via seed.
- Optionnellement : OAuth (Google Workspace) pour les organisations qui gèrent déjà leurs identités côté employeur.

**Pour les admins**
- MFA obligatoire (TOTP via `otplib` ou Passkey) : un compte admin compromis donne accès à toutes les données de la plateforme. C'est le rôle qui justifie le plus une seconde couche.
- Log d'audit dédié : chaque action admin (publication forcée, modification de cohorte, accès aux données d'un étudiant) devrait être tracée dans une table `AuditLog` avec timestamp, userId et payload.
- Séparation possible en `superadmin` / `admin` si la plateforme s'ouvre à plusieurs organisations (multi-tenant).

---

### 2. Refonte du design via Figma avant implémentation

Le frontend actuel a été construit directement en code (CSS inline + classes utilitaires globales). Cette approche est rapide pour un prototype mais crée des incohérences visuelles et rend les changements de design coûteux.

**Workflow recommandé pour une V2**

1. **Design system d'abord dans Figma** — définir les tokens (couleurs, typographie, espacements, rayons, ombres) comme variables Figma avant d'écrire une ligne de CSS. Les tokens Figma sont ensuite exportés en CSS custom properties ou en fichier Tailwind config, garantissant une source de vérité unique.

2. **Composants Figma avant composants React** — chaque composant UI (carte programme, badge statut, tableau de cohorte, formulaire) est designé et approuvé dans Figma en desktop + mobile avant d'être codé. Cela évite les aller-retours design/dev et les `style={{ marginTop: 28 }}` inline qui rendent le code difficile à maintenir.

3. **Figma Code Connect** — lier les composants Figma aux composants React correspondants (`figma.connect(ProgramCard, ...)`). Les devs voient directement dans Figma quel composant utiliser et avec quelles props, au lieu de recréer des variantes à la main.

4. **Handoff structuré** — les maquettes Figma servent de référence contractuelle pour les états (hover, loading, empty state, error state) qui sont souvent oubliés lors d'un prototypage rapide. Aujourd'hui plusieurs états d'erreur du formulaire n'ont pas de traitement visuel cohérent.

**Points de design à retravailler en priorité**
- Navigation mobile : le sidebar actuel n'est pas adapté aux petits écrans (pas de responsive réel).
- États vides : les pages "Aucun programme" et "Aucun inscrit" ont des messages génériques — un bon empty state guide l'utilisateur vers l'action suivante.
- Feedback visuel des actions asynchrones : les boutons "Publier / Archiver" n'ont pas d'état loading visible pendant la transition.
- Cohérence typographique : les tailles de texte sont définies inline (`fontSize: 11`, `fontSize: 13`...) sans échelle typographique formelle.

---

## What Works End-to-End

| Feature | Status |
|---------|--------|
| Student program discovery + enrollment | ✅ |
| Student My Programs with coach info | ✅ |
| Student exploration response submission | ✅ |
| Student dashboard with real data | ✅ |
| Coach program creation | ✅ |
| Coach cohort creation with auto-schedule | ✅ |
| Coach cohort management (enrolled students) | ✅ |
| Coach exploration creation | ✅ |
| Coach dashboard with real stats | ✅ |
| Admin KPI dashboard | ✅ |
| Admin program catalog view | ✅ |
