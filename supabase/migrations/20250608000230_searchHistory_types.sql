ALTER TABLE search_history
ADD COLUMN queryType VARCHAR(10) NOT NULL CHECK (queryType IN ('passage', 'ai')),
ADD COLUMN queryRes TEXT;