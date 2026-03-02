# B40 Life Simulator - Unity Mobile Rebuild Guide

## Why Unity Over Unreal Engine 5?

| Factor | Unity | Unreal Engine 5 |
|--------|-------|-----------------|
| 2D Game Support | Excellent (native) | Limited (designed for 3D) |
| Learning Curve | Gentle | Steep |
| Mobile Performance | Optimized for mobile | Heavy, better for AAA |
| UI System | Unity UI (uGUI) - great for dialogue | UMG - overkill for this |
| Language | C# (easier) | C++/Blueprints |
| Build Size | Smaller APK/IPA | Large build sizes |
| API Integration | Easy HTTP requests | More complex |
| Community Resources | Abundant for 2D mobile | Sparse for 2D |

**Verdict:** Unity is the clear winner for this 2D, UI-heavy, mobile game.

---

## Phase 1: Setup & Prerequisites

### 1.1 Install Required Software

```bash
# 1. Download Unity Hub
# https://unity.com/download

# 2. Install Unity Editor (LTS recommended)
# Version: Unity 2022.3 LTS or Unity 6 (2023.3 LTS)

# 3. Install modules in Unity Hub:
# - Android Build Support
# - iOS Build Support
# - Visual Studio / VS Code (for C# editing)
```

### 1.2 Create New Unity Project

1. Open Unity Hub → New Project
2. Select **2D (URP)** template (Universal Render Pipeline for better mobile performance)
3. Project name: `B40LifeSimulator`
4. Create project

### 1.3 Configure Project Settings

```
Edit → Project Settings → Player:

Android:
- Company Name: Your Company
- Product Name: B40 Life Simulator
- Package Name: com.yourcompany.b40lifesim
- Minimum API Level: Android 7.0 (API 24)
- Target API Level: Automatic (highest)
- Scripting Backend: IL2CPP (required for release)
- Target Architectures: ARMv7, ARM64

iOS:
- Bundle Identifier: com.yourcompany.b40lifesim
- Target minimum iOS Version: 13.0
- Scripting Backend: IL2CPP
- Architecture: ARM64
```

---

## Phase 2: Project Architecture

### 2.1 Folder Structure

```
Assets/
├── _Project/
│   ├── Scripts/
│   │   ├── Core/
│   │   │   ├── GameManager.cs
│   │   │   ├── SaveManager.cs
│   │   │   └── AudioManager.cs
│   │   ├── Player/
│   │   │   ├── PlayerController.cs
│   │   │   ├── PlayerStats.cs
│   │   │   └── PlayerMovement.cs
│   │   ├── Map/
│   │   │   ├── Location.cs
│   │   │   ├── MapManager.cs
│   │   │   └── LocationTrigger.cs
│   │   ├── AI/
│   │   │   ├── ClaudeAPIClient.cs
│   │   │   ├── ScenarioGenerator.cs
│   │   │   └── FallbackScenarios.cs
│   │   ├── UI/
│   │   │   ├── DialogueManager.cs
│   │   │   ├── ChoicePanel.cs
│   │   │   ├── StatsHUD.cs
│   │   │   ├── WeeklyObjectivesUI.cs
│   │   │   └── EndingScreen.cs
│   │   ├── Data/
│   │   │   ├── GameData.cs
│   │   │   ├── PersonaData.cs
│   │   │   ├── DecisionData.cs
│   │   │   └── LocationData.cs
│   │   └── Utilities/
│   │       ├── Constants.cs
│   │       └── Extensions.cs
│   ├── Prefabs/
│   │   ├── Player/
│   │   ├── Locations/
│   │   ├── NPCs/
│   │   └── UI/
│   ├── Sprites/
│   │   ├── Characters/
│   │   ├── Locations/
│   │   ├── UI/
│   │   └── Tiles/
│   ├── Audio/
│   │   ├── Music/
│   │   └── SFX/
│   ├── Scenes/
│   │   ├── MainMenu.unity
│   │   ├── PersonaSelection.unity
│   │   ├── Game_KL.unity
│   │   ├── Game_Penang.unity
│   │   └── Ending.unity
│   ├── ScriptableObjects/
│   │   ├── Personas/
│   │   ├── Locations/
│   │   └── Events/
│   └── Resources/
│       └── Prompts/
├── Plugins/
│   └── (third-party SDKs)
└── TextMesh Pro/
```

