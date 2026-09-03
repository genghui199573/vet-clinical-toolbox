# Vet Clinical Toolbox 5.0-r08 — Patient / AI Sync Fix

## Fixed
- Global Patient State sync now automatically creates a stable local patient ID when none exists.
- Homepage patient shortcut now writes through the same Patient State source of truth instead of maintaining a parallel `caseState`-only path.
- AI plan patient synchronization no longer depends on a UI button being available at that exact moment; it calls the Patient State sync API directly and has a fallback local persistence path.
- AI Clinical Plan synchronization now reliably propagates to Clinical OS and records AI-generated Differential Diagnosis items as Suggested.
- Clinical OS now has a dedicated AI Differential Diagnosis store and display.
- AI Suggested / Doctor Review Required safety semantics remain unchanged; no medication, fluid, anesthesia, transfusion, or other high-risk order is auto-executed.

## Preserved
- Visible product version: 5.0-r08.
- 427 drug leaflets and 10 disease protocols.
- 54+ clinical workstation templates.
- Glucose unit standardization to mmol/L.
- Local clinic Naba chemistry reference profile and lab linkage.
- Existing AI structured plan, Clinical OS, Patient State, timeline, monitoring, safety rules, and PWA files.
