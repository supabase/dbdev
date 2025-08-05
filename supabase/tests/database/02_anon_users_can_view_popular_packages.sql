begin;

select plan(1);

select tests.clear_authentication();

select results_eq(
    $$ select package_name from public.popular_packages() order by package_name $$,
    $$ values
        ('burggraf-pg_headerkit'),
        ('langchain-embedding_search'),
        ('langchain-hybrid_search'),
        ('michelp-adminpack'),
        ('olirice-asciiplot'),
        ('olirice-index_advisor'),
        ('olirice-read_once')
    $$,
    'Anon can view popular packages'
);

select * from finish();

rollback;