### 2.2 Core Data Models (ScriptableObjects)

Create data containers that mirror your Convex schema:

```csharp
// PersonaData.cs
using UnityEngine;

[CreateAssetMenu(fileName = "NewPersona", menuName = "B40/Persona")]
public class PersonaData : ScriptableObject
{
    public string personaId;
    public string displayName;
    public string description;

    [Header("Starting Stats")]
    public int startingMoney;
    public int startingDebt;
    public int startingCreditScore;
    public int monthlySalary;

    [Header("Map")]
    public string mapId; // "kl" or "penang"
    public Sprite mapBackground;

    [Header("Debt Type")]
    public string debtType; // "ptptn" or "personalLoan"
    public int minimumDebtPayment;
}
```

```csharp
// LocationData.cs
using UnityEngine;

[CreateAssetMenu(fileName = "NewLocation", menuName = "B40/Location")]
public class LocationData : ScriptableObject
{
    public string locationId;
    public string displayName;
    public Sprite icon;
    public Vector2 mapPosition;
    public int energyCost = 1;
    public string[] possibleScenarioTypes;
    public bool isWeekendOnly;
}
```

---

## Phase 3: Core Systems Implementation

### 3.1 Game Manager (Singleton)

```csharp
// GameManager.cs
using UnityEngine;
using System;
using System.Collections.Generic;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Current Game State")]
    public PersonaData currentPersona;
    public int money;
    public int debt;
    public int creditScore;
    public int health = 100;
    public int stress = 0;
    public int energy;
    public int currentWeek = 1;
    public int currentDay = 1;

    [Header("Weekly Objectives")]
    public int daysWorked;
    public bool boughtGroceries;
    public bool filledPetrol;
    public bool paidDebtThisMonth;

    [Header("Bills")]
    public Dictionary<string, BillData> bills = new();

    [Header("Decision History")]
    public List<DecisionRecord> decisions = new();

    public event Action<string> OnStatsChanged;
    public event Action OnDayEnded;
    public event Action OnWeekEnded;
    public event Action OnGameEnded;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void StartNewGame(PersonaData persona)
    {
        currentPersona = persona;
        money = persona.startingMoney;
        debt = persona.startingDebt;
        creditScore = persona.startingCreditScore;
        health = 100;
        stress = 0;
        energy = 11; // 11 energy per week
        currentWeek = 1;
        currentDay = 1;
        decisions.Clear();

        InitializeBills();
    }

    public void ApplyConsequence(Consequence consequence)
    {
        money += consequence.moneyChange;
        debt += consequence.debtChange;
        creditScore += consequence.creditChange;
        health = Mathf.Clamp(health + consequence.healthChange, 0, 100);
        stress = Mathf.Clamp(stress + consequence.stressChange, 0, 100);

        OnStatsChanged?.Invoke(consequence.description);

        CheckGameOver();
    }

    public void UseEnergy(int amount = 1)
    {
        energy -= amount;

        if (energy <= 0)
        {
            EndDay();
        }
    }

    private void EndDay()
    {
        currentDay++;

        if (currentDay > 5) // 5 weekdays
        {
            EndWeek();
        }
        else
        {
            energy = 11;
            OnDayEnded?.Invoke();
        }
    }

    private void EndWeek()
    {
        currentWeek++;
        currentDay = 1;
        energy = 11;

        // Reset weekly objectives
        daysWorked = 0;
        boughtGroceries = false;
        filledPetrol = false;

        if (currentWeek > 4)
        {
            EndGame();
        }
        else
        {
            OnWeekEnded?.Invoke();
        }
    }

    private void EndGame()
    {
        OnGameEnded?.Invoke();
        // Load ending scene
        UnityEngine.SceneManagement.SceneManager.LoadScene("Ending");
    }

    private void CheckGameOver()
    {
        if (health <= 0 || stress >= 100)
        {
            EndGame();
        }
    }

    private void InitializeBills()
    {
        bills["rent"] = new BillData { name = "Rent", amount = 400, dueWeek = 1 };
        bills["electricity"] = new BillData { name = "TNB", amount = 80, dueWeek = 2 };
        bills["water"] = new BillData { name = "Water", amount = 25, dueWeek = 2 };
        bills["phone"] = new BillData { name = "Phone", amount = 50, dueWeek = 3 };

        if (currentPersona.debtType == "ptptn")
        {
            bills["ptptn"] = new BillData { name = "PTPTN", amount = 200, dueWeek = 4 };
        }
        else
        {
            bills["loan"] = new BillData { name = "Loan", amount = 300, dueWeek = 4 };
        }
    }
}

[System.Serializable]
public class BillData
{
    public string name;
    public int amount;
    public int dueWeek;
    public bool isPaid;
}

[System.Serializable]
public class DecisionRecord
{
    public string locationId;
    public string scenarioId;
    public int choiceIndex;
    public string choiceText;
    public int week;
    public int day;
    public DateTime timestamp;
}

[System.Serializable]
public class Consequence
{
    public int moneyChange;
    public int debtChange;
    public int creditChange;
    public int healthChange;
    public int stressChange;
    public string description;
}
```

