create domain app.semver as app.semver_struct
    check (app.is_valid(VALUE));