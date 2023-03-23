create extension if not exists citext with schema extensions;

create domain app.valid_name
    as extensions.citext
    check (
        -- 3 to 15 chars, A-z with underscores
        value ~ '^[A-z][A-z0-9\_]{2,30}$'
);