### 3.2 Claude AI Integration

```csharp
// ClaudeAPIClient.cs
using UnityEngine;
using UnityEngine.Networking;
using System;
using System.Collections;
using System.Text;

public class ClaudeAPIClient : MonoBehaviour
{
    public static ClaudeAPIClient Instance { get; private set; }

    [SerializeField] private string apiKey; // Set in inspector or load from secure storage
    private const string API_URL = "https://api.anthropic.com/v1/messages";
    private const string MODEL = "claude-3-5-haiku-20241022";

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public void GenerateScenario(string systemPrompt, string userPrompt, Action<ScenarioResponse> onSuccess, Action<string> onError)
    {
        StartCoroutine(SendRequest(systemPrompt, userPrompt, onSuccess, onError));
    }

    private IEnumerator SendRequest(string systemPrompt, string userPrompt, Action<ScenarioResponse> onSuccess, Action<string> onError)
    {
        var requestBody = new ClaudeRequest
        {
            model = MODEL,
            max_tokens = 1024,
            system = systemPrompt,
            messages = new[]
            {
                new Message { role = "user", content = userPrompt }
            }
        };

        string jsonBody = JsonUtility.ToJson(requestBody);

        using (UnityWebRequest request = new UnityWebRequest(API_URL, "POST"))
        {
            byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();

            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("x-api-key", apiKey);
            request.SetRequestHeader("anthropic-version", "2023-06-01");

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                try
                {
                    var response = JsonUtility.FromJson<ClaudeResponse>(request.downloadHandler.text);
                    var scenarioJson = response.content[0].text;
                    var scenario = JsonUtility.FromJson<ScenarioResponse>(scenarioJson);
                    onSuccess?.Invoke(scenario);
                }
                catch (Exception e)
                {
                    Debug.LogError($"Parse error: {e.Message}");
                    onError?.Invoke("Failed to parse AI response");
                }
            }
            else
            {
                Debug.LogError($"API error: {request.error}");
                onError?.Invoke(request.error);
            }
        }
    }
}

// Request/Response classes
[Serializable]
public class ClaudeRequest
{
    public string model;
    public int max_tokens;
    public string system;
    public Message[] messages;
}

[Serializable]
public class Message
{
    public string role;
    public string content;
}

[Serializable]
public class ClaudeResponse
{
    public ContentBlock[] content;
}

[Serializable]
public class ContentBlock
{
    public string type;
    public string text;
}

[Serializable]
public class ScenarioResponse
{
    public string narration;
    public string npcDialogue;
    public string npcName;
    public string emotion;
    public Choice[] choices;
}

[Serializable]
public class Choice
{
    public string text;
    public Consequence immediateConsequence;
    public DelayedConsequence delayedConsequence;
}

[Serializable]
public class DelayedConsequence
{
    public int triggerWeek;
    public int triggerDay;
    public Consequence consequence;
    public string description;
}
```

### 3.3 Player Movement (2D Top-Down)

