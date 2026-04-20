# HyperRescue (Emergency Resource Finder) 🚨

HyperRescue is a real-time, hyperlocal emergency response web application designed to instantly connect people in critical need with nearby volunteers.

Built with a focus on speed and reliability, the platform allows users to broadcast location-based SOS alerts for urgent resources such as blood, oxygen, or medical assistance. Using advanced geospatial queries, the system instantly notifies registered volunteers within the vicinity, bypassing the delays of traditional emergency dispatch systems.

🌟 **Live Demo:** [https://webdev-react-project-amber.vercel.app/](https://webdev-react-project-amber.vercel.app/)

![HyperRescue Preview](https://via.placeholder.com/1000x500.png?text=HyperRescue+Dashboard) <!-- Replace with actual screenshot later -->

## Key Features

- **Live Interactive Dashboard**: A real-time command center featuring a sleek Dark Mode map that visualizes active emergencies around the user's current location.
- **Volunteer Kanban System**: A dynamic, synchronized task board that allows responders to accept, track, and complete missions. Status changes update instantly across all active clients.
- **Hyperlocal Matching**: Utilizes precise geolocation to filter out irrelevant noise, ensuring volunteers only see actionable alerts within a 20km radius.
- **Secure Authentication & Profiles**: Built-in user management with role-based access control, availability toggling, and blood type tracking.
- **Premium Dark Mode UI**: A highly modern, immersive aesthetic utilizing glassmorphism and tailored slate color palettes.

## Tech Stack

### Frontend
- **React.js (Vite)**: Fast, modern UI development.
- **Tailwind CSS**: Utility-first styling for the premium Dark Mode aesthetic.
- **React-Leaflet**: Interactive map rendering using CartoDB Dark Matter tiles.
- **React Router**: Seamless Single Page Application (SPA) navigation.
- **Lucide React**: Clean, modern iconography.

### Backend & Database
- **Supabase**: Open-source Firebase alternative.
- **PostgreSQL**: Highly reliable relational database.
- **PostGIS**: Advanced database extension used for complex geospatial distance calculations (`ST_Distance`, `ST_DWithin`).
- **Supabase Realtime**: WebSocket-based subscriptions to instantly sync the Kanban board and map across all browsers.

## Architecture & Database Security
The application leverages Supabase's **Row Level Security (RLS)** to ensure data privacy and integrity:
- Users can only create emergency requests for themselves.
- Volunteers can only accept and resolve emergencies through the secure `request_responses` linking table.
- Volunteers cannot maliciously mark an emergency as resolved unless they have officially accepted the task.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase Project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Somya1503/webdev-react-project.git
   cd webdev-react-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Database Setup:
   Run the SQL provided in `supabase_setup.sql` in your Supabase SQL Editor to create the necessary tables, functions, and RLS policies.

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment
This project is configured for seamless deployment on **Vercel**. Ensure that you add the Supabase Environment Variables to your Vercel project settings during deployment.
