# Database Migration Instructions

## Issue: "Failed to submit issue" Error

If you're seeing "Failed to submit issue" errors, it's likely because the database migration for priority and classification fields hasn't been applied yet.

## Solution

### Option 1: Apply Migration via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/20260103183459_add_priority_and_classification.sql`
4. Copy and paste the entire SQL content into the SQL Editor
5. Click **Run** to execute the migration

### Option 2: Apply Migration via Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

This will apply all pending migrations.

### Option 3: Manual Application

If you prefer to apply manually, the migration adds:
- `priority` column (TEXT with CHECK constraint)
- `classification_confidence` column (NUMERIC)
- `classification_explanation` column (TEXT)
- `auto_classified` column (BOOLEAN)
- Database functions and triggers for default priority assignment

## Current Behavior

The application is now resilient and will work **with or without** the migration:

- **With migration**: Full NLP classification and priority assignment features
- **Without migration**: Basic issue submission still works, but without priority/classification

The code automatically detects if the columns exist and adapts accordingly.

## Verification

After applying the migration, you can verify it worked by:

1. Submitting a test issue
2. Checking the browser console - you should see classification results
3. The issue should be submitted successfully with priority assigned

## Troubleshooting

If you still see errors after applying the migration:

1. Check the browser console for detailed error messages
2. Verify the migration was applied successfully in Supabase dashboard
3. Check that your Supabase connection is working properly
4. Ensure you have the correct permissions to modify the database schema