```csharp
// PlayerMovement.cs
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    [Header("Movement")]
    public float moveSpeed = 5f;
    public Rigidbody2D rb;
    public Animator animator;

    [Header("Mobile Input")]
    public Joystick joystick; // Using Joystick Pack asset

    private Vector2 movement;
    private bool canMove = true;

    private void Update()
    {
        if (!canMove) return;

        // Mobile joystick input
        if (joystick != null)
        {
            movement.x = joystick.Horizontal;
            movement.y = joystick.Vertical;
        }

        // Keyboard fallback (for testing)
        if (movement == Vector2.zero)
        {
            movement.x = Input.GetAxisRaw("Horizontal");
            movement.y = Input.GetAxisRaw("Vertical");
        }

        // Update animator
        if (animator != null)
        {
            animator.SetFloat("Horizontal", movement.x);
            animator.SetFloat("Vertical", movement.y);
            animator.SetFloat("Speed", movement.sqrMagnitude);
        }
    }

    private void FixedUpdate()
    {
        if (!canMove) return;
        rb.MovePosition(rb.position + movement * moveSpeed * Time.fixedDeltaTime);
    }

    public void SetCanMove(bool value)
    {
        canMove = value;
        if (!value)
        {
            movement = Vector2.zero;
            rb.velocity = Vector2.zero;
        }
    }
}
```

### 3.4 Location Interaction

```csharp
// LocationTrigger.cs
using UnityEngine;

public class LocationTrigger : MonoBehaviour
{
    public LocationData locationData;
    public SpriteRenderer highlight;

    private bool playerInRange;

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            playerInRange = true;
            if (highlight != null) highlight.enabled = true;
            UIManager.Instance.ShowInteractionPrompt(locationData.displayName);
        }
    }

    private void OnTriggerExit2D(Collider2D other)
    {
        if (other.CompareTag("Player"))
        {
            playerInRange = false;
            if (highlight != null) highlight.enabled = false;
            UIManager.Instance.HideInteractionPrompt();
        }
    }

    private void Update()
    {
        // Mobile: Use UI button for interaction
        // This is called from UIManager when interaction button is pressed
    }

    public void Interact()
    {
        if (!playerInRange) return;
        if (GameManager.Instance.energy < locationData.energyCost)
        {
            UIManager.Instance.ShowMessage("Not enough energy!");
            return;
        }

        // Check if weekend-only location
        if (locationData.isWeekendOnly && GameManager.Instance.currentDay <= 5)
        {
            UIManager.Instance.ShowMessage("This location is only available on weekends!");
            return;
        }

        // Trigger scenario
        ScenarioManager.Instance.StartScenario(locationData);
    }
}
```

### 3.5 Dialogue/Choice UI System

```csharp
// DialogueManager.cs
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;
using System.Collections.Generic;

public class DialogueManager : MonoBehaviour
{
    public static DialogueManager Instance { get; private set; }

    [Header("UI References")]
    public GameObject dialoguePanel;
    public TextMeshProUGUI narratorText;
    public TextMeshProUGUI npcNameText;
    public TextMeshProUGUI npcDialogueText;
    public Image npcPortrait;
    public Transform choicesContainer;
    public GameObject choiceButtonPrefab;

    [Header("Settings")]
    public float typingSpeed = 0.03f;

    private ScenarioResponse currentScenario;
    private Coroutine typingCoroutine;

    private void Awake()
    {
        Instance = this;
    }

    public void ShowScenario(ScenarioResponse scenario)
    {
        currentScenario = scenario;
        dialoguePanel.SetActive(true);

        // Disable player movement
        FindObjectOfType<PlayerMovement>()?.SetCanMove(false);

        // Clear previous choices
        foreach (Transform child in choicesContainer)
        {
            Destroy(child.gameObject);
        }

        // Set NPC info
        npcNameText.text = scenario.npcName ?? "";

        // Type out narration, then NPC dialogue
        StartCoroutine(ShowDialogueSequence());
    }

    private IEnumerator ShowDialogueSequence()
    {
        // Show narration
        yield return TypeText(narratorText, currentScenario.narration);
        yield return new WaitForSeconds(0.5f);

        // Show NPC dialogue
        if (!string.IsNullOrEmpty(currentScenario.npcDialogue))
        {
            yield return TypeText(npcDialogueText, currentScenario.npcDialogue);
            yield return new WaitForSeconds(0.3f);
        }

        // Show choices
        ShowChoices();
    }

    private IEnumerator TypeText(TextMeshProUGUI textComponent, string text)
    {
        textComponent.text = "";
        foreach (char c in text)
        {
            textComponent.text += c;
            yield return new WaitForSeconds(typingSpeed);
        }
    }

    private void ShowChoices()
    {
        for (int i = 0; i < currentScenario.choices.Length; i++)
        {
            var choice = currentScenario.choices[i];
            var buttonObj = Instantiate(choiceButtonPrefab, choicesContainer);
            var button = buttonObj.GetComponent<Button>();
            var text = buttonObj.GetComponentInChildren<TextMeshProUGUI>();

            text.text = choice.text;

            int index = i; // Capture for closure
            button.onClick.AddListener(() => OnChoiceSelected(index));
        }
    }

    private void OnChoiceSelected(int index)
    {
        var choice = currentScenario.choices[index];

        // Record decision
        GameManager.Instance.decisions.Add(new DecisionRecord
        {
            choiceIndex = index,
            choiceText = choice.text,
            week = GameManager.Instance.currentWeek,
            day = GameManager.Instance.currentDay,
            timestamp = System.DateTime.Now
        });

        // Apply immediate consequence
        if (choice.immediateConsequence != null)
        {
            GameManager.Instance.ApplyConsequence(choice.immediateConsequence);
        }

        // Schedule delayed consequence
        if (choice.delayedConsequence != null)
        {
            ScheduledEventManager.Instance.ScheduleEvent(choice.delayedConsequence);
        }

        // Use energy
        GameManager.Instance.UseEnergy();

        // Close dialogue
        CloseDialogue();
    }

    public void CloseDialogue()
    {
        dialoguePanel.SetActive(false);
        FindObjectOfType<PlayerMovement>()?.SetCanMove(true);
    }
}
```

