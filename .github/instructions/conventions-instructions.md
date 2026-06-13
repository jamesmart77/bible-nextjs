# Conventions Instructions

## Security

## Infrastructure

## Application Setup
- NextJs pages always are under the /app folder path with their own sub-folder and delineated with a `page.tsx` component
    - Associated React components should be within the `/app/components` folder and should have an associated sub-folder that aligns with the page name
        - For example: `/app/privacy/page.tsx` has any associated components within the `/app/components/privacy/**` folder.
- Components that are used in multiple pages should be within the `/components/common/` folder

## React
- All React components should start with an uppercase and be camel cased