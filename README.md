# Flowjob web

## Authors 
- **Timur Koshelev**
- **Tomash Nedved**

---

## Project Idea
Flowjob is a web-based administration panel for managing a Discord bot with administrator rights on a Discord server.  
The website allows administrators to create, edit, and manage tasks that are then distributed and evaluated through the Discord bot.

---

## Technology Stack

### Frontend
- **React**  
*Building the admin panel interface, forms, tables, and UI state

- **Vite**  
  Fast development server and project bundling

- **React Query**  
  Handling REST API requests, data caching, and automatic updates for tasks and submissions

- **TypeScript**  
  API contract typing, role and state validation, and prevention of runtime errors

---

### Backend
- **PostgreSQL**  
  Storing tasks, submissions, users, and evaluation results

- **Redis**  
  Caching and submission evaluation queue

- **REST API**  
  Communication between the website, Discord bot, and evaluation server

- **Docker**  
  Service isolation and reproducible deployment

- **CI/CD**  
  Automated build and deployment pipeline

- **Cloudflared**  
  Secure server access without exposing a public IP address

- **Discord OAuth**  
  Administrator authentication via Discord

---

## API Endpoints  
*(Can be edited later)*

### Tasks
```http
GET     /tasks
POST    /tasks
PATCH   /tasks/:id
DELETE  /tasks/:id
```
### Submissions
```
POST    /submissions
GET     /submissions/:id
GET     /submissions?taskId=
```
### Bot
```
GET     /bot/tasks
POST    /bot/submit
GET     /bot/result/:submissionId
```
😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈😈