/**
 * Flash message middleware
 * Makes flash messages available to all views
 */

function flashMessages(req, res, next) {
    // Make flash messages available to all views
    res.locals.flash = {
        success: req.flash('success'),
        error: req.flash('error'),
        info: req.flash('info'),
        warning: req.flash('warning')
    };

    next();
};

module.exports = flashMessages;
