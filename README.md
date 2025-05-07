# AI Portfolio Chatbot

This project is an AI-powered portfolio assistant I built to help others explore my work, skills, and journey into tech through natural conversation.

Instead of sending a static resume, I wanted something interactive—something that could advocate for me. The assistant speaks confidently on my behalf, sharing what I’ve built, why it matters, and how I’ve grown. It’s powered by OpenAI, LangChain, Pinecone, and a custom RAG pipeline.

The chatbot knows about my technical background, from AI and machine learning to blockchain and systems programming. It also reflects my values and communication style, offering a more human way to engage with my portfolio.

![Portfolio Bot Screenshot](/public/screenshots.png)

---

## Features

- AI-powered assistant that understands my background and projects
- Conversational responses that reflect my tone and strengths
- Responsive design for both desktop and mobile
- Sidebar navigation by topic (education, experience, projects, etc.)
- Maintains chat history during a session for context-aware replies
- Light/dark mode toggle
- Built using modern frontend tools and design practices

---

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **AI**: OpenAI (via AI SDK), LangChain for RAG orchestration
- **Vector Search**: Pinecone (text-embedding-3-small)
- **State Management**: React Context API

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm (or npm)
- OpenAI API key
- Pinecone API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/portfolio-bot.git
cd portfolio-bot
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env.local` file:

```
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index
```

4. Start the development server:

```bash
pnpm dev
```

Then go to [http://localhost:3000](http://localhost:3000)

---

## Project Structure

- `app/` – Next.js routes and API endpoints
- `components/` – UI and chat-specific components
- `lib/` – AI logic, chat state, memory, vector search
- `scripts/` – Resume embedding utilities
- `public/` – Static assets
- `styles/` – Global theme and Tailwind config

---

## Customization

If you'd like to build your own version:

1. Update the topics in `components/chat-sidebar.tsx`
2. Replace `scripts/resume-data.json` with your own info
3. Run the embedding script:

```bash
pnpm exec tsx scripts/seed-embeddings.ts
```

You can also change styling in:

- `tailwind.config.js`
- `app/globals.css`

---

## Acknowledgments

- Next.js – React framework
- Tailwind CSS – Utility-first styling
- Shadcn UI – Component system
- OpenAI – Language model APIs
- Pinecone – Vector database for semantic search
- LangChain – RAG orchestration
- Lucide – Icon set
