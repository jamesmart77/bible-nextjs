ALTER TABLE search_history
    DROP CONSTRAINT IF EXISTS search_history_querytype_check,
    ADD CONSTRAINT search_history_querytype_check
    CHECK (queryType IN ('passage', 'ai', 'keyword'));