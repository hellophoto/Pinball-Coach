import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Save the file. Then we need to create a `.env.local` file in the **root** of the project (not inside `src` — at the same level as `package.json`). 

Right-click on the root of the project in the file tree, create a new file called `.env.local`, and paste this in:
```
VITE_SUPABASE_URL=https://krymopzgdmvzaunkvcxm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_EnYshT8nKVxBR_10wDiv5g_6BarBkab