1. Timur Koshelev and Tomash Nedved
2. The idea is a website for managing a Discord bot with admin rights on the Discord server. Adding and editing tasks on the website.
3. Stack:
    Frontend:
        React - building the admin panel interface, forms, tables, and UI state
        Vite - fast development server and project bundling
        React Query - handling REST API requests, data caching, and automatic updates for tasks and submissions
        TypeScript - API contract typing, role and state validation, and prevention of runtime errors
    Backend:
        PostgreSQL - storing tasks, submissions, users, and evaluation results
        Redis - caching and submission evaluation queue
        REST API - communication between the website, Discord bot, and evaluation server
        Docker - service isolation and reproducible deployment
        CI/CD - automated build and deployment pipeline
        Cloudflared - secure server access without exposing a public IP address
        discord OAuth - administrator authentication via Discord
    Endpoints(can be edited later):
    Tasks:
        GET     /tasks
        POST    /tasks
        PATCH     /tasks/:id
        DELETE  /tasks/:id

    Submissions:
        POST    /submissions
        GET     /submissions/:id
        GET     /submissions?taskId=

    Bot:
        GET     /bot/tasks
        POST    /bot/submit
        GET     /bot/result/:submissionId