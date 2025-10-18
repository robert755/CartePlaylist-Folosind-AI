using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using Newtonsoft.Json.Linq;

namespace CartePlaylistAI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaylistController : ControllerBase
{
    private readonly HttpClient _httpClient;

    public PlaylistController(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GeneratePlaylist([FromBody] BookRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Title) && string.IsNullOrEmpty(request.Author))
            {
                return BadRequest(new { error = "Trebuie sa introduci titlu sau autor." });
            }

            string descriere = await GetBookDescription(request.Title, request.Author);

            if (string.IsNullOrEmpty(descriere))
            {
                return NotFound(new { error = "Nu am gasit informatii despre carte." });
            }

            if (descriere.Length > 800)
                descriere = descriere.Substring(0, 800) + "...";

            string playlist = await GeneratePlaylistAI(descriere);

            return Ok(new 
            { 
                bookTitle = request.Title,
                bookAuthor = request.Author,
                description = descriere,
                playlist = playlist
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = $"Eroare server: {ex.Message}" });
        }
    }

    private async Task<string> GetBookDescription(string titlu, string autor)
    {
        try
        {
            string q = "";
            if (!string.IsNullOrWhiteSpace(titlu)) q += $"intitle:{Uri.EscapeDataString(titlu)}";
            if (!string.IsNullOrWhiteSpace(autor))
            {
                if (!string.IsNullOrEmpty(q)) q += "+";
                q += $"inauthor:{Uri.EscapeDataString(autor)}";
            }

            string url = $"https://www.googleapis.com/books/v1/volumes?q={q}&maxResults=5";
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var data = JObject.Parse(json);
            var firstBook = data["items"]?[0]?["volumeInfo"];

            return firstBook?["description"]?.ToString() ?? "Descriere indisponibila.";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Eroare la Google Books API: {ex.Message}");
            return null;
        }
    }

    private async Task<string> GeneratePlaylistAI(string descriere)
    {
        string apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? "YOUR_API_KEY_HERE";

        string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";

        
        var body = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = $"Ești un expert în muzică și literatură. Pe baza acestei descrieri a unei cărți, generează un playlist de 10 melodii potrivite atmosferei, temei și emoțiilor cărții. Pentru fiecare melodie oferă: numele piesei - artistul - 1 propoziție scurtă care explică de ce se potrivește.\n\nDescriere carte:\n{descriere}"
                        }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.7,
                maxOutputTokens = 1000,
                topP = 0.8,
                topK = 40
            }
        };

        var content = new StringContent(
            Newtonsoft.Json.JsonConvert.SerializeObject(body),
            System.Text.Encoding.UTF8,
            "application/json"
        );

        try
        {
            var response = await _httpClient.PostAsync(url, content);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return $"Eroare API: {response.StatusCode} - {json}";
            }

            try
            {
                var parsed = JObject.Parse(json);
                
                var playlist = parsed["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString();
                
                if (string.IsNullOrEmpty(playlist))
                {
                    return $"Nu am putut genera playlist. Răspuns API: {json}";
                }
                
                return playlist;
            }
            catch (Exception parseEx)
            {
                return $"Eroare la parsarea răspunsului: {parseEx.Message}\nRăspuns brut: {json}";
            }
        }
        catch (Exception ex)
        {
            return $"Eroare la apelul AI: {ex.Message}";
        }
    }
}

public class BookRequest
{
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
}
