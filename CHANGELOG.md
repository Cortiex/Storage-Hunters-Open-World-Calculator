# Changelog

All notable changes to the **Storage Hunters: Open World Calculator** will be documented in this file.

## [0.3.6] - 2026-07-28

### Added

- Added a four-step Mutation Finder guide that opens once per browser session and can be reopened from the navigation.
- Restored a simplified `Copy Result` image export for the Value Calculator, including an automatic PNG download fallback when image clipboard access is unavailable.
- Added `CALCULATIONS.md` with the complete Value Calculator formula, Mutation Finder method, symbols, rounding behavior, and numerical solution.
- Added automatic category counts and responsive mutation loading/error states.

### Changed

- Both calculators now accept a base item value directly instead of selecting an item from an index.
- Mutation names, categories, multipliers, and visual styles now load exclusively from the current `Module:MutationData` response.
- All module mutations are rendered; non-numeric entries remain visible but disabled.
- Washing mutations remain mutually exclusive and automatically remove a selected Dirty mutation.
- Time Capsule mutations are now mutually exclusive.
- Rebuilt the interface around the supplied wiki design references while retaining Rubik for headings and labels.
- Updated the hero, navigation, input controls, mutation categories, result panel, responsive behavior, and page background.
- Mutation choices now use four compact tiles per desktop row with multiplier badges and circular selection indicators.
- Mutation cards now use a cleaner two-line layout without the repeated “Mutation” subtitle, keeping long values such as `Unobtainable` on one line.
- Mutation border colors are derived from module styles; wide color gradients receive a full gradient border, while dark gradients use their strongest non-black module color for selection states.
- Refined the Rainbow border, restored Corrupted's green selection color, and retained Void's dark-purple styling.
- Simplified decorative shapes around the item form, unified the page into a darker 0.3.5-inspired frame, and restored the compact creator/version/GitHub-icon footer layout.
- Selected mutations in both output panels now use their current module colors and gradients, and linked footer elements are brighter than the surrounding credit text.
- The Value Calculator output now lists the base value, and its exported PNG mirrors the modern output panel with every displayed factor, matching mutation chips, Low Items Markup, and the total multiplier.
- Moved the `01 · Input` headings outside their field panels so the Input and Modifiers sections share the same hierarchy and only form controls remain inside the input boxes.
- Reordered the Value Calculator and exported PNG outputs to follow the calculation from Base Value through each multiplier, placing Final Value at the bottom as the end result.
- Unified mutation name colors and text gradients across the selection grids, output chips, and exported PNG while retaining the selection grid's original card layout, side accents, and separate multiplier badges.
- Reworked the copied result into a compact card containing only calculation data, with no output heading, credits, or version footer, and shortened both calculator reset actions to `Reset`.
- Colored event subgroup text without adding badges or outlines: Moonlit Event and Rain Event now mix their live colors into the same softer pastel palette.
- Rebuilt the copied result as a near one-to-one rendering of the website output panel, from Base Value through Final Value, without separate statistic boxes or the output heading.
- Final Value now automatically reduces its font size to remain on one line on the website and in exported images, even for very large values.
- Mint and Perfect now require exactly 100% condition on both calculators; they become unavailable below 100%, are removed if condition drops, and set condition to 100% when selected.
- Clipped the complete exported-card content to its rounded outer shape so bottom fills and separator edges no longer extend beyond the curved corners.
- Footer version links now open the hosted GitHub changelog directly, while internal calculator navigation continues to use deployment-safe relative URLs.
- Reduced redundant interface copy and moved calculation details out of the website into `CALCULATIONS.md`.
- Updated README documentation and all visible version labels to 0.3.6.

### Removed

- Removed the live item index, item search, area filters, item images, and `Module:ItemData` dependency.
- Removed the Custom Item toggle; the base value field is always available directly.
- Removed all local mutation-data lists and fallback snapshots.
- Removed the visible Washing rule notice while preserving its behavior.
- Removed formula panels from the calculator pages.

## [0.3.5] - 2026-07-12

### Added

