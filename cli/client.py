import os
from supabase import create_client, Client

url: str = 'https://fvffnnllxofpxpatjood.supabase.co'
key: str = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMTQ1ODI3OSwiZXhwIjoxOTM3MDM0Mjc5fQ.juN4zhkeFO7G9EVkzZh79x6ideLNdg8rn-lyGUylp44'

client: Client = create_client(url, key)

resp = client.rpc(
    fn='graphql',
    params={
        "operationName": "Dummy",
        "query": """{ account(nodeId: "WyJhY2NvdW50IiwgMV0=") { id } }""",
        "variables": {},
    }
)

print(resp)
import pdb; pdb.set_trace()


for row in client.table('blog').select('*').execute():
    print(row)
