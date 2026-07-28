# Storage Hunters: Open World — Calculator

A browser calculator for **Storage Hunters: Open World** on Roblox. It calculates item values from base value, condition, grade, and mutations, or works backwards to estimate one unknown mutation multiplier.

**[Open Storage Hunters Calculator](https://vantacry.github.io/Storage-Hunters-Open-World-Calculator/)**

Current release: **v0.3.6**

## Features

- Calculate an item's final value from its base value and modifiers.
- Copy the current Value Calculator result as a styled PNG image, with a download fallback when clipboard images are unavailable.
- Estimate one unknown mutation multiplier from a known sell price.
- Guided four-step introduction for the Mutation Finder.
- Enter any base value directly—no item index required.
- Load every mutation, multiplier, category, and style directly from the current module.
- Keep item data, item images, and the former item index out of the calculator.
- Enforce exclusive Washing and Time Capsule mutation selections automatically.
- Allow Mint and Perfect only at exactly 100% condition and keep that requirement synchronized automatically.
- Responsive layout for desktop, tablet, and mobile.

## Mutation data

All mutation data is requested at runtime from [Module:MutationData](https://storagehunters.fandom.com/wiki/Module:MutationData). The project does not contain a fallback mutation list. This keeps names, categories, multipliers, and visual styles synchronized with the module automatically.

Numeric mutations—including 1x mutations—are selectable. Non-numeric entries remain visible but disabled. If the request fails, the calculator shows a retry message instead of using potentially outdated values.

## Calculation documentation

The complete Value Calculator and Mutation Finder formulas, symbols, rounding behavior, and numerical solution are documented in **[CALCULATIONS.md](./CALCULATIONS.md)**.

## Project structure

```text
index.html                 Value Calculator
mutationCalculator.html    Mutation Finder and guide
css/style.css              Shared responsive design
js/shared.js               Live mutation loading and shared controls
js/script.js               Forward value calculation
js/reverseCalc.js          Reverse calculation and guide behavior
CALCULATIONS.md             Formula reference
```

## Feedback

Found an incorrect value, missing mutation, bug, or have an idea for improvement? Open an **[Issue](https://github.com/vantacry/Storage-Hunters-Open-World-Calculator/issues/new)**.

## Credits

- **Creator:** [Vantacry](https://guns.lol/vantacry)
- **Contributor:** [FieryWolfLevi](https://github.com/FieryWolfLevi)
- **Game:** [Storage Hunters: Open World](https://www.roblox.com/games/98800969324557/Storage-Hunters-Open-World)

See [CHANGELOG.md](./CHANGELOG.md) for version history.
