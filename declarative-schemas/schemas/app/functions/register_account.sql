create function app.register_account()
    returns trigger
    language plpgsql
    security definer
    AS $function$
    begin
        insert into app.handle_registry (handle, is_organization)
          values (
            new.raw_user_meta_data ->> 'handle',
            false
          );

        insert into app.accounts (id, handle, display_name, bio, contact_email)
          values (
            new.id,
            new.raw_user_meta_data ->> 'handle',
            new.raw_user_meta_data ->> 'display_name',
            new.raw_user_meta_data ->> 'bio',
            new.raw_user_meta_data ->> 'contact_email'
          );
          return new;
    end;
    $function$;