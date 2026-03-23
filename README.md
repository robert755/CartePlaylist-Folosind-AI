# CartePlaylist AI

**Turn books into curated playlists.** CartePlaylist AI is a small full-stack web app: you enter a book title and/or author, the app pulls a synopsis from Google Books, and **Google Gemini** suggests ten songs that match the book’s mood, themes, and emotional tone.

---

## What it does

1. **You** submit a book title (required in the UI) and optionally an author.
2. **Google Books** supplies a short description of the best matching volume.
3. **Gemini** reads that description and returns a playlist of **10 tracks**, each with song name, artist, and a one-line reason it fits the book.

The interface is served as static files from `wwwroot` and talks to a single JSON API on the same origin.

---

## Tech stack

| Layer | Details |
|--------|---------|
| **Backend** | ASP.NET Core 8 (minimal hosting + controllers) |
| **Frontend** | HTML, CSS, vanilla JavaScript |
| **Data** | [Google Books API](https://developers.google.com/books) (volume search, no API key in this project) |
| **AI** | [Gemini API](https://ai.google.dev/) (`gemini-2.0-flash`) via REST |
| **Docs** | Swagger / OpenAPI in **Development** only |

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/)

---

## Configuration

Set your API key as an environment variable before running (recommended):

**Windows (PowerShell)**

```powershell
$env:GEMINI_API_KEY = "your-key-here"
```

**macOS / Linux**

```bash
export GEMINI_API_KEY="your-key-here"
```

The backend reads `GEMINI_API_KEY`. If it is missing, the code falls back to a placeholder and Gemini calls will fail until you set a real key.

---

## Run locally

From the repository root:

```bash
dotnet restore
dotnet run
```

The app is configured to listen on **http://localhost:5000**. Open that URL in a browser to use the UI.

In Development, Swagger is available (typically at `/swagger`).

---

## API

### `POST /api/playlist/generate`

**Body (JSON)**

```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald"
}
```

At least one of `title` or `author` must be provided (the API validates this; the HTML form currently requires a title).

**Success (200)** — example shape:

```json
{
  "bookTitle": "...",
  "bookAuthor": "...",
  "description": "...",
  "playlist": "Plain text playlist from Gemini..."
}
```

**Errors** — `400` if both title and author are empty, `404` if no usable book description was found, `500` on unexpected server errors.

---

## Project layout

```
CartePlaylist-Folosind-AI/
├── Controllers/
│   └── PlaylistController.cs   # Books lookup + Gemini playlist generation
├── wwwroot/
│   ├── index.html
│   ├── style.css
│   └── script.js               # Calls /api/playlist/generate
├── Program.cs                  # Pipeline, CORS, static files, SPA fallback
└── CartePlaylistAI.csproj
```

---

## Notes

- **Google Books** responses may omit a description for some editions; the app handles missing data as gracefully as it can.
- Descriptions longer than **800 characters** are truncated before being sent to Gemini to keep prompts bounded.
- **CORS** is configured to allow any origin (`AllowAll`), which is convenient for local demos; tighten this for production deployments.


*Powered by **Gemini** and the **Google Books API**.*
