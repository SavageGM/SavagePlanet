# Savage Planet Tools Core v0.1 Test Build

This is the first browser-testable Tools Core shell.

## Test locally

Download the `tools-core` folder and open `index.html` in a modern browser. No web server or installation is required for this version.

## Test checklist

1. Dashboard loads and shows five registered tools.
2. Click the Engineering Console card or Engineering in the left navigation.
3. Switch between Invent, Upgrade, Repair, and Analyze.
4. Change skill, TL, value, workspace, tools, and parts and confirm Effective Skill recalculates.
5. Add multiple Parts Ledger rows and change condition/relationship multipliers.
6. Roll 3d6 and confirm a result appears.
7. Save an Engineering setup as a Core Project and confirm it appears under Projects and Dashboard Recent Projects.
8. Create a Data Library record and a Reference record.
9. Change Settings and reload the page; data should persist in browser LocalStorage.
10. Export Core Data to JSON, reset the Core, then Import the JSON and confirm projects/records/references/settings return.

## Current limitations

This is a prototype. Engineering table/rules behavior is present for testing, but project reopening/editing, Time Spent, fabrication, complete Analyze outcome handling, GCS data interchange, and Foundry export are later milestones. The browser stores test data locally, so clearing browser site data will remove it unless you export a JSON backup.

## Core schema

`sp-core/0.1`

Shared records and projects use stable Savage Planet IDs. Tools should add tool-specific data beneath their project/record data rather than inventing separate incompatible storage formats.