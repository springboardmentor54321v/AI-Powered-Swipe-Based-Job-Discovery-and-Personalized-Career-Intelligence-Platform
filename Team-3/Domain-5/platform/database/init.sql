-- Shared local-development database bootstrap.
-- Intern 1 owns users/roles; Intern 2 owns company/job/swipe migrations.
-- Keep this file limited to extensions and cross-service prerequisites.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