- Added **favicon** (`favicon.ico`) to both HTML pages.
- Added **Mutation Finder** (`mutationCalculator.html`) — a reverse calculator that determines an unknown mutation's multiplier given a sell price and a set of known mutations.
- Added dynamic fetching of all mutations from the Storage Hunters Wiki (`Module:MutationData`).
- Added dynamic auto-generation of all mutation categories, colors, and styled card representations.
- Added a new visible main page title styled with the **Roboto Slab** font.
- Hidden the **Custom Value** input behind an **"Unknown/Custom Item"** toggle.

### Changed

- Organized project files by moving stylesheets to `/css/` and JavaScript files to `/js/`, aswell as split up the scripts for usage in new .html page.
- Updated the site theme background color to `#121212`, primary color to `#ffc500`, and panel backgrounds to `#1e222a` to match the wiki.
- Relocated **Condition (%)**, **Grade**, and **Unknown/Custom Item** controls underneath the item index.
- Removed the **"Wiki live"** status badge and replaced with a loading spinner.

## [0.3.4] - 2026-07-08

### Added

* Added **Low Item Markup** support to the calculator.
* Added a **Low Item Markup** factor display in the result panel.
* Added [**FieryWolfLevi**](https://github.com/FieryWolfLevi) as an official project contributor.
* Documented the value calculation formula and project structure in the README.

### Changed

* Changed the **Rainbow** mutation multiplier to `100x`.
* Changed the **Wet** mutation multiplier to `1.4x`.
* Updated the calculation logic to support the Low Item Markup system.
* Updated condition scaling so the effective max value chooses between the low-value condition curve and the normal `60%` to `100%` curve at `$1,000`.
* Updated value rounding to better match **ROBLOX/Luau** number behavior.
* Split the single-file calculator into separate root-level HTML, CSS, and JavaScript files for easier maintenance.
* Cleaned up parts of the code for better readability and maintainability.

### Fixed

* Fixed an issue where Low Item Markup was incorrectly being applied to all calculations.


## [0.3.3] - 2026-07-05

### Added

* Added a live Wiki-powered item index that loads item data directly from [`Module:ItemData`](https://storagehunters.fandom.com/wiki/Module:ItemData).
* Added item search by item name and area filters for Junk Yard, Back Alley, Farmyard, Shipyard, Cargo, Lost, and Exclusive.
* Added selectable item cards that automatically load the item base value into the calculator.
* Added active mutation display below the mutation multiplier in the result panel.
* Added styled image export for **Copy Result** with selected item, value stats, and active mutations.

### Changed

* Updated Copy Result output to use a cleaner layout.
* Updated active mutation sorting so **Dirty** is always shown first, followed by highest to lowest multiplier like ingame.
* Renamed the manual value input and result image stat label to **Custom Value** where appropriate.
* Improved typography, spacing, sticky index behavior, and overall visual consistency.

### Fixed

* Improved visibility for dark mutation styles such as Moonlit, Void, Dirty, Corrupted, and Black.

## [0.3.2] - 2026-07-04

### Changed

* Updated the mutation list to match the current multiplier values.
* Changed the **Pure** mutation multiplier to `1.875x`.
* Changed the **Spotless** mutation multiplier to `3.125x`.
* Added the **Black** mutation as `Unobtainable`.
* Renamed **Base Value ($)** to **Value ($)**.
* Added links to the changelog version and GitHub icon in the footer.
* Updated creator and repository links after the GitHub username change to **Vantacry**.
* Updated the README with the new GitHub Pages calculator link and creator profile.

## [0.3.1] - 2026-07-01

### Changed

* Updated the **Pure** mutation multiplier from a fixed `1.5x` to a range of `1.5x - 2x`.
* Selected mutations are now displayed immediately after selection.
* Selected mutations are now sorted by multiplier size, similar to the in-game order.
* Improved the calculator layout with general visual and usability adjustments.

## [0.3.0] - Initial Release

### Added

* First public release of the Storage Hunters: Open World Mutation Calculator.
* Added support for base value, condition, grade, and mutation multipliers.
* Added mutation selection and final value calculation.
* Added a clean layout for sharing and using the calculator more easily.
