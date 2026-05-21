# Code Generator & AI Suggestions Feature

## Overview

Qualioro now includes an intelligent code generator that provides AI-powered suggestions to improve code quality based on identified issues. Users can generate improvement suggestions, copy code examples, and download enhanced code directly from the app.

## Features

### 1. AI-Powered Code Suggestions
- Generates improvement suggestions for any identified code quality issue
- Provides contextual analysis based on the specific metric
- Includes code examples for common issues like complexity, test coverage, and maintainability

### 2. Code Generation & Export
- **Generate Button**: Create improvement suggestions on-demand
- **Copy to Clipboard**: Easily copy generated code
- **Download**: Export suggestions as a file for integration into your project

### 3. Dynamic Code Examples
The system provides specialized suggestions for:
- **Code Complexity**: Refactoring patterns to reduce cyclomatic complexity
- **Test Coverage**: Unit and integration test examples
- **Bug Density**: Code review and testing best practices
- **Maintainability**: Documentation and naming convention improvements

## How to Use

### Accessing Code Suggestions

1. Open a recommendation from the Quality Predictor
2. Scroll to "AI-Powered Code Improvements"
3. Click "Generate AI Suggestions"
4. Review the generated suggestions and code examples

### Copying and Using Generated Code

```typescript
// Example flow:
1. View the generated code in the modal
2. Click "Copy" to copy to clipboard
3. Paste into your IDE
4. Review and adapt to your codebase
5. Test thoroughly before deployment
```

### Downloading Suggestions

1. Click "Download" to save suggestions as a file
2. File format: `.txt` with clear sections and code blocks
3. Use in code reviews or team discussions

## Implementation Details

### Components

#### `CodeGenerator` Component
Located in `components/code-generator.tsx`
- Manages code generation state
- Handles copying and file downloads
- Provides UI for viewing suggestions

#### Enhanced `Recommendation` Type
- Added optional `filePath` property for source file references
- Supports file inspection and code review features

### API Integration

The code generator includes:
- **Template-based suggestions**: Works without external AI APIs
- **Framework for AI integration**: Ready to integrate with OpenAI, Anthropic, or other providers
- **Graceful degradation**: Provides helpful suggestions even without API access

## Future Enhancements

### Planned Features

1. **AI API Integration**
   - Connect to OpenAI API for advanced suggestions
   - Support for multiple AI providers
   - Context-aware code improvements

2. **File Path Detection**
   - Automatic detection of problematic files
   - Direct code inspection integration
   - Real-time code analysis

3. **Code Upload & Analysis**
   - Users can paste code directly
   - AI analysis of custom code snippets
   - Integration with git workflows

4. **Collaborative Features**
   - Share suggestions with team members
   - Code review comments
   - Team-based improvement tracking

## Supported Languages

The code generator includes examples for:
- TypeScript/JavaScript
- Python
- Java
- C++
- C#
- Go
- Rust

And can be extended to support additional languages.

## Error Handling

### File Not Found Issues
If the "Code Review" section shows "File not found":
- Verify the file path is correct
- Check the file exists in the repository
- Confirm you're using the correct branch
- Use "AI-Powered Code Improvements" as an alternative

### API Errors
- Rate limiting: Wait a few moments before retrying
- Network issues: Check your connection
- Invalid paths: Verify repository and file paths

## Best Practices

1. **Review Generated Code**: Always review suggestions before applying
2. **Test Changes**: Run tests after applying improvements
3. **Understand Changes**: Read the explanation before accepting modifications
4. **Iterate**: Use multiple suggestions to incrementally improve code quality
5. **Document**: Record improvements made and lessons learned

## Configuration

### Customizing Suggestions

To customize code suggestions, modify the helper functions in `code-generator.tsx`:
- `getSuggestionText()`: Update suggestion content
- `getCodeExample()`: Add new language examples
- `generateCodeSuggestions()`: Customize suggestion format

### Adding Language Support

```typescript
// Add to getFileExtension()
const extensions: Record<string, string> = {
  // ... existing languages
  "kotlin": "kt",
  "swift": "swift",
}

// Add to getCodeExample()
const examples: Record<string, string> = {
  // ... existing examples
  "Code Complexity": `// Kotlin example...`,
}
```

## Troubleshooting

### Suggestions Not Generating
- Check browser console for errors
- Verify JavaScript is enabled
- Try refreshing the page

### File Inspector Shows Errors
- Verify GitHub API token has proper permissions
- Check repository is public or you have access
- Ensure file path is correct

### Downloaded Files Are Empty
- Check browser downloads folder
- Verify pop-ups are not blocked
- Try copying instead and pasting manually

## Support

For issues or feature requests:
1. Check the troubleshooting section above
2. Review generated code carefully before applying
3. Contact the Qualioro team for advanced support
