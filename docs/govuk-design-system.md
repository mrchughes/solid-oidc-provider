# GOV.UK Design System Integration

This document describes how the GOV.UK Design System is integrated into the Solid OIDC Provider.

## Overview

The Solid OIDC Provider uses the GOV.UK Design System to provide a consistent and accessible user interface. The integration includes:

- GOV.UK Frontend styles and components
- Responsive design for all screen sizes
- Accessibility compliance with WCAG 2.1 AA standards
- Form validation following GOV.UK patterns
- Error handling and messaging

## Setup

The GOV.UK Design System assets are not included in the repository. To set up the assets, run:

```bash
npm run setup-govuk
```

This script will download the latest version of the GOV.UK Frontend and extract the necessary assets to the project's public directory.

## Directory Structure

- `public/assets/css` - GOV.UK Frontend CSS
- `public/assets/js` - GOV.UK Frontend JavaScript
- `public/assets/fonts` - GOV.UK Frontend fonts
- `public/assets/images` - GOV.UK Frontend images and icons

## Templates

All templates use EJS and follow the GOV.UK Design System patterns. Key templates include:

- `views/layout.ejs` - Main layout template with GOV.UK header and footer
- `views/login.ejs` - Sign in page
- `views/register.ejs` - Registration page
- `views/reset-password.ejs` - Password reset request page
- `views/change-password.ejs` - Change password page
- `views/consent.ejs` - Application authorization consent page
- `views/profile.ejs` - User profile page
- `views/manage-applications.ejs` - Application management page
- `views/active-sessions.ejs` - Session management page
- `views/two-factor-setup.ejs` - Two-factor authentication setup page
- `views/two-factor-verify.ejs` - Two-factor authentication verification page
- `views/session-timeout.ejs` - Session timeout warning page
- `views/session-expired.ejs` - Session expired page
- `views/account-locked.ejs` - Account locked page

## Components

The following GOV.UK Design System components are used:

- Typography
- Buttons
- Error summary
- Radios
- Checkboxes
- Text inputs
- Details
- Panels
- Notification banners
- Breadcrumbs
- Tables
- Tabs
- Warning text

## Helpers

Helper functions for GOV.UK Design System are available in:

- `src/utils/govuk.js` - Utility functions for GOV.UK components
- `src/utils/validation.js` - Form validation following GOV.UK patterns

## Form Validation

Form validation follows the GOV.UK Design System patterns:

1. Server-side validation is always used
2. Errors are displayed at the top of the page in an error summary
3. Errors are displayed inline next to the relevant form field
4. Error messages are clear and concise
5. Error states are visually indicated

## Accessibility

The integration follows WCAG 2.1 AA standards:

- Proper heading structure
- ARIA attributes where needed
- Keyboard navigation
- Color contrast compliance
- Screen reader compatibility
- Focus indication

## References

- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [GOV.UK Frontend](https://github.com/alphagov/govuk-frontend)
- [Form Validation Patterns](https://design-system.service.gov.uk/patterns/validation/)
- [Error Messages](https://design-system.service.gov.uk/components/error-message/)
- [Error Summary](https://design-system.service.gov.uk/components/error-summary/)
