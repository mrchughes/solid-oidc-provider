/**
 * Utility functions for GOV.UK Design System integration
 */

/**
 * Generate breadcrumbs HTML for GOV.UK Design System
 * @param {Array} items - Array of breadcrumb items with text and href properties
 * @returns {string} HTML for breadcrumbs
 */
function generateBreadcrumbs(items = []) {
    if (!items.length) return '';

    const breadcrumbItems = items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (isLast) {
            return `<li class="govuk-breadcrumbs__list-item" aria-current="page">${item.text}</li>`;
        }

        return `<li class="govuk-breadcrumbs__list-item">
      <a class="govuk-breadcrumbs__link" href="${item.href}">${item.text}</a>
    </li>`;
    }).join('\n');

    return `
    <div class="govuk-breadcrumbs">
      <ol class="govuk-breadcrumbs__list">
        ${breadcrumbItems}
      </ol>
    </div>
  `;
}

/**
 * Generate a button HTML for GOV.UK Design System
 * @param {object} options - Button options
 * @param {string} options.text - Button text
 * @param {string} options.href - Button link (optional, if not provided it's a submit button)
 * @param {string} options.classes - Additional CSS classes
 * @param {boolean} options.isStart - Whether it's a start button
 * @param {boolean} options.isSecondary - Whether it's a secondary button
 * @param {boolean} options.isWarning - Whether it's a warning button
 * @param {string} options.name - Button name attribute (for form buttons)
 * @param {string} options.value - Button value attribute (for form buttons)
 * @returns {string} HTML for button
 */
function generateButton(options) {
    const {
        text,
        href,
        classes = '',
        isStart = false,
        isSecondary = false,
        isWarning = false,
        name,
        value
    } = options;

    let buttonClasses = 'govuk-button';

    if (isSecondary) buttonClasses += ' govuk-button--secondary';
    if (isWarning) buttonClasses += ' govuk-button--warning';
    if (classes) buttonClasses += ` ${classes}`;

    const startIcon = isStart ? `
    <svg class="govuk-button__start-icon" xmlns="http://www.w3.org/2000/svg" width="17.5" height="19" viewBox="0 0 33 40" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
    </svg>
  ` : '';

    const nameAttr = name ? `name="${name}"` : '';
    const valueAttr = value ? `value="${value}"` : '';

    if (href) {
        return `
      <a href="${href}" role="button" draggable="false" class="${buttonClasses} ${isStart ? 'govuk-button--start' : ''}" data-module="govuk-button">
        ${text}
        ${startIcon}
      </a>
    `;
    }

    return `
    <button class="${buttonClasses} ${isStart ? 'govuk-button--start' : ''}" data-module="govuk-button" ${nameAttr} ${valueAttr}>
      ${text}
      ${startIcon}
    </button>
  `;
}

/**
 * Generate error summary HTML for GOV.UK Design System
 * @param {object} errors - Object containing error messages
 * @returns {string} HTML for error summary
 */
function generateErrorSummary(errors) {
    if (!errors || Object.keys(errors).length === 0) return '';

    const errorItems = Object.entries(errors).map(([field, message]) => {
        return `<li><a href="#${field}">${message}</a></li>`;
    }).join('\n');

    return `
    <div class="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabindex="-1" data-module="govuk-error-summary">
      <h2 class="govuk-error-summary__title" id="error-summary-title">
        There is a problem
      </h2>
      <div class="govuk-error-summary__body">
        <ul class="govuk-list govuk-error-summary__list">
          ${errorItems}
        </ul>
      </div>
    </div>
  `;
}

/**
 * Format a date according to GOV.UK Design System guidelines
 * @param {Date|string} date - Date to format
 * @param {string} format - Format to use (short, medium, long)
 * @returns {string} Formatted date
 */
function formatDate(date, format = 'medium') {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
        return '';
    }

    const options = {
        short: { day: 'numeric', month: 'short', year: 'numeric' },
        medium: { day: 'numeric', month: 'long', year: 'numeric' },
        long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        time: { hour: 'numeric', minute: 'numeric' },
        full: {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        }
    };

    return d.toLocaleDateString('en-GB', options[format] || options.medium);
}

module.exports = {
    generateBreadcrumbs,
    generateButton,
    generateErrorSummary,
    formatDate
};