---

## Phase 4: Mobile-Specific Implementation

### 4.1 Mobile Input Setup

1. **Install Joystick Pack** (Asset Store - free)
2. **Create Mobile UI Canvas:**

```csharp
// MobileInputManager.cs
using UnityEngine;
using UnityEngine.UI;

public class MobileInputManager : MonoBehaviour
{
    [Header("Joystick")]
    public Joystick movementJoystick;

    [Header("Buttons")]
    public Button interactButton;
    public Button menuButton;
    public Button inventoryButton;

    private LocationTrigger currentLocation;

    private void Start()
    {
        interactButton.onClick.AddListener(OnInteractPressed);

        // Only show on mobile
        #if !UNITY_ANDROID && !UNITY_IOS
        gameObject.SetActive(false);
        #endif
    }

    public void SetCurrentLocation(LocationTrigger location)
    {
        currentLocation = location;
        interactButton.gameObject.SetActive(location != null);
    }

    private void OnInteractPressed()
    {
        currentLocation?.Interact();
    }
}
```

### 4.2 Safe Area Handling

```csharp
// SafeAreaHandler.cs
using UnityEngine;

public class SafeAreaHandler : MonoBehaviour
{
    private RectTransform rectTransform;
    private Rect lastSafeArea;

    private void Awake()
    {
        rectTransform = GetComponent<RectTransform>();
        ApplySafeArea();
    }

    private void Update()
    {
        if (Screen.safeArea != lastSafeArea)
        {
            ApplySafeArea();
        }
    }

    private void ApplySafeArea()
    {
        lastSafeArea = Screen.safeArea;

        var anchorMin = lastSafeArea.position;
        var anchorMax = lastSafeArea.position + lastSafeArea.size;

        anchorMin.x /= Screen.width;
        anchorMin.y /= Screen.height;
        anchorMax.x /= Screen.width;
        anchorMax.y /= Screen.height;

        rectTransform.anchorMin = anchorMin;
        rectTransform.anchorMax = anchorMax;
    }
}
```

### 4.3 Save System (Mobile-Friendly)

```csharp
// SaveManager.cs
using UnityEngine;
using System.IO;

public class SaveManager : MonoBehaviour
{
    public static SaveManager Instance { get; private set; }

    private string SavePath => Path.Combine(Application.persistentDataPath, "save.json");

    private void Awake()
    {
        Instance = this;
    }

    public void SaveGame()
    {
        var saveData = new SaveData
        {
            personaId = GameManager.Instance.currentPersona.personaId,
            money = GameManager.Instance.money,
            debt = GameManager.Instance.debt,
            creditScore = GameManager.Instance.creditScore,
            health = GameManager.Instance.health,
            stress = GameManager.Instance.stress,
            energy = GameManager.Instance.energy,
            currentWeek = GameManager.Instance.currentWeek,
            currentDay = GameManager.Instance.currentDay,
            decisions = GameManager.Instance.decisions
        };

        string json = JsonUtility.ToJson(saveData, true);
        File.WriteAllText(SavePath, json);
        Debug.Log("Game saved!");
    }

    public bool LoadGame()
    {
        if (!File.Exists(SavePath)) return false;

        try
        {
            string json = File.ReadAllText(SavePath);
            var saveData = JsonUtility.FromJson<SaveData>(json);

            // Apply save data to GameManager
            // ... (restore all values)

            return true;
        }
        catch
        {
            return false;
        }
    }

    public void DeleteSave()
    {
        if (File.Exists(SavePath))
        {
            File.Delete(SavePath);
        }
    }
}

[System.Serializable]
public class SaveData
{
    public string personaId;
    public int money;
    public int debt;
    public int creditScore;
    public int health;
    public int stress;
    public int energy;
    public int currentWeek;
    public int currentDay;
    public System.Collections.Generic.List<DecisionRecord> decisions;
}
```

