-- Ensure existing expense records use a valid category value
UPDATE expense
SET category = 'OTHER'
WHERE category IS NULL OR category = '';
