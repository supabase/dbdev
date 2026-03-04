create domain app.valid_name as extensions.citext
    check ((VALUE OPERATOR(extensions.~) '^[A-z][A-z0-9\_]{2,32}$'::extensions.citext));