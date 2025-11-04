# Changelog

All notable changes to MediScribe will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (November 3, 2025)

#### 📚 Documentation
- **Comprehensive README.md** - Complete setup guide with architecture overview, troubleshooting, and deployment instructions
- **N8N_SETUP.md** - Detailed n8n workflow configuration guide with step-by-step instructions
- **CONTRIBUTING.md** - Contribution guidelines, coding standards, and development workflow
- **CHANGELOG.md** - Project changelog following Keep a Changelog format

#### 🔐 Security & Configuration
- **Environment variables support** - Removed hardcoded webhook URL, added `.env` configuration
- **.env.example** - Template for environment configuration
- **Updated .gitignore** - Added `.env` files to prevent credential leaks
- **vite-env.d.ts** - TypeScript definitions for environment variables

#### ✅ Validation
- **CNP validation** - Complete Romanian CNP validation with control digit verification
- **Patient name validation** - Name format and length validation
- **Audio file validation** - File type, size, and format validation
- **Form validation utilities** - Reusable validation functions in `utils/validation.ts`

#### 🎣 Custom Hooks
- **useAudioRecorder** - Extracted audio recording logic from App component
- **useAudioProcessing** - Extracted audio processing and API call logic
- Improved code organization and reusability
- Better separation of concerns

#### 🛡️ Error Handling
- **ErrorBoundary component** - React error boundary for graceful error handling
- **Improved error messages** - User-friendly error messages with clear instructions
- **Better TypeScript error types** - Proper error typing throughout the application

#### 🎨 Code Quality
- **ESLint configuration** - Code linting with TypeScript support
- **Prettier configuration** - Consistent code formatting
- **npm scripts** - Added `lint`, `lint:fix`, `format`, and `type-check` scripts
- **TypeScript improvements** - Better type definitions with JSDoc comments
- **Code refactoring** - Cleaner, more maintainable code structure

#### 📦 New Files Structure
```
MediScribe/
├── components/
│   └── ErrorBoundary.tsx      (NEW)
├── hooks/
│   ├── useAudioRecorder.ts    (NEW)
│   └── useAudioProcessing.ts  (NEW)
├── utils/
│   └── validation.ts          (NEW)
├── constants.ts               (NEW)
├── vite-env.d.ts              (NEW)
├── .env.example               (NEW)
├── .eslintrc.json             (NEW)
├── .prettierrc                (NEW)
├── README.md                  (UPDATED)
├── N8N_SETUP.md               (NEW)
├── CONTRIBUTING.md            (NEW)
└── CHANGELOG.md               (NEW)
```

#### 📊 Type System Improvements
- **Enhanced type definitions** - Comprehensive JSDoc comments for all interfaces
- **New utility types** - `TranscriptionMetadata`, `SpeakerSegment`, `ErrorResponse`, `RequestState`, `FieldValidation`
- **Better type safety** - Removed `any` types where possible
- **Documented types** - All interfaces now have clear documentation

#### 🔧 Constants & Configuration
- **Application constants** - Centralized configuration in `constants.ts`
- **Audio constraints** - Configurable recording settings
- **Validation rules** - Centralized validation patterns and limits
- **Error messages** - Reusable error message constants
- **Romanian county codes** - Complete list for CNP validation

### Changed

#### 🔨 Refactoring
- **App.tsx** - Reduced from 285 lines to 250 lines by extracting hooks
- **Improved component structure** - Better separation of state and logic
- **Cleaner imports** - Organized imports by type (React, types, components, hooks, utils)
- **Better state management** - Combined error states from multiple sources

#### 📝 Code Style
- **Consistent formatting** - Applied Prettier rules across all files
- **Better variable naming** - More descriptive names following conventions
- **Improved comments** - Added JSDoc comments to complex functions

#### 🎯 Developer Experience
- **Better error messages** - Clear, actionable error descriptions
- **Development scripts** - Easy access to linting and formatting tools
- **Type checking** - TypeScript strict mode enabled

### Fixed

#### 🐛 Bug Fixes
- **Stale closure issue** - Fixed `useCallback` dependencies in hooks
- **Error handling** - Proper error types instead of `any`
- **Validation timing** - Clear validation errors when user types

#### 🔒 Security
- **Removed hardcoded credentials** - Moved to environment variables
- **Sanitized inputs** - Added validation before processing
- **Better CORS handling** - Improved API error responses

### Deprecated

None

### Removed

- **Hardcoded webhook URL** - Now uses environment variable

### Security

- **Environment variable support** - Credentials no longer in source code
- **Input validation** - All user inputs are validated before processing
- **Updated .gitignore** - Prevents committing sensitive files

---

## [0.0.0] - Initial Release

### Added

- Audio recording functionality
- File upload support
- Speaker diarization integration
- SOAP report generation with Gemini AI
- Google Sheets logging
- Dark mode support
- Editable medical reports
- Prescription printing with signature
- ICD-10 code suggestions
- Medical alerts detection
- Romanian language support

### Tech Stack

- React 19 with TypeScript
- Vite build tool
- Tailwind CSS for styling
- n8n workflow automation
- Deepgram for transcription
- Google Gemini for AI analysis

---

## Upgrade Guide

### From 0.0.0 to Unreleased

#### Breaking Changes

**Environment Variables Required**

The webhook URL is no longer hardcoded. You must create a `.env` file:

1. Copy `.env.example` to `.env`
2. Add your n8n webhook URL:
   ```env
   VITE_N8N_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/medical-assistant
   ```
3. Restart the development server

#### New Features Available

**Form Validation**

Patient name and CNP are now validated before submission. Invalid inputs will show clear error messages.

**Error Boundary**

The app now has an error boundary that catches React errors and displays a user-friendly error page.

**Development Tools**

New npm scripts available:
```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
npm run format      # Format code with Prettier
npm run type-check  # Check TypeScript types
```

#### Recommended Actions

1. **Update dependencies** - Run `npm install` to get new dev dependencies
2. **Set up environment** - Create `.env` file from `.env.example`
3. **Review documentation** - Check new README.md and N8N_SETUP.md
4. **Enable linting** - Configure your editor to use ESLint and Prettier
5. **Update n8n workflow** - Ensure your workflow matches the documented structure

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

- 🐛 [Report bugs](https://github.com/gsmmediaro/MediScribe/issues)
- 💡 [Request features](https://github.com/gsmmediaro/MediScribe/issues)
- 📧 [Email support](mailto:support@mediscribe.ro)

---

**Legend:**
- 📚 Documentation
- 🔐 Security
- ✅ Validation
- 🎣 Hooks
- 🛡️ Error Handling
- 🎨 Code Quality
- 🔨 Refactoring
- 🐛 Bug Fixes
- 🔧 Configuration

