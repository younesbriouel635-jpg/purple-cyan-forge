# App Architect AI

Project Name: Revliskit AI Role: Senior SaaS Developer & UI/UX Designer

Task: Build a high-end, modern AI App Generation Platform called "Revliskit". The platform should be a direct competitor to Lovable and Bolt.new.

1. Visual Identity:

Theme: Dark mode by default. Use a premium aesthetic with "Electric Purple" and "Deep Cyan" accents.

Style: Clean, minimalist, and professional. Use Glassmorphism effects for cards and sidebars.

Components: Use Shadcn/UI for all elements (Buttons, Inputs, Modals).

2. Core Pages & Structure:

Landing Page: A stunning hero section with a large, glowing input field that says "What kind of app do you want to build today?". Include a "Features" section and a "Pricing" table.

App Dashboard: A grid view showing "My Projects" with thumbnails and status badges (e.g., "Deployed", "Draft").

The Builder Interface: A split-screen view. On the left, a chat interface to talk to the AI. On the right, a live preview area for the generated code/app.

Pricing Page: 3 tiers: Free (1 app), Pro ($29/mo - Unlimited), and Agency ($99/mo).

3. Functional Elements (Frontend Logic):

Idea Input: The main input should have a "Generate" button that triggers a cool AI loading animation.

Sidebar Navigation: Projects, Templates, Credits, Settings, and Help Center.

User Profile: A section to manage API keys (OpenAI/Anthropic) and subscription status.

4. Tech Stack to simulate:

Framework: Next.js + Tailwind CSS.

Icons: Lucide React.

Interactive Elements: Framer Motion for smooth transitions.

Instructions: "I want the UI to be extremely intuitive. When a user types an idea, the UI should simulate the AI 'thinking' and 'architecting' the app. Make sure the landing page looks like a billion-dollar startup "Scale Requirement: Architect the frontend and backend logic to handle 10,000+ concurrent users using optimized state management and scalable database schemas."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/22864b69-1786-4528-bdac-56e4081b7c8b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