---

## Phase 5: Asset Creation

### 5.1 Required Assets

| Asset Type | Quantity | Specs |
|------------|----------|-------|
| Character Sprites | 2 (personas) | 64x64 or 128x128 with animations |
| NPC Portraits | 4-6 | 256x256 |
| Location Tiles | 10-15 | 32x32 or 64x64 |
| Map Backgrounds | 2 (KL, Penang) | 1920x1080 or tilemap |
| UI Elements | 20+ | Various sizes |
| Icons | 15+ | 64x64 (stats, items) |

### 5.2 Recommended Tools

- **Aseprite** - Pixel art sprites ($20)
- **Tiled** - Free tilemap editor (export to Unity)
- **Figma** - UI design (free)
- **Canva** - Quick graphics (free)

### 5.3 Free Asset Alternatives

- [Kenney Assets](https://kenney.nl/assets) - Free game assets
- [OpenGameArt](https://opengameart.org/) - Free sprites
- [Unity Asset Store](https://assetstore.unity.com/) - Filter by "Free"

---

## Phase 6: Build & Deployment

### 6.1 Android Build

```bash
# Prerequisites:
# 1. Install Android SDK (via Unity Hub or Android Studio)
# 2. Set SDK path in Unity: Edit → Preferences → External Tools

# Build Steps:
# 1. File → Build Settings
# 2. Select Android
# 3. Click "Switch Platform"
# 4. Player Settings → Configure signing (see below)
# 5. Click "Build" or "Build and Run"
```

**Keystore Setup (Required for Release):**
```
Edit → Project Settings → Player → Publishing Settings:
1. Create new keystore
2. Set keystore password
3. Create new key alias
4. Set key password
5. Fill organization info
```

### 6.2 iOS Build

```bash
# Prerequisites:
# 1. macOS with Xcode installed
# 2. Apple Developer Account ($99/year)
# 3. iOS device for testing

# Build Steps:
# 1. File → Build Settings
# 2. Select iOS
# 3. Click "Switch Platform"
# 4. Click "Build"
# 5. Open generated Xcode project
# 6. Sign with your team/certificate
# 7. Build to device or archive for App Store
```

### 6.3 Publishing Checklist

**Google Play Store:**
- [ ] Create Google Play Developer Account ($25 one-time)
- [ ] Prepare store listing (screenshots, descriptions)
- [ ] Create privacy policy page
- [ ] Generate signed AAB (Android App Bundle)
- [ ] Complete content rating questionnaire
- [ ] Set up pricing/monetization

**Apple App Store:**
- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect setup
- [ ] Screenshots for all device sizes
- [ ] App preview video (optional)
- [ ] Privacy policy URL
- [ ] Age rating
- [ ] TestFlight for beta testing

---

## Phase 7: Backend Considerations

### 7.1 Options for Cloud Save & Analytics

Since your current stack uses Convex and TiDB, you have options:

**Option A: Keep Current Backend (Recommended)**
- Use REST API calls to your existing Next.js API routes
- Player saves sync to Convex
- Analytics go to TiDB
- Minimal backend changes needed

**Option B: Unity Gaming Services**
- Unity Cloud Save
- Unity Analytics
- Unity Authentication
- More Unity-native but requires migration

**Option C: Firebase**
- Firebase Auth
- Cloud Firestore (real-time DB)
- Firebase Analytics
- Good mobile support, free tier available

### 7.2 API Integration Example

```csharp
// BackendSync.cs
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

public class BackendSync : MonoBehaviour
{
    private const string API_BASE = "https://your-app.vercel.app/api";

    public void SyncGameToTiDB(GameData gameData)
    {
        StartCoroutine(PostGameData(gameData));
    }

    private IEnumerator PostGameData(GameData data)
    {
        string json = JsonUtility.ToJson(data);

        using (UnityWebRequest request = new UnityWebRequest($"{API_BASE}/analytics/sync", "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", "Bearer " + GetApiKey());

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Synced to TiDB successfully");
            }
            else
            {
                Debug.LogError($"Sync failed: {request.error}");
            }
        }
    }
}
```

---

## Phase 8: Timeline & Milestones

### Milestone 1: Core Foundation (Week 1-2)
- [ ] Unity project setup
- [ ] Folder structure
- [ ] GameManager singleton
- [ ] Basic player movement
- [ ] Scene transitions

### Milestone 2: Game Systems (Week 3-4)
- [ ] Location triggers
- [ ] Dialogue system
- [ ] Choice UI
- [ ] Stats HUD
- [ ] Save/Load system

### Milestone 3: AI Integration (Week 5)
- [ ] Claude API client
- [ ] Scenario generation
- [ ] Fallback scenarios
- [ ] Prompt porting from Next.js

### Milestone 4: Content & Polish (Week 6-7)
- [ ] All locations implemented
- [ ] Both personas playable
- [ ] All NPCs and dialogues
- [ ] Ending screen
- [ ] Sound effects & music

### Milestone 5: Mobile Polish (Week 8)
- [ ] Mobile input (joystick)
- [ ] Safe area handling
- [ ] Touch-friendly UI
- [ ] Performance optimization

### Milestone 6: Testing & Release (Week 9-10)
- [ ] Android build & testing
- [ ] iOS build & testing
- [ ] Bug fixes
- [ ] Store submissions

---

## Useful Resources

### Unity Learning
- [Unity Learn](https://learn.unity.com/) - Official tutorials
- [Brackeys YouTube](https://youtube.com/brackeys) - Best Unity tutorials
- [Code Monkey](https://youtube.com/codemonkey) - 2D game tutorials

### Mobile-Specific
- [Unity Mobile Manual](https://docs.unity3d.com/Manual/MobileInput.html)
- [Android Publishing Guide](https://docs.unity3d.com/Manual/android-GettingStarted.html)
- [iOS Publishing Guide](https://docs.unity3d.com/Manual/iphone-GettingStarted.html)

### Asset Store (Recommended Purchases)
- **Joystick Pack** - Mobile controls (Free)
- **DOTween** - Animation tweening (Free)
- **TextMesh Pro** - Better text (Included in Unity)

### Code Packages
- [UniTask](https://github.com/Cysharp/UniTask) - Better async/await
- [Newtonsoft JSON](https://docs.unity3d.com/Packages/com.unity.nuget.newtonsoft-json@3.0/) - JSON parsing

---

## Migration Checklist from Next.js

| Next.js Component | Unity Equivalent |
|-------------------|------------------|
| `lib/constants.ts` | ScriptableObjects + Constants.cs |
| `lib/prompts.ts` | Resources/Prompts/*.txt |
| `convex/schema.ts` | Data classes (GameData.cs, etc.) |
| `convex/games.ts` | GameManager.cs |
| `convex/ai.ts` | ClaudeAPIClient.cs + ScenarioManager.cs |
| `app/game/page.tsx` | Game scene + UI canvases |
| `app/ending/page.tsx` | Ending scene |
| Tailwind CSS | Unity UI + TextMesh Pro |
| Framer Motion | DOTween or Unity Animator |

---

## Quick Start Commands

```bash
# Clone and setup
git clone <your-repo>
cd B40LifeSimulator-Unity

# Open in Unity Hub
# Unity Hub → Add → Select project folder

# Required packages (install via Package Manager):
# - TextMesh Pro
# - 2D Sprite
# - Input System (optional, for new input)
# - Newtonsoft JSON

# First build test
# File → Build Settings → Android/iOS → Build
```

---

## Support & Next Steps

1. **Start with Phase 1-2** - Get the foundation right
2. **Use placeholder art** - Focus on mechanics first
3. **Test on device early** - Don't wait until the end
4. **Iterate quickly** - Mobile testing reveals issues desktop doesn't

Good luck with your rebuild! The core game loop from your Next.js version will translate well to Unity.
