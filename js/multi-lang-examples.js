/**
 * Multi-Language Code Examples
 * - Support for 8+ programming languages
 * - Idiomatic code for each language
 * - Language preference persistence
 * - Syntax highlighting per language
 */

(function() {
    'use strict';

    // =========================
    // Language Definitions
    // =========================
    const LANGUAGES = {
        JAVASCRIPT: {
            id: 'javascript',
            name: 'JavaScript',
            icon: '🟨',
            prismLang: 'javascript',
            ext: 'js'
        },
        PYTHON: {
            id: 'python',
            name: 'Python',
            icon: '🐍',
            prismLang: 'python',
            ext: 'py'
        },
        GO: {
            id: 'go',
            name: 'Go',
            icon: '🔵',
            prismLang: 'go',
            ext: 'go'
        },
        RUST: {
            id: 'rust',
            name: 'Rust',
            icon: '🦀',
            prismLang: 'rust',
            ext: 'rs'
        },
        CURL: {
            id: 'curl',
            name: 'cURL',
            icon: '🔧',
            prismLang: 'bash',
            ext: 'sh'
        },
        RUBY: {
            id: 'ruby',
            name: 'Ruby',
            icon: '💎',
            prismLang: 'ruby',
            ext: 'rb'
        },
        PHP: {
            id: 'php',
            name: 'PHP',
            icon: '🐘',
            prismLang: 'php',
            ext: 'php'
        },
        JAVA: {
            id: 'java',
            name: 'Java',
            icon: '☕',
            prismLang: 'java',
            ext: 'java'
        }
    };

    // =========================
    // Code Examples Database
    // =========================
    const CODE_EXAMPLES = {
        terra: {
            javascript: `// Terra Atlas - Find renewable energy sites
const response = await fetch('https://api.luminousdynamics.io/v1/sites', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'solar',
    minCapacity: 1000, // kW
    location: {
      lat: 40.7128,
      lng: -74.0060,
      radius: 50 // km
    }
  })
});

const data = await response.json();
console.log(\`Found \${data.data.total} solar sites\`);`,

            python: `# Terra Atlas - Find renewable energy sites
import requests

url = 'https://api.luminousdynamics.io/v1/sites'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
payload = {
    'type': 'solar',
    'minCapacity': 1000,  # kW
    'location': {
        'lat': 40.7128,
        'lng': -74.0060,
        'radius': 50  # km
    }
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print(f"Found {data['data']['total']} solar sites")`,

            go: `// Terra Atlas - Find renewable energy sites
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

type Location struct {
    Lat    float64 \`json:"lat"\`
    Lng    float64 \`json:"lng"\`
    Radius int     \`json:"radius"\`
}

type SiteRequest struct {
    Type        string   \`json:"type"\`
    MinCapacity int      \`json:"minCapacity"\`
    Location    Location \`json:"location"\`
}

func main() {
    url := "https://api.luminousdynamics.io/v1/sites"

    payload := SiteRequest{
        Type:        "solar",
        MinCapacity: 1000,
        Location: Location{
            Lat:    40.7128,
            Lng:    -74.0060,
            Radius: 50,
        },
    }

    jsonData, _ := json.Marshal(payload)
    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}`,

            rust: `// Terra Atlas - Find renewable energy sites
use reqwest::header::{AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct Location {
    lat: f64,
    lng: f64,
    radius: i32,
}

#[derive(Serialize)]
struct SiteRequest {
    #[serde(rename = "type")]
    site_type: String,
    #[serde(rename = "minCapacity")]
    min_capacity: i32,
    location: Location,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://api.luminousdynamics.io/v1/sites";

    let payload = SiteRequest {
        site_type: "solar".to_string(),
        min_capacity: 1000,
        location: Location {
            lat: 40.7128,
            lng: -74.0060,
            radius: 50,
        },
    };

    let client = reqwest::Client::new();
    let res = client
        .post(url)
        .header(AUTHORIZATION, "Bearer YOUR_API_KEY")
        .header(CONTENT_TYPE, "application/json")
        .json(&payload)
        .send()
        .await?;

    let body = res.text().await?;
    println!("{}", body);

    Ok(())
}`,

            curl: `# Terra Atlas - Find renewable energy sites
curl -X POST https://api.luminousdynamics.io/v1/sites \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "solar",
    "minCapacity": 1000,
    "location": {
      "lat": 40.7128,
      "lng": -74.0060,
      "radius": 50
    }
  }'`,

            ruby: `# Terra Atlas - Find renewable energy sites
require 'net/http'
require 'json'
require 'uri'

url = URI('https://api.luminousdynamics.io/v1/sites')
http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = {
  type: 'solar',
  minCapacity: 1000,
  location: {
    lat: 40.7128,
    lng: -74.0060,
    radius: 50
  }
}.to_json

response = http.request(request)
data = JSON.parse(response.body)

puts "Found #{data['data']['total']} solar sites"`,

            php: `<?php
// Terra Atlas - Find renewable energy sites

$url = 'https://api.luminousdynamics.io/v1/sites';
$payload = [
    'type' => 'solar',
    'minCapacity' => 1000,
    'location' => [
        'lat' => 40.7128,
        'lng' => -74.0060,
        'radius' => 50
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
echo "Found {$data['data']['total']} solar sites\\n";
?>`,

            java: `// Terra Atlas - Find renewable energy sites
import java.net.http.*;
import java.net.URI;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

public class TerraAtlasClient {
    public static void main(String[] args) throws Exception {
        String url = "https://api.luminousdynamics.io/v1/sites";

        Map<String, Object> payload = Map.of(
            "type", "solar",
            "minCapacity", 1000,
            "location", Map.of(
                "lat", 40.7128,
                "lng", -74.0060,
                "radius", 50
            )
        );

        ObjectMapper mapper = new ObjectMapper();
        String jsonPayload = mapper.writeValueAsString(payload);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request,
            HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}`
        },
        // Similar structure for 'nix' and 'bridge' APIs...
        nix: {
            javascript: `// Luminous Nix - Natural language NixOS operations
const { LuminousNix } = require('@luminous/nix');

const nix = new LuminousNix({
  apiKey: 'YOUR_API_KEY'
});

// Execute natural language command
const result = await nix.execute({
  query: "install firefox with privacy extensions",
  dryRun: true // Preview changes before applying
});

console.log('Operation:', result.operation);
console.log('Commands:', result.commands);
console.log('Success:', result.success);`,

            python: `# Luminous Nix - Natural language NixOS operations
from luminous_nix import LuminousNix

nix = LuminousNix(api_key='YOUR_API_KEY')

# Execute natural language command
result = nix.execute(
    query="install firefox with privacy extensions",
    dry_run=True  # Preview changes before applying
)

print(f"Operation: {result['operation']}")
print(f"Commands: {result['commands']}")
print(f"Success: {result['success']}")`,

            curl: `# Luminous Nix - Natural language NixOS operations
curl -X POST https://api.luminousdynamics.io/v1/nix/execute \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "install firefox with privacy extensions",
    "dryRun": true
  }'`,

            go: `// Luminous Nix - Natural language NixOS operations
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

type NixRequest struct {
    Query  string \`json:"query"\`
    DryRun bool   \`json:"dryRun"\`
}

func main() {
    url := "https://api.luminousdynamics.io/v1/nix/execute"

    payload := NixRequest{
        Query:  "install firefox with privacy extensions",
        DryRun: true,
    }

    jsonData, _ := json.Marshal(payload)
    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
    req.Header.Set("Authorization", "Bearer YOUR_API_KEY")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)

    fmt.Printf("Operation: %v\\n", result["operation"])
}`,

            rust: `// Luminous Nix - Natural language NixOS operations
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
struct NixRequest {
    query: String,
    #[serde(rename = "dryRun")]
    dry_run: bool,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://api.luminousdynamics.io/v1/nix/execute";

    let payload = NixRequest {
        query: "install firefox with privacy extensions".to_string(),
        dry_run: true,
    };

    let client = reqwest::Client::new();
    let res = client
        .post(url)
        .header("Authorization", "Bearer YOUR_API_KEY")
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await?;

    println!("{}", res.text().await?);
    Ok(())
}`,

            ruby: `# Luminous Nix - Natural language NixOS operations
require 'luminous_nix'

nix = LuminousNix.new(api_key: 'YOUR_API_KEY')

result = nix.execute(
  query: 'install firefox with privacy extensions',
  dry_run: true
)

puts "Operation: #{result['operation']}"
puts "Success: #{result['success']}"`,

            php: `<?php
// Luminous Nix - Natural language NixOS operations

$url = 'https://api.luminousdynamics.io/v1/nix/execute';
$payload = [
    'query' => 'install firefox with privacy extensions',
    'dryRun' => true
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$data = json_decode($response, true);

echo "Operation: {$data['operation']}\\n";
?>`,

            java: `// Luminous Nix - Natural language NixOS operations
import java.net.http.*;
import java.net.URI;

public class LuminousNixClient {
    public static void main(String[] args) throws Exception {
        String url = "https://api.luminousdynamics.io/v1/nix/execute";
        String jsonPayload = """
            {
                "query": "install firefox with privacy extensions",
                "dryRun": true
            }
            """;

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Authorization", "Bearer YOUR_API_KEY")
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
            .build();

        HttpResponse<String> response = client.send(request,
            HttpResponse.BodyHandlers.ofString());

        System.out.println(response.body());
    }
}`
        },
        bridge: {
            javascript: `// Sacred Bridge - Service coordination bus
const { SacredBridge } = require('@luminous/bridge');

const bridge = new SacredBridge();

// Subscribe to consciousness field events
bridge.subscribe('field.coherence', (event) => {
  console.log('Coherence level:', event.level);
  console.log('Connected services:', event.services);
});

// Emit an intention
bridge.emit('intention.set', {
  service: 'terra-atlas',
  intention: 'find_sustainable_projects',
  parameters: {
    minROI: 0.12,
    maxRisk: 'medium'
  }
});`,

            python: `# Sacred Bridge - Service coordination bus
from sacred_bridge import SacredBridge

bridge = SacredBridge()

# Subscribe to consciousness field events
@bridge.on('field.coherence')
def handle_coherence(event):
    print(f"Coherence level: {event['level']}")
    print(f"Connected services: {event['services']}")

# Emit an intention
bridge.emit('intention.set', {
    'service': 'terra-atlas',
    'intention': 'find_sustainable_projects',
    'parameters': {
        'minROI': 0.12,
        'maxRisk': 'medium'
    }
})`,

            curl: `# Sacred Bridge - Emit intention
curl -X POST https://api.luminousdynamics.io/v1/bridge/emit \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "intention.set",
    "data": {
      "service": "terra-atlas",
      "intention": "find_sustainable_projects",
      "parameters": {
        "minROI": 0.12,
        "maxRisk": "medium"
      }
    }
  }'`,

            go: `// Sacred Bridge - Service coordination
package main

import (
    "github.com/luminous/sacred-bridge-go"
)

func main() {
    bridge := sacredbridge.New("YOUR_API_KEY")

    // Subscribe to events
    bridge.On("field.coherence", func(event map[string]interface{}) {
        fmt.Println("Coherence level:", event["level"])
    })

    // Emit intention
    bridge.Emit("intention.set", map[string]interface{}{
        "service":    "terra-atlas",
        "intention":  "find_sustainable_projects",
        "parameters": map[string]interface{}{
            "minROI":   0.12,
            "maxRisk":  "medium",
        },
    })

    bridge.Connect()
}`,

            rust: `// Sacred Bridge - Service coordination
use sacred_bridge::SacredBridge;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let bridge = SacredBridge::new("YOUR_API_KEY");

    // Subscribe to events
    bridge.on("field.coherence", |event| {
        println!("Coherence level: {}", event.level);
    });

    // Emit intention
    bridge.emit("intention.set", serde_json::json!({
        "service": "terra-atlas",
        "intention": "find_sustainable_projects",
        "parameters": {
            "minROI": 0.12,
            "maxRisk": "medium"
        }
    })).await?;

    Ok(())
}`,

            ruby: `# Sacred Bridge - Service coordination
require 'sacred_bridge'

bridge = SacredBridge.new(api_key: 'YOUR_API_KEY')

# Subscribe to events
bridge.on('field.coherence') do |event|
  puts "Coherence level: #{event['level']}"
end

# Emit intention
bridge.emit('intention.set',
  service: 'terra-atlas',
  intention: 'find_sustainable_projects',
  parameters: {
    minROI: 0.12,
    maxRisk: 'medium'
  }
)`,

            php: `<?php
// Sacred Bridge - Service coordination
use Luminous\\SacredBridge;

$bridge = new SacredBridge('YOUR_API_KEY');

// Subscribe to events
$bridge->on('field.coherence', function($event) {
    echo "Coherence level: {$event['level']}\\n";
});

// Emit intention
$bridge->emit('intention.set', [
    'service' => 'terra-atlas',
    'intention' => 'find_sustainable_projects',
    'parameters' => [
        'minROI' => 0.12,
        'maxRisk' => 'medium'
    ]
]);
?>`,

            java: `// Sacred Bridge - Service coordination
import io.luminous.sacredbridge.*;

public class BridgeClient {
    public static void main(String[] args) {
        SacredBridge bridge = new SacredBridge("YOUR_API_KEY");

        // Subscribe to events
        bridge.on("field.coherence", event -> {
            System.out.println("Coherence: " + event.get("level"));
        });

        // Emit intention
        Map<String, Object> intention = Map.of(
            "service", "terra-atlas",
            "intention", "find_sustainable_projects",
            "parameters", Map.of(
                "minROI", 0.12,
                "maxRisk", "medium"
            )
        );

        bridge.emit("intention.set", intention);
    }
}`
        }
    };

    // Configuration
    const CONFIG = {
        storageKey: 'luminous_preferred_language',
        defaultLanguage: 'javascript'
    };

    // State
    const state = {
        currentLanguage: null,
        currentAPI: null
    };

    // =========================
    // Language Management
    // =========================

    /**
     * Get saved language preference
     */
    function getSavedLanguage() {
        try {
            return localStorage.getItem(CONFIG.storageKey) || CONFIG.defaultLanguage;
        } catch (err) {
            return CONFIG.defaultLanguage;
        }
    }

    /**
     * Save language preference
     */
    function saveLanguage(lang) {
        try {
            localStorage.setItem(CONFIG.storageKey, lang);
        } catch (err) {
            console.error('[MultiLang] Failed to save preference:', err);
        }
    }

    /**
     * Set language and update display
     */
    function setLanguage(langId, apiId) {
        state.currentLanguage = langId;
        state.currentAPI = apiId || state.currentAPI;

        // Update code display
        updateCodeDisplay(state.currentAPI, langId);

        // Save preference
        saveLanguage(langId);

        // Update UI
        updateLanguageSelector(langId);

        // Show toast if available
        if (window.Toast) {
            const lang = Object.values(LANGUAGES).find(l => l.id === langId);
            window.Toast.success(`Language: ${lang ? lang.name : langId}`);
        }
    }

    /**
     * Update code display with selected language
     */
    function updateCodeDisplay(apiId, langId) {
        const codeElement = document.getElementById('playground-code');
        if (!codeElement) {
            return;
        }

        const code = CODE_EXAMPLES[apiId]?.[langId];
        if (!code) {
            console.warn(`[MultiLang] No code example for ${apiId}/${langId}`);
            return;
        }

        // Update code
        codeElement.textContent = code;

        // Update language class for Prism
        const lang = Object.values(LANGUAGES).find(l => l.id === langId);
        if (lang) {
            codeElement.className = `language-${lang.prismLang}`;
        }

        // Re-highlight
        if (window.Prism) {
            Prism.highlightElement(codeElement);
        }
    }

    /**
     * Update language selector UI
     */
    function updateLanguageSelector(langId) {
        const buttons = document.querySelectorAll('.lang-selector-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === langId);
        });
    }

    /**
     * Create language selector UI
     */
    function createLanguageSelector() {
        const playgroundContainer = document.querySelector('.playground-editor');
        if (!playgroundContainer) {
            return;
        }

        const header = playgroundContainer.querySelector('.editor-header');
        if (!header) {
            return;
        }

        const selector = document.createElement('div');
        selector.className = 'language-selector';
        selector.setAttribute('role', 'tablist');
        selector.setAttribute('aria-label', 'Select programming language');

        const languages = [
            LANGUAGES.JAVASCRIPT,
            LANGUAGES.PYTHON,
            LANGUAGES.GO,
            LANGUAGES.RUST,
            LANGUAGES.CURL,
            LANGUAGES.RUBY,
            LANGUAGES.PHP,
            LANGUAGES.JAVA
        ];

        selector.innerHTML = languages.map(lang => `
            <button
                class="lang-selector-btn"
                data-lang="${lang.id}"
                role="tab"
                aria-label="${lang.name}"
                title="${lang.name}">
                <span class="lang-icon" aria-hidden="true">${lang.icon}</span>
                <span class="lang-name">${lang.name}</span>
            </button>
        `).join('');

        // Insert after "Request" text
        header.appendChild(selector);

        // Add event listeners
        const buttons = selector.querySelectorAll('.lang-selector-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                setLanguage(btn.dataset.lang);
            });
        });
    }

    // =========================
    // Integration with Playground
    // =========================

    /**
     * Hook into playground tab switching
     */
    function hookPlaygroundTabs() {
        const tabs = document.querySelectorAll('.playground-tabs .tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const apiId = tab.getAttribute('data-api');
                state.currentAPI = apiId;

                // Update with current language
                setTimeout(() => {
                    updateCodeDisplay(apiId, state.currentLanguage);
                }, 100);
            });
        });
    }

    // =========================
    // Initialization
    // =========================

    function init() {
        console.log('🌐 Multi-Language Examples Initialized');

        // Get initial state
        const savedLang = getSavedLanguage();
        const activeTab = document.querySelector('.playground-tabs .tab.active');
        const initialAPI = activeTab ? activeTab.getAttribute('data-api') : 'terra';

        state.currentLanguage = savedLang;
        state.currentAPI = initialAPI;

        // Create UI
        createLanguageSelector();

        // Hook into playground
        hookPlaygroundTabs();

        // Set initial language
        setLanguage(savedLang, initialAPI);
    }

    // Export public API
    window.MultiLangExamples = {
        setLanguage,
        getLanguages: () => LANGUAGES,
        getCurrentLanguage: () => state.currentLanguage,
        init
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
