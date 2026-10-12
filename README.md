# MathForge

> 🟡 **Status:** Active development

MathForge is a coding-focused mathematics platform where users solve problems by writing **JavaScript, Python, or C#** code.

The project combines a modern Next.js interface with a FastAPI backend, a structured problem/learning catalog, and a code-execution pipeline.

## What it includes

- Multi-language code editing for JavaScript, Python, and C#
- CodeMirror-based editor experience
- Mathematics problem catalog and learning topics
- FastAPI backend for questions, learning content, and submissions
- Judge0 integration for code execution
- Submission validation and execution guards
- Automated API tests
- Monorepo-style separation between frontend and backend

## Tech Stack

### Web
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- CodeMirror

### API
- Python
- FastAPI
- Pydantic
- Judge0
- pytest

## Project Structure

```text
MathForge/
├── apps/
│   ├── web/        # Next.js frontend
│   └── api/        # FastAPI backend
├── scripts/
├── .env.example
└── README.md
```

The API is split into dedicated models, routers, services, question data, learning content, submission logic, and tests.

## Getting Started

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

### Backend

Create a Python environment, install the API requirements, configure the variables from `.env.example`, then run the FastAPI application locally.

```bash
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Development Status

MathForge is intentionally shown as an **active project**, not a finished product. Current development is focused on expanding the learning/problem experience, strengthening the execution pipeline, and improving the overall product flow.

## Repository

Built as a portfolio and learning project focused on combining **software development and mathematics** instead of presenting another static demo application.
