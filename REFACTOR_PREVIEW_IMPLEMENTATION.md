# Real Code Refactor Preview Implementation

## Overview

Qualioro now generates **actual refactored code** based on inspected file content, not placeholder templates or generic comments. The refactor preview component integrates with the Inspect File workflow to show concrete improvements.

## Architecture

### Components

1. **RefactorPreview Component** (`components/refactor-preview.tsx`)
   - Accepts actual file content and structural findings
   - Extracts code snippet from file using line numbers (from StructuralFinding.lineRange)
   - Generates language-aware refactor suggestions
   - Displays: Original Code → Improved Version → Explanation

2. **FileViewer Integration** (`components/file-viewer.tsx`)
   - Each structural finding now has a "Show Refactor" button
   - Clicking toggles RefactorPreview display
   - Passes actual file content to RefactorPreview component
   - Language is auto-detected from file path

3. **Code Structure Analyzer** (`lib/code-structure-analyzer.ts`)
   - Provides structural findings with exact line ranges
   - Data is used by RefactorPreview to extract code snippets
   - No fabricated line numbers - all references from parsed code analysis

## Refactor Suggestion Logic

### By Finding Type

#### Nesting Depth Issues
- **Original**: Displays actual nested conditions from file
- **Improved**: Shows extracted helper functions with appropriate indentation levels
- **Explanation**: Explains how reducing nesting improves readability and error handling

#### Complexity Issues
- **Original**: Shows complex function from file
- **Improved**: Suggests splitting into smaller, single-purpose functions
- **Explanation**: Details how breaking responsibilities improves testing and maintenance

#### Function Size Issues
- **Original**: Shows oversized function (>50 LOC)
- **Improved**: Proposes splitting into logically separate functions
- **Explanation**: Explains the benefit of shorter, focused functions

#### Dead Code
- **Original**: Shows potentially unused code
- **Improved**: Suggests removal after verification
- **Explanation**: Warns about maintenance burden of dead code

### Language Support

The component provides language-aware suggestions for:
- **TypeScript/JavaScript**: Uses `function` syntax, arrow functions, const/let
- **Python**: Uses `def` syntax, proper Python indentation, snake_case naming

## Workflow Integration

```
User View Recommendation
  ↓
Click "Inspect File"
  ↓
FileViewer loads actual file content
  ↓
Structural findings displayed with line numbers and evidence
  ↓
User clicks "Show Refactor" on a finding
  ↓
RefactorPreview extracts code from specified lines
  ↓
Generate language-aware refactored version
  ↓
Display original → improved → explanation
  ↓
User can copy improved code snippet
```

## Key Features

✅ **No Placeholders**: All code is generated from actual file content
✅ **Evidence-Based**: Line ranges come from structural analysis, not guessed
✅ **Language-Aware**: Suggestions respect syntax of detected language
✅ **Copy-Friendly**: Both original and improved snippets can be copied
✅ **Expandable Explanation**: Detailed reasoning for each refactor
✅ **Integrated Finding Details**: Shows what was detected and why

## Implementation Details

### Code Extraction
```typescript
const lines = fileContent.split("\n")
const originalSnippet = lines
  .slice(finding.lineRange.start - 1, finding.lineRange.end)
  .join("\n")
```

### Refactor Generation Process
1. Detect finding type from StructuralFinding.type
2. Call appropriate generator function (generateNestingRefactor, etc.)
3. Pass language type to ensure syntax correctness
4. Return { original, improved, explanation }

### UI Structure
```
[Finding Detail Card]
  - Lines X-Y: Issue Type
  - Evidence from analysis
  - [Show Refactor Button]
    ↓ [Toggle]
    [Refactor Preview]
      - Original Code (red background)
      - Improved Version (green background)
      - [Explanation Button (expandable)]
      - [Copy buttons for each snippet]
      - Finding details metadata
```

## Validation Rules

The implementation ensures:
1. **No generic templates** - All suggestions are based on actual code structure
2. **Accurate line references** - Extracted from LineRange in findings
3. **Language-specific syntax** - Uses appropriate language constructs
4. **Clear explanations** - Each refactor explains the benefit
5. **Copy functionality** - Both code snippets can be copied to clipboard

## Testing Coverage

### Python Example
- Detects nested conditionals in Python code
- Suggests extraction into named functions (def)
- Shows proper Python indentation in improved version
- Explains single responsibility principle

### TypeScript/JavaScript Example
- Detects complex conditions in TS/JS code
- Suggests extraction into named functions or helper functions
- Uses appropriate JS/TS syntax conventions
- References specific improvements (readability, testability)

## File Structure

```
components/
  ├── refactor-preview.tsx          # New component
  ├── file-viewer.tsx               # Updated with integration
  └── recommendation-modal.tsx      # Uses FileViewer
  
lib/
  └── code-structure-analyzer.ts    # Provides findings with line ranges
```

## Future Enhancements

- Diff-style display (side-by-side highlighted changes)
- Interactive suggestion selection
- Metrics showing complexity reduction (before/after)
- Direct apply-to-file functionality
- Multiple refactor alternatives for same issue

## Breaking Changes

None. The refactor preview is additive - it doesn't change existing functionality.

## Status

✅ **COMPLETE** - Refactor preview fully integrated with real code extraction and no placeholder comments.
