create function app.register_organization_creator_as_member()
    returns trigger
    language plpgsql
    security definer
    AS $function$
    begin
        insert into app.members(organization_id, account_id, role)
        values (new.id, auth.uid(), 'maintainer');

        return new;
    end;
    $function$;