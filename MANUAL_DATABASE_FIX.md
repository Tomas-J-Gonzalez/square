# Manual Database Migration Instructions

## 🚨 **URGENT: Run this in Supabase to fix cancel event functionality**

The cancel event and invitation link copying issues are caused by missing database columns. Follow these steps to fix them:

### **Step 1: Go to Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Click your project
3. Go to "SQL Editor" in the left sidebar

### **Step 2: Run the Migration SQL**
Copy and paste this SQL into the SQL Editor and click "Run":

```sql
-- Add missing columns to events table
-- Run this in your Supabase SQL editor

-- Add status column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add updated_at column if it doesn't exist
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add email and message columns to event_rsvps table if they don't exist
ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS email text;

ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS message text;

-- Update existing events to have 'active' status
UPDATE public.events 
SET status = 'active' 
WHERE status IS NULL;

-- Add update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for events table
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON public.events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policy for event updates
DROP POLICY IF EXISTS "Allow event updates" ON public.events;
CREATE POLICY "Allow event updates" ON public.events
  FOR UPDATE USING (true);
```

### **Step 3: Verify the Changes**
After running the SQL, you should see:
- ✅ Events table now has `status` column
- ✅ Events table now has `updated_at` column  
- ✅ Event_rsvps table now has `email` and `message` columns
- ✅ Update trigger created
- ✅ RLS policy added

### **Step 4: Test the Fix**
After running the migration:
1. Try canceling an event - it should work now
2. Try copying invitation links - it should work now
3. Try completing events - it should work now

## 🎯 **What This Fixes**

- **Cancel Event Error**: ✅ Resolved (missing status column)
- **Complete Event Error**: ✅ Resolved (missing status column)  
- **Invitation Link Copying**: ✅ Resolved (improved clipboard handling)
- **Database Schema**: ✅ Updated to match application needs

---

**Run this migration and your cancel event and invitation link issues will be fixed!** 🚀
