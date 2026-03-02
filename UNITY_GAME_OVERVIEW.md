# B40 Life Simulator - Unity Game Overview

This document summarizes the game flow, environment, graphics direction, and settings for the Unity mobile rebuild.

## Game Flow

1. **Start Menu → Persona Selection**
   - Player chooses a persona (e.g., Fresh Grad KL, Single Parent Penang).
   - Persona defines starting money, debt, credit score, and map.

2. **Main Game Loop (Map → Scenario → Choice → Consequence)**
   - Player moves on a 2D top-down map and interacts with locations.
   - Each interaction triggers an AI-generated scenario.
   - Player selects a choice; stats update immediately and may schedule delayed consequences.
   - Energy decreases per action; when energy is out, the day ends.

3. **Time Progression**
   - Day advances after energy is used up.
   - Week advances after 5 weekdays.
   - Bills are due on scheduled weeks; missed payments affect credit and stress.

4. **End Conditions**
   - Game ends after Week 4 or if health reaches 0 / stress hits 100.
   - Ending scene summarizes outcomes and decisions.

## Environment

- **Setting:** Malaysian B40 neighborhood with distinct city maps (KL, Penang).
- **Locations:** Home, Kedai, Petrol Station, TNB, Office, Bank, Bus Stop, etc.
- **NPCs:** Small cast with recurring roles (Pak Ali, Boss, Family, Roommate).
- **Atmosphere:** Grounded, day-to-day financial pressure with human moments.

## Graphics Direction

- **Style:** 2D top-down, mobile-first.
- **Maps:** 1920x1080 backgrounds or tilemaps for KL and Penang.
- **Sprites:**
  - Player characters: 64x64 or 128x128 with simple movement animation.
  - NPC portraits: 256x256 for dialogue UI.
  - Locations/tiles: 32x32 or 64x64.
- **UI:** Unity UI (uGUI) + TextMesh Pro.
  - Dialogue panels with choice buttons.
  - HUD for money, credit, health, stress, and energy.
  - Touch-friendly spacing and large tap targets.
- **Animation:** Unity Animator or DOTween for UI transitions and subtle feedback.

## Core Settings

- **Engine:** Unity 2022.3 LTS or Unity 6 (2023.3 LTS).
- **Template:** 2D (URP).
- **Build Targets:**
  - Android: Minimum API 24, IL2CPP, ARMv7 + ARM64.
  - iOS: Minimum iOS 13, IL2CPP, ARM64.
- **Input:** Mobile joystick + on-screen interaction button; keyboard fallback for testing.
- **Safe Areas:** UI anchored to `Screen.safeArea`.
- **Save System:** Local JSON save under `Application.persistentDataPath`.
- **AI Integration:** Claude API via HTTPS for scenario generation.

## Audio (Optional but Recommended)

- Ambient city/background music loop.
- Light SFX for interactions, choice selection, and stat changes.
- Subtle UI feedback sounds to reinforce player actions.

## Scenes (Unity)

- `MainMenu.unity`
- `PersonaSelection.unity`
- `Game_KL.unity`
- `Game_Penang.unity`
- `Ending.unity`

## Key Takeaway

The Unity build keeps the same emotional loop as the web prototype: walk → choose → consequence → reflect. The focus is on fast, readable UI and believable Malaysian settings that make the player feel the financial pressure within minutes.
