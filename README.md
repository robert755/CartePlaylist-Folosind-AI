# CartePlaylist AI

Aplicatie web care genereaza playlist-uri personalizate pe baza descrierii cartilor folosind AI.

## Ce face aplicatia

- Introduci titlul si autorul unei carti
- Aplicatia cauta descrierea cartii pe Google Books API
- Trimite descrierea la Gemini AI
- Primesti un playlist de 10 melodii potrivite pentru cartea respectiva
- Design alb-verde

## API-uri folosite

1. **Google Books API** - pentru a obtine descrierea cartilor
   - Endpoint: `https://www.googleapis.com/books/v1/volumes`
   - Gratuit, nu necesita cheie API

2. **Google Gemini AI API** - pentru generarea playlist-urilor
   - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
   - Necesita cheie API de la Google AI Studio

## Tehnologii

- **Backend:** ASP.NET Core, C#
- **Frontend:** HTML, CSS, JavaScript
- **AI:** Google Gemini API
- **Books:** Google Books API

