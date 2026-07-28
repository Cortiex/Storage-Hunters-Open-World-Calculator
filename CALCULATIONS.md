# Calculation Reference

This document describes the formulas used by the **Storage Hunters: Open World Calculator** and its **Mutation Finder**.

## Symbols

| Symbol | Meaning |
| --- | --- |
| `B` | Base item value |
| `M` | Product of all mutation multipliers |
| `L` | Low-value markup |
| `E` | Marked-up, mutated value |
| `P` | Condition percentage from 0 to 100 |
| `F` | Minimum condition floor |
| `C` | Calculated condition factor |
| `G` | Grade multiplier |
| `T` | Total multiplier |
| `V` | Final item value |

## Value Calculator

### 1. Mutation product

All selected mutation multipliers are multiplied together:

```text
M = M1 × M2 × ... × Mn
```

With no selected mutations, `M = 1`.

### 2. Low-value markup

When no mutation is selected, `L = 1`. Otherwise:

```text
L = 25                                      when B ≤ 1
L = 25 / B^(1 - log10(2))                  when 1 < B ≤ 100
L = 1                                       when B > 100
```

The marked-up, mutated value is:

```text
E = B × L × M
```

### 3. Condition factor

The minimum condition floor depends on `E`:

```text
F = 0.6                                     when E ≥ 1000
F = 0.25 + 0.00035 × E                     when E < 1000
```

The entered condition percentage is then applied between the floor and full value:

```text
C = F + (1 - F) × (P / 100)
```

An empty condition input is treated as `100%`.

### 4. Grade and final value

```text
T = L × M × C × G
V = B × T
```

`T` is rounded to four decimal places before `V` is displayed. A tiny epsilon is subtracted from positive final values so browser rounding matches the game's handling of values ending in `.xx5`.

### Mutation selection rules

- Mint and Perfect can only be selected at exactly `100%` condition. Lowering the condition automatically removes either mutation.
- Washing mutations are mutually exclusive and cannot be combined with Dirty.
- Time Capsule mutations are mutually exclusive.

## Mutation Finder

The Mutation Finder uses the same forward formula but solves for one unknown mutation multiplier.

Additional symbols:

| Symbol | Meaning |
| --- | --- |
| `K` | Product of all known mutation multipliers |
| `U` | Unknown mutation multiplier |
| `S` | Entered sell price |

The complete mutation multiplier becomes:

```text
K = M1 × M2 × ... × Mn
M = K × U
```

The finder searches for the value of `U` that makes the normal calculator result equal the entered sell price:

```text
f(U) = V(U) - S = 0
```

### Numerical solution

The calculator uses Newton's method with a finite-difference derivative:

```text
U(next) = U - f(U) / f'(U)
```

- Initial estimate: `U = 1`
- Derivative step: `max(U × 0.0001, 0.00000001)`
- Minimum allowed estimate: `0.01`
- Stop tolerance: calculated value within `$0.005` of `S`
- Maximum iterations: `100`

When a known mutation has a multiplier range, both ends are solved and displayed as an estimated result range.

## Source files

- Forward calculation: [`js/script.js`](./js/script.js)
- Reverse calculation: [`js/reverseCalc.js`](./js/reverseCalc.js)
- Shared mutation handling: [`js/shared.js`](./js/shared.js)
