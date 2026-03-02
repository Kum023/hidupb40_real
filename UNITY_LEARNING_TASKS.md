# Unity Learning Tasks for Experienced Developers

Welcome! This guide is designed for developers with coding experience but new to Unity. Each task builds on the previous one, teaching you Unity-specific concepts you'll need for the B40 Life Simulator rebuild.

---

## How Unity Works (Quick Concepts)

Before starting, understand these Unity fundamentals:

| Concept | What It Is | Coming From Web Dev |
|---------|-----------|---------------------|
| **Scene** | A level/screen in your game | Like a page/route |
| **GameObject** | Everything in a scene (player, UI, camera) | Like a DOM element |
| **Component** | Behavior attached to GameObjects | Like a React hook/mixin |
| **Script** | C# code that becomes a Component | Your actual code |
| **Prefab** | Reusable GameObject template | Like a React component |
| **Inspector** | Edit properties visually | Like browser DevTools |
| **Hierarchy** | Tree of all GameObjects in scene | Like DOM tree |
| **Project** | All your files/assets | Like your `src/` folder |

---

## Task 1: Hello Unity - Create Your First Scene

**Goal:** Understand the Unity Editor and create a simple scene.

**What You'll Learn:**
- Unity Editor layout
- Creating GameObjects
- Using the Inspector
- Running the game

### Steps:

1. **Open Unity Hub** → New Project → 2D (URP) → Name it "UnityLearning"

2. **Understand the Editor Layout:**
   ```
   ┌─────────────────────────────────────────────────────┐
   │  Hierarchy  │        Scene View        │ Inspector  │
   │  (objects)  │    (visual editor)       │ (details)  │
   │             │                          │            │
   │             ├─────────────────────────-┤            │
   │             │        Game View         │            │
   │             │    (what player sees)    │            │
   ├─────────────┴──────────────────────────┴────────────┤
   │                    Project (files)                   │
   └─────────────────────────────────────────────────────┘
   ```

3. **Create a Sprite:**
   - Right-click in Hierarchy → 2D Object → Sprites → Square
   - This creates a white square GameObject

4. **Inspect It:**
   - Click the Square in Hierarchy
   - Look at Inspector panel on the right
   - You'll see components: Transform, Sprite Renderer

5. **Modify in Inspector:**
   - Change Position X to `2`
   - Change Scale X and Y to `0.5`
   - In Sprite Renderer, click Color → pick a color

6. **Play the Game:**
   - Press the **Play button** (▶) at top center
   - You should see your colored square
   - Press Play again to stop

### ✅ Checkpoint:
You should have a colored square visible in the Game view.

---

## Task 2: Your First Script - Make Something Move

**Goal:** Write C# code that controls a GameObject.

**What You'll Learn:**
- Creating scripts
- MonoBehaviour lifecycle (Start, Update)
- Accessing Transform component
- Public variables in Inspector

### Steps:

1. **Create a Scripts Folder:**
   - In Project panel, right-click → Create → Folder → name it "Scripts"

2. **Create a Script:**
   - Right-click Scripts folder → Create → C# Script
   - Name it `Mover` (important: name it before pressing Enter)

3. **Open the Script:**
   - Double-click `Mover.cs` to open in VS Code/Visual Studio
   - You'll see:

   ```csharp
   using UnityEngine;

   public class Mover : MonoBehaviour
   {
       // Start is called before the first frame update
       void Start()
       {

       }

       // Update is called once per frame
       void Update()
       {

       }
   }
   ```

4. **Write Movement Code:**
   ```csharp
   using UnityEngine;

   public class Mover : MonoBehaviour
   {
       // This appears in Inspector!
       public float speed = 5f;

       void Update()
       {
           // Get input (-1, 0, or 1)
           float horizontal = Input.GetAxisRaw("Horizontal");
           float vertical = Input.GetAxisRaw("Vertical");

           // Create movement vector
           Vector3 movement = new Vector3(horizontal, vertical, 0);

           // Move the object
           transform.position += movement * speed * Time.deltaTime;
       }
   }
   ```

5. **Attach Script to GameObject:**
   - Save the script (Ctrl+S)
   - Go back to Unity
   - Click your Square in Hierarchy
   - Drag `Mover.cs` from Project to Inspector
   - OR: In Inspector, click "Add Component" → type "Mover"

6. **Test It:**
   - Press Play
   - Use Arrow keys or WASD to move the square
   - While playing, change `Speed` in Inspector - it updates live!

### 💡 Key Concepts:

```csharp
// MonoBehaviour = Unity component base class
public class Mover : MonoBehaviour

// Runs once when game starts
void Start() { }

// Runs every frame (60+ times per second)
void Update() { }

// 'transform' is the position/rotation/scale component
// Every GameObject has one automatically
transform.position

// Time.deltaTime = time since last frame
// Makes movement frame-rate independent
speed * Time.deltaTime

// 'public' variables show in Inspector
public float speed = 5f;
```

### ✅ Checkpoint:
Your square moves with arrow keys/WASD.

---

## Task 3: Physics & Collisions

**Goal:** Use Unity's physics system and detect collisions.

**What You'll Learn:**
- Rigidbody2D component
- Collider2D components
- Collision/Trigger events
- Tags

### Steps:

1. **Add Physics to Player:**
   - Click your Square
   - Add Component → Rigidbody 2D
   - Set "Gravity Scale" to `0` (we don't want falling)
   - Set "Collision Detection" to `Continuous`
   - Add Component → Box Collider 2D

2. **Update Movement Script for Physics:**
   ```csharp
   using UnityEngine;

   public class Mover : MonoBehaviour
   {
       public float speed = 5f;

       // Reference to Rigidbody2D
       private Rigidbody2D rb;
       private Vector2 movement;

       void Start()
       {
           // Get the Rigidbody2D component
           rb = GetComponent<Rigidbody2D>();
       }

       void Update()
       {
           // Get input in Update (runs every frame)
           movement.x = Input.GetAxisRaw("Horizontal");
           movement.y = Input.GetAxisRaw("Vertical");
       }

       void FixedUpdate()
       {
           // Physics movement in FixedUpdate (fixed time steps)
           rb.MovePosition(rb.position + movement * speed * Time.fixedDeltaTime);
       }
   }
   ```

3. **Create a Wall:**
   - Hierarchy → 2D Object → Sprites → Square
   - Rename to "Wall"
   - Scale it to X: `5`, Y: `0.3`
   - Position it at Y: `3`
   - Add Component → Box Collider 2D
   - Color it differently

4. **Create a Trigger Zone (like your game locations):**
   - Hierarchy → 2D Object → Sprites → Circle
   - Rename to "TriggerZone"
   - Add Component → Circle Collider 2D
   - Check **"Is Trigger"** in the Collider
   - Scale to `2, 2, 1`

5. **Create Trigger Detection Script:**
   ```csharp
   // TriggerZone.cs
   using UnityEngine;

   public class TriggerZone : MonoBehaviour
   {
       public string zoneName = "Shop";
       public Color highlightColor = Color.yellow;

       private SpriteRenderer spriteRenderer;
       private Color originalColor;

       void Start()
       {
           spriteRenderer = GetComponent<SpriteRenderer>();
           originalColor = spriteRenderer.color;
       }

       // Called when something ENTERS the trigger
       void OnTriggerEnter2D(Collider2D other)
       {
           if (other.CompareTag("Player"))
           {
               Debug.Log($"Player entered {zoneName}!");
               spriteRenderer.color = highlightColor;
           }
       }

       // Called when something EXITS the trigger
       void OnTriggerExit2D(Collider2D other)
       {
           if (other.CompareTag("Player"))
           {
               Debug.Log($"Player left {zoneName}");
               spriteRenderer.color = originalColor;
           }
       }
   }
   ```

6. **Tag the Player:**
   - Click your Square (player)
   - In Inspector, click "Tag" dropdown → "Player"
   - (Player tag exists by default)

7. **Attach Script to Trigger:**
   - Attach `TriggerZone.cs` to your circle
   - Set Zone Name to "Shop" in Inspector

8. **Test It:**
   - Press Play
   - Move into the circle - it changes color
   - Check Console (Window → General → Console) for debug messages

### 💡 Key Concepts:

```csharp
// Get a component on the same GameObject
rb = GetComponent<Rigidbody2D>();

// FixedUpdate for physics (consistent timing)
void FixedUpdate() { }

// Collision events (solid objects)
void OnCollisionEnter2D(Collision2D collision) { }
void OnCollisionExit2D(Collision2D collision) { }

// Trigger events (walkthrough zones)
void OnTriggerEnter2D(Collider2D other) { }
void OnTriggerExit2D(Collider2D other) { }

// Check tags
other.CompareTag("Player")

// Debug logging (shows in Console)
Debug.Log("message");
```

### ✅ Checkpoint:
- Player stops at wall
- Circle highlights when player enters
- Console shows enter/exit messages

---

## Task 4: UI System - Stats Display

**Goal:** Create UI elements like health bars and text displays.

**What You'll Learn:**
- Canvas system
- UI components (Text, Image, Button)
- Anchoring for different screen sizes
- Updating UI from code

### Steps:

1. **Create a Canvas:**
   - Hierarchy → Right-click → UI → Canvas
   - A Canvas and EventSystem are created
   - Canvas renders all UI on top of the game

2. **Set Canvas for 2D:**
   - Click Canvas in Hierarchy
   - Set "Render Mode" to `Screen Space - Overlay`
   - Click "Canvas Scaler" component
   - Set "UI Scale Mode" to `Scale With Screen Size`
   - Set Reference Resolution to `1920 x 1080`

3. **Create Stats Panel:**
   - Right-click Canvas → UI → Panel
   - Rename to "StatsPanel"
   - In Rect Transform, click the anchor preset (square icon)
   - Hold Alt and click "top-left"
   - Set Width: `300`, Height: `150`
   - Set Pos X: `160`, Pos Y: `-85`

4. **Add Money Text:**
   - Right-click StatsPanel → UI → Text - TextMeshPro
   - Click "Import TMP Essentials" if prompted
   - Rename to "MoneyText"
   - Set text to "Money: RM 800"
   - Anchor to top-left of panel
   - Position and style as desired

5. **Add Health Bar:**
   - Right-click StatsPanel → UI → Slider
   - Rename to "HealthBar"
   - Uncheck "Interactable" (it's display only)
   - Delete the "Handle Slide Area" child
   - Set Min Value: 0, Max Value: 100, Value: 100
   - Style the Fill with green color

6. **Create UI Manager Script:**
   ```csharp
   // UIManager.cs
   using UnityEngine;
   using UnityEngine.UI;
   using TMPro;

   public class UIManager : MonoBehaviour
   {
       // Singleton pattern
       public static UIManager Instance { get; private set; }

       [Header("Stats Display")]
       public TextMeshProUGUI moneyText;
       public TextMeshProUGUI debtText;
       public Slider healthBar;
       public Slider stressBar;

       [Header("Message Display")]
       public GameObject messagePanel;
       public TextMeshProUGUI messageText;

       void Awake()
       {
           // Singleton setup
           if (Instance == null)
           {
               Instance = this;
           }
           else
           {
               Destroy(gameObject);
           }
       }

       public void UpdateMoney(int amount)
       {
           moneyText.text = $"Money: RM {amount:N0}";
       }

       public void UpdateDebt(int amount)
       {
           debtText.text = $"Debt: RM {amount:N0}";
       }

       public void UpdateHealth(int value)
       {
           healthBar.value = value;
       }

       public void UpdateStress(int value)
       {
           stressBar.value = value;
       }

       public void ShowMessage(string message, float duration = 2f)
       {
           messageText.text = message;
           messagePanel.SetActive(true);

           // Hide after duration
           Invoke(nameof(HideMessage), duration);
       }

       private void HideMessage()
       {
           messagePanel.SetActive(false);
       }
   }
   ```

7. **Connect UI in Inspector:**
   - Create empty GameObject "Managers"
   - Attach UIManager script
   - Drag your UI elements to the script fields in Inspector

8. **Test from TriggerZone:**
   ```csharp
   // Update TriggerZone.cs
   void OnTriggerEnter2D(Collider2D other)
   {
       if (other.CompareTag("Player"))
       {
           UIManager.Instance.ShowMessage($"Welcome to {zoneName}!");
       }
   }
   ```

### 💡 Key Concepts:

```csharp
// Singleton pattern - access from anywhere
public static UIManager Instance { get; private set; }
UIManager.Instance.UpdateMoney(500);

// TextMeshPro for better text
using TMPro;
public TextMeshProUGUI myText;

// UI Slider for bars
public Slider healthBar;
healthBar.value = 75;

// String formatting
$"Money: RM {amount:N0}"  // N0 = number with commas, no decimals

// Delayed method call
Invoke(nameof(HideMessage), 2f);  // Call HideMessage after 2 seconds
```

### ✅ Checkpoint:
- Stats panel visible in top-left
- Message appears when entering trigger zone

---

## Task 5: Scene Management & Game Flow

**Goal:** Create multiple scenes and navigate between them.

**What You'll Learn:**
- Creating and loading scenes
- Passing data between scenes
- DontDestroyOnLoad
- Scene build settings

### Steps:

1. **Create Scene Folder:**
   - Project → Create → Folder → "Scenes"

2. **Save Current Scene:**
   - File → Save As
   - Save to Scenes folder as "Game"

3. **Create Main Menu Scene:**
   - File → New Scene
   - Save as "MainMenu" in Scenes folder

4. **Add Scenes to Build:**
   - File → Build Settings
   - Click "Add Open Scenes" for each scene
   - Drag to reorder: MainMenu should be index 0

5. **Create Main Menu UI:**
   - In MainMenu scene, create Canvas
   - Add Panel (full screen background)
   - Add Title text: "B40 Life Simulator"
   - Add Button → rename to "StartButton"
   - Set button text to "Start Game"

6. **Create Scene Loader Script:**
   ```csharp
   // SceneLoader.cs
   using UnityEngine;
   using UnityEngine.SceneManagement;

   public class SceneLoader : MonoBehaviour
   {
       public void LoadScene(string sceneName)
       {
           SceneManager.LoadScene(sceneName);
       }

       public void LoadSceneByIndex(int index)
       {
           SceneManager.LoadScene(index);
       }

       public void ReloadCurrentScene()
       {
           SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
       }

       public void QuitGame()
       {
           Debug.Log("Quitting...");
           Application.Quit();
       }
   }
   ```

7. **Connect Button to Script:**
   - Attach SceneLoader to an empty GameObject "SceneManager"
   - Click StartButton
   - In Inspector, find "On Click ()"
   - Click + to add event
   - Drag SceneManager object to the field
   - Select Function → SceneLoader → LoadScene (string)
   - Type "Game" in the text field

8. **Create Persistent Game Manager:**
   ```csharp
   // GameManager.cs
   using UnityEngine;

   public class GameManager : MonoBehaviour
   {
       public static GameManager Instance { get; private set; }

       [Header("Player Stats")]
       public int money = 800;
       public int debt = 30000;
       public int health = 100;
       public int stress = 0;

       [Header("Selected Persona")]
       public string selectedPersona;

       void Awake()
       {
           // Singleton that persists between scenes
           if (Instance == null)
           {
               Instance = this;
               DontDestroyOnLoad(gameObject);  // KEY: survives scene loads
           }
           else
           {
               Destroy(gameObject);
           }
       }

       public void SelectPersona(string persona)
       {
           selectedPersona = persona;

           // Set starting stats based on persona
           if (persona == "freshgrad")
           {
               money = 800;
               debt = 30000;
           }
           else if (persona == "singleparent")
           {
               money = 500;
               debt = 7000;
           }
       }

       public void SpendMoney(int amount)
       {
           money -= amount;
           // Update UI if it exists
           if (UIManager.Instance != null)
           {
               UIManager.Instance.UpdateMoney(money);
           }
       }
   }
   ```

9. **Add GameManager to MainMenu:**
   - Create empty GameObject "GameManager"
   - Attach GameManager script
   - It will persist to all scenes

10. **Test the Flow:**
    - Play from MainMenu scene
    - Click Start
    - Should load Game scene
    - GameManager should still exist (check Hierarchy)

### 💡 Key Concepts:

```csharp
// Load scene by name
SceneManager.LoadScene("Game");

// Load scene by build index
SceneManager.LoadScene(0);

// Get current scene info
SceneManager.GetActiveScene().name
SceneManager.GetActiveScene().buildIndex

// Persist object between scenes
DontDestroyOnLoad(gameObject);

// Check if object exists before using
if (UIManager.Instance != null)
{
    UIManager.Instance.UpdateMoney(money);
}
```

### ✅ Checkpoint:
- Can navigate from MainMenu to Game
- GameManager persists between scenes

---

## Task 6: Scriptable Objects - Data Containers

**Goal:** Create reusable data assets (like your personas and locations).

**What You'll Learn:**
- Creating ScriptableObject classes
- Creating asset instances
- Loading data at runtime

### Steps:

1. **Create ScriptableObject for Persona:**
   ```csharp
   // PersonaData.cs
   using UnityEngine;

   [CreateAssetMenu(fileName = "NewPersona", menuName = "B40/Persona Data")]
   public class PersonaData : ScriptableObject
   {
       [Header("Identity")]
       public string personaId;
       public string displayName;
       [TextArea(3, 5)]
       public string description;
       public Sprite portrait;

       [Header("Starting Stats")]
       public int startingMoney = 800;
       public int startingDebt = 30000;
       public int startingCreditScore = 650;
       public int monthlySalary = 2200;

       [Header("Debt Info")]
       public string debtType;
       public int minimumPayment = 200;

       [Header("Map")]
       public string mapId;
   }
   ```

2. **Create Persona Assets:**
   - Project → Right-click → Create → B40 → Persona Data
   - Name it "FreshGrad"
   - Fill in the fields in Inspector:
     - personaId: "freshgrad"
     - displayName: "Fresh Graduate"
     - description: "Just graduated, living in KL..."
     - startingMoney: 800
     - startingDebt: 30000
     - etc.
   - Create another for "SingleParent"

3. **Create ScriptableObject for Location:**
   ```csharp
   // LocationData.cs
   using UnityEngine;

   [CreateAssetMenu(fileName = "NewLocation", menuName = "B40/Location Data")]
   public class LocationData : ScriptableObject
   {
       public string locationId;
       public string displayName;
       public Sprite icon;
       public Vector2 mapPosition;

       [Header("Gameplay")]
       public int energyCost = 1;
       public bool isWeekendOnly = false;

       [Header("Scenarios")]
       [TextArea(2, 4)]
       public string[] possibleScenarios;
   }
   ```

4. **Create Location Assets:**
   - Create → B40 → Location Data
   - Create: Shop, Office, Bank, Home, PetrolStation

5. **Use ScriptableObjects in Code:**
   ```csharp
   // Updated GameManager.cs
   using UnityEngine;

   public class GameManager : MonoBehaviour
   {
       public static GameManager Instance { get; private set; }

       [Header("Persona Selection")]
       public PersonaData[] availablePersonas;  // Assign in Inspector
       public PersonaData currentPersona;

       [Header("Current Stats")]
       public int money;
       public int debt;
       public int creditScore;
       public int health = 100;
       public int stress = 0;

       void Awake()
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

       public void SelectPersona(int index)
       {
           currentPersona = availablePersonas[index];
           InitializeFromPersona();
       }

       public void SelectPersona(PersonaData persona)
       {
           currentPersona = persona;
           InitializeFromPersona();
       }

       private void InitializeFromPersona()
       {
           money = currentPersona.startingMoney;
           debt = currentPersona.startingDebt;
           creditScore = currentPersona.startingCreditScore;
           health = 100;
           stress = 0;
       }
   }
   ```

6. **Assign in Inspector:**
   - Select GameManager object
   - Expand "Available Personas" array
   - Set Size to 2
   - Drag FreshGrad and SingleParent assets to slots

7. **Use Location Data in Trigger:**
   ```csharp
   // Updated TriggerZone.cs
   using UnityEngine;

   public class TriggerZone : MonoBehaviour
   {
       public LocationData locationData;  // Assign the ScriptableObject

       private SpriteRenderer spriteRenderer;
       private Color originalColor;

       void Start()
       {
           spriteRenderer = GetComponent<SpriteRenderer>();
           originalColor = spriteRenderer.color;
       }

       void OnTriggerEnter2D(Collider2D other)
       {
           if (other.CompareTag("Player"))
           {
               string message = $"Welcome to {locationData.displayName}!\nEnergy cost: {locationData.energyCost}";
               UIManager.Instance.ShowMessage(message);
               spriteRenderer.color = Color.yellow;
           }
       }

       void OnTriggerExit2D(Collider2D other)
       {
           if (other.CompareTag("Player"))
           {
               spriteRenderer.color = originalColor;
           }
       }
   }
   ```

### 💡 Key Concepts:

```csharp
// Makes it appear in Create menu
[CreateAssetMenu(fileName = "NewPersona", menuName = "B40/Persona Data")]

// ScriptableObject = data container asset
public class PersonaData : ScriptableObject

// TextArea for multi-line strings in Inspector
[TextArea(3, 5)]
public string description;

// Reference ScriptableObject in code
public PersonaData currentPersona;
int money = currentPersona.startingMoney;

// Array of ScriptableObjects
public PersonaData[] availablePersonas;
```

### ✅ Checkpoint:
- Created persona and location data assets
- GameManager loads stats from selected persona
- TriggerZone displays location name from data

---

## Task 7: Dialogue System with Choices

**Goal:** Build a dialogue/choice system like your game scenarios.

**What You'll Learn:**
- Complex UI panels
- Button generation from code
- Coroutines for sequencing
- Events and callbacks

### Steps:

1. **Create Dialogue Panel UI:**
   ```
   Canvas
   └── DialoguePanel (Panel - full screen semi-transparent)
       ├── DialogueBox (Panel - bottom of screen)
       │   ├── NarratorText (TextMeshPro)
       │   ├── NPCPanel (horizontal layout)
       │   │   ├── NPCPortrait (Image)
       │   │   └── NPCDialogue (TextMeshPro)
       │   └── ChoicesContainer (Vertical Layout Group)
       └── ContinuePrompt (Text - "Tap to continue")
   ```

2. **Create Choice Button Prefab:**
   - Create UI → Button - TextMeshPro
   - Style it (background, text color, size)
   - Add a script slot (we'll make ChoiceButton.cs)
   - Drag to Project folder to make Prefab
   - Delete from scene

3. **Create Scenario Data Structure:**
   ```csharp
   // ScenarioData.cs
   using System;

   [Serializable]
   public class ScenarioData
   {
       public string narration;
       public string npcName;
       public string npcDialogue;
       public ChoiceData[] choices;
   }

   [Serializable]
   public class ChoiceData
   {
       public string text;
       public int moneyChange;
       public int healthChange;
       public int stressChange;
       public int creditChange;
       public string resultMessage;
   }
   ```

4. **Create Dialogue Manager:**
   ```csharp
   // DialogueManager.cs
   using UnityEngine;
   using UnityEngine.UI;
   using TMPro;
   using System.Collections;

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
       public GameObject continuePrompt;

       [Header("Settings")]
       public float typingSpeed = 0.03f;

       private ScenarioData currentScenario;
       private bool isTyping;
       private bool waitingForInput;

       void Awake()
       {
           Instance = this;
           dialoguePanel.SetActive(false);
       }

       void Update()
       {
           // Tap to skip/continue
           if (waitingForInput && Input.GetMouseButtonDown(0))
           {
               waitingForInput = false;
           }

           // Skip typing
           if (isTyping && Input.GetMouseButtonDown(0))
           {
               isTyping = false;
           }
       }

       public void StartScenario(ScenarioData scenario)
       {
           currentScenario = scenario;
           dialoguePanel.SetActive(true);

           // Disable player movement
           var player = FindObjectOfType<Mover>();
           if (player != null) player.enabled = false;

           // Clear previous
           ClearChoices();

           // Start dialogue sequence
           StartCoroutine(PlayScenario());
       }

       private IEnumerator PlayScenario()
       {
           // Show narration
           yield return TypeText(narratorText, currentScenario.narration);

           // Wait for tap
           continuePrompt.SetActive(true);
           waitingForInput = true;
           yield return new WaitUntil(() => !waitingForInput);
           continuePrompt.SetActive(false);

           // Show NPC dialogue if exists
           if (!string.IsNullOrEmpty(currentScenario.npcDialogue))
           {
               npcNameText.text = currentScenario.npcName;
               yield return TypeText(npcDialogueText, currentScenario.npcDialogue);

               continuePrompt.SetActive(true);
               waitingForInput = true;
               yield return new WaitUntil(() => !waitingForInput);
               continuePrompt.SetActive(false);
           }

           // Show choices
           ShowChoices();
       }

       private IEnumerator TypeText(TextMeshProUGUI textComponent, string text)
       {
           isTyping = true;
           textComponent.text = "";

           foreach (char c in text)
           {
               if (!isTyping)
               {
                   // Skip to end
                   textComponent.text = text;
                   break;
               }

               textComponent.text += c;
               yield return new WaitForSeconds(typingSpeed);
           }

           isTyping = false;
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

               // Capture index for closure
               int choiceIndex = i;
               button.onClick.AddListener(() => OnChoiceSelected(choiceIndex));
           }
       }

       private void OnChoiceSelected(int index)
       {
           var choice = currentScenario.choices[index];

           // Apply consequences
           GameManager.Instance.money += choice.moneyChange;
           GameManager.Instance.health += choice.healthChange;
           GameManager.Instance.stress += choice.stressChange;
           GameManager.Instance.creditScore += choice.creditChange;

           // Update UI
           UIManager.Instance.UpdateMoney(GameManager.Instance.money);
           UIManager.Instance.UpdateHealth(GameManager.Instance.health);

           // Show result
           StartCoroutine(ShowResultAndClose(choice.resultMessage));
       }

       private IEnumerator ShowResultAndClose(string message)
       {
           ClearChoices();
           yield return TypeText(narratorText, message);

           yield return new WaitForSeconds(1.5f);

           CloseDialogue();
       }

       private void ClearChoices()
       {
           foreach (Transform child in choicesContainer)
           {
               Destroy(child.gameObject);
           }
       }

       private void CloseDialogue()
       {
           dialoguePanel.SetActive(false);

           // Re-enable player movement
           var player = FindObjectOfType<Mover>();
           if (player != null) player.enabled = true;
       }
   }
   ```

5. **Create Test Scenario:**
   ```csharp
   // Add to TriggerZone.cs
   void OnTriggerEnter2D(Collider2D other)
   {
       if (other.CompareTag("Player"))
       {
           // Create test scenario
           var scenario = new ScenarioData
           {
               narration = "You enter the kedai runcit. The smell of instant noodles and cigarettes fills the air.",
               npcName = "Pak Ali",
               npcDialogue = "Eh, dik! Lama tak nampak. Nak beli apa hari ni?",
               choices = new ChoiceData[]
               {
                   new ChoiceData
                   {
                       text = "Buy groceries for the week (RM50)",
                       moneyChange = -50,
                       healthChange = 10,
                       stressChange = -5,
                       resultMessage = "You bought rice, eggs, and vegetables. Should last the week."
                   },
                   new ChoiceData
                   {
                       text = "Just buy instant noodles (RM10)",
                       moneyChange = -10,
                       healthChange = -5,
                       stressChange = 0,
                       resultMessage = "Maggi again... at least it's cheap."
                   },
                   new ChoiceData
                   {
                       text = "\"Takpe Pak Ali, tengok-tengok je.\"",
                       moneyChange = 0,
                       healthChange = 0,
                       stressChange = 5,
                       resultMessage = "You leave empty-handed. Your stomach growls in protest."
                   }
               }
           };

           DialogueManager.Instance.StartScenario(scenario);
       }
   }
   ```

### 💡 Key Concepts:

```csharp
// Coroutine = run code over multiple frames
IEnumerator PlayScenario()
{
    yield return TypeText(text);           // Wait for typing to finish
    yield return new WaitForSeconds(1f);    // Wait 1 second
    yield return new WaitUntil(() => !waiting);  // Wait for condition
}

// Start a coroutine
StartCoroutine(PlayScenario());

// Dynamic button creation
var buttonObj = Instantiate(choiceButtonPrefab, choicesContainer);
button.onClick.AddListener(() => OnChoiceSelected(index));

// Closure capture (important in loops!)
int choiceIndex = i;  // Capture current value
button.onClick.AddListener(() => OnChoiceSelected(choiceIndex));
```

### ✅ Checkpoint:
- Dialogue panel appears with typing effect
- Choices appear after dialogue
- Selecting choice applies consequences
- Panel closes and player can move again

---

## Task 8: HTTP Requests - Claude API Integration

**Goal:** Call external APIs (like Claude) from Unity.

**What You'll Learn:**
- UnityWebRequest
- JSON serialization
- Async patterns in Unity
- Error handling

### Steps:

1. **Create API Client:**
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

       [SerializeField] private string apiKey = "your-api-key-here";

       private const string API_URL = "https://api.anthropic.com/v1/messages";
       private const string MODEL = "claude-3-5-haiku-20241022";

       void Awake()
       {
           Instance = this;
       }

       public void GenerateScenario(
           string locationId,
           Action<ScenarioData> onSuccess,
           Action<string> onError)
       {
           string systemPrompt = BuildSystemPrompt();
           string userPrompt = BuildUserPrompt(locationId);

           StartCoroutine(SendRequest(systemPrompt, userPrompt, onSuccess, onError));
       }

       private string BuildSystemPrompt()
       {
           return @"You are a game master for B40 Life Simulator, a financial literacy game set in Malaysia.
   Generate scenarios in JSON format with:
   - narration: Scene description (2-3 sentences)
   - npcName: NPC name if applicable
   - npcDialogue: What NPC says (use some Manglish)
   - choices: Array of 3 choices, each with:
     - text: Choice description
     - moneyChange: int (-100 to 100)
     - healthChange: int (-20 to 20)
     - stressChange: int (-20 to 20)
     - creditChange: int (-50 to 50)
     - resultMessage: Consequence description

   Respond ONLY with valid JSON.";
       }

       private string BuildUserPrompt(string locationId)
       {
           var gm = GameManager.Instance;
           return $@"Generate a scenario for location: {locationId}

   Current player state:
   - Persona: {gm.currentPersona?.displayName ?? "Fresh Graduate"}
   - Money: RM{gm.money}
   - Debt: RM{gm.debt}
   - Health: {gm.health}%
   - Stress: {gm.stress}%
   - Credit Score: {gm.creditScore}";
       }

       private IEnumerator SendRequest(
           string systemPrompt,
           string userPrompt,
           Action<ScenarioData> onSuccess,
           Action<string> onError)
       {
           // Build request body
           var requestObj = new ClaudeRequest
           {
               model = MODEL,
               max_tokens = 1024,
               system = systemPrompt,
               messages = new Message[]
               {
                   new Message { role = "user", content = userPrompt }
               }
           };

           string jsonBody = JsonUtility.ToJson(requestObj);
           Debug.Log($"Request: {jsonBody}");

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
                   Debug.Log($"Response: {request.downloadHandler.text}");

                   try
                   {
                       // Parse Claude response
                       var response = JsonUtility.FromJson<ClaudeResponse>(
                           request.downloadHandler.text);

                       // Extract JSON from content
                       string scenarioJson = response.content[0].text;

                       // Parse scenario
                       var scenario = JsonUtility.FromJson<ScenarioData>(scenarioJson);
                       onSuccess?.Invoke(scenario);
                   }
                   catch (Exception e)
                   {
                       Debug.LogError($"Parse error: {e.Message}");
                       onError?.Invoke("Failed to parse response");
                   }
               }
               else
               {
                   Debug.LogError($"API error: {request.error}");
                   Debug.LogError($"Response: {request.downloadHandler.text}");
                   onError?.Invoke(request.error);
               }
           }
       }
   }

   // JSON classes
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
   ```

2. **Add Loading State:**
   ```csharp
   // Add to UIManager.cs
   public GameObject loadingPanel;
   public TextMeshProUGUI loadingText;

   public void ShowLoading(string message = "Loading...")
   {
       loadingText.text = message;
       loadingPanel.SetActive(true);
   }

   public void HideLoading()
   {
       loadingPanel.SetActive(false);
   }
   ```

3. **Update TriggerZone to Use API:**
   ```csharp
   // Updated TriggerZone.cs
   using UnityEngine;

   public class TriggerZone : MonoBehaviour
   {
       public LocationData locationData;
       public bool useAI = true;

       private bool isGenerating;

       void OnTriggerEnter2D(Collider2D other)
       {
           if (other.CompareTag("Player") && !isGenerating)
           {
               TriggerScenario();
           }
       }

       private void TriggerScenario()
       {
           if (useAI)
           {
               isGenerating = true;
               UIManager.Instance.ShowLoading("Generating scenario...");

               ClaudeAPIClient.Instance.GenerateScenario(
                   locationData.locationId,
                   OnScenarioGenerated,
                   OnScenarioError
               );
           }
           else
           {
               // Use fallback
               DialogueManager.Instance.StartScenario(GetFallbackScenario());
           }
       }

       private void OnScenarioGenerated(ScenarioData scenario)
       {
           isGenerating = false;
           UIManager.Instance.HideLoading();
           DialogueManager.Instance.StartScenario(scenario);
       }

       private void OnScenarioError(string error)
       {
           isGenerating = false;
           UIManager.Instance.HideLoading();
           UIManager.Instance.ShowMessage($"Error: {error}. Using fallback.");
           DialogueManager.Instance.StartScenario(GetFallbackScenario());
       }

       private ScenarioData GetFallbackScenario()
       {
           // Return a pre-made scenario
           return new ScenarioData
           {
               narration = $"You arrive at {locationData.displayName}.",
               choices = new ChoiceData[]
               {
                   new ChoiceData { text = "Look around", resultMessage = "Nothing special." },
                   new ChoiceData { text = "Leave", resultMessage = "You walk away." }
               }
           };
       }
   }
   ```

4. **Secure API Key (Important!):**
   ```csharp
   // For development: Use Inspector
   // For production: Use environment or config file

   // Option 1: Load from StreamingAssets
   private IEnumerator LoadApiKey()
   {
       string path = Path.Combine(Application.streamingAssetsPath, "config.json");

       using (UnityWebRequest request = UnityWebRequest.Get(path))
       {
           yield return request.SendWebRequest();

           if (request.result == UnityWebRequest.Result.Success)
           {
               var config = JsonUtility.FromJson<Config>(request.downloadHandler.text);
               apiKey = config.anthropicApiKey;
           }
       }
   }

   // Option 2: Use a backend proxy (recommended for production)
   // Route through your own server that has the API key
   ```

### 💡 Key Concepts:

```csharp
// UnityWebRequest for HTTP calls
UnityWebRequest request = new UnityWebRequest(url, "POST");
request.SetRequestHeader("Content-Type", "application/json");

// Upload data
request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));

// Download data
request.downloadHandler = new DownloadHandlerBuffer();
string response = request.downloadHandler.text;

// Wait for completion
yield return request.SendWebRequest();

// Check result
if (request.result == UnityWebRequest.Result.Success) { }

// Callbacks for async results
Action<ScenarioData> onSuccess
Action<string> onError
```

### ✅ Checkpoint:
- API calls work (check Console for logs)
- Loading indicator shows during request
- Fallback scenarios work when API fails

---

## Task 9: Mobile Build Test

**Goal:** Build and test on an actual device.

**What You'll Learn:**
- Build process
- Mobile-specific issues
- Touch input
- Performance testing

### Steps:

1. **Android Setup:**
   - Edit → Preferences → External Tools
   - Set Android SDK path (install via Unity Hub if needed)
   - Set JDK path

2. **Build Settings:**
   - File → Build Settings
   - Select Android
   - Click "Switch Platform"
   - Player Settings:
     - Company Name, Product Name
     - Package Name: com.yourname.b40lifesim
     - Minimum API Level: Android 7.0
     - Target: Automatic

3. **Quick Test Build:**
   - Connect Android device via USB
   - Enable Developer Mode and USB Debugging on device
   - Click "Build and Run"
   - Select save location for APK

4. **Add Touch Input:**
   ```csharp
   // TouchInput.cs
   using UnityEngine;

   public class TouchInput : MonoBehaviour
   {
       public static Vector2 TouchPosition { get; private set; }
       public static bool IsTouching { get; private set; }
       public static bool TouchBegan { get; private set; }
       public static bool TouchEnded { get; private set; }

       void Update()
       {
           TouchBegan = false;
           TouchEnded = false;

           if (Input.touchCount > 0)
           {
               Touch touch = Input.GetTouch(0);
               TouchPosition = touch.position;
               IsTouching = true;

               if (touch.phase == TouchPhase.Began)
                   TouchBegan = true;
               if (touch.phase == TouchPhase.Ended)
                   TouchEnded = true;
           }
           else
           {
               IsTouching = false;

               // Fallback for editor testing
               if (Input.GetMouseButtonDown(0))
               {
                   TouchBegan = true;
                   TouchPosition = Input.mousePosition;
               }
               if (Input.GetMouseButtonUp(0))
               {
                   TouchEnded = true;
               }
               if (Input.GetMouseButton(0))
               {
                   IsTouching = true;
                   TouchPosition = Input.mousePosition;
               }
           }
       }
   }
   ```

5. **Performance Tips:**
   ```csharp
   // Avoid in Update()
   void Update()
   {
       // BAD: Creates garbage every frame
       var objects = FindObjectsOfType<Enemy>();

       // BAD: String concatenation in hot path
       text.text = "Score: " + score.ToString();
   }

   // GOOD: Cache references
   private Enemy[] enemies;
   void Start()
   {
       enemies = FindObjectsOfType<Enemy>();
   }

   // GOOD: Use StringBuilder or pre-format
   private StringBuilder sb = new StringBuilder();
   void UpdateScore()
   {
       sb.Clear();
       sb.Append("Score: ");
       sb.Append(score);
       text.text = sb.ToString();
   }
   ```

6. **Common Mobile Issues:**

   | Issue | Solution |
   |-------|----------|
   | UI too small | Use Canvas Scaler with Scale With Screen Size |
   | Buttons hard to tap | Minimum 48x48 pixel touch targets |
   | Text blurry | Use TextMeshPro, not legacy Text |
   | Slow performance | Profile with Unity Profiler, reduce draw calls |
   | Battery drain | Limit frame rate: `Application.targetFrameRate = 30;` |

### ✅ Checkpoint:
- APK builds successfully
- Game runs on device
- Touch input works
- No major performance issues

---

## Task 10: Final Project - Mini B40 Prototype

**Goal:** Combine everything into a working prototype.

**What You'll Learn:**
- Project organization
- Putting systems together
- Polish and iteration

### Requirements:

Create a playable prototype with:
- [ ] Main menu with Start button
- [ ] Persona selection (2 personas)
- [ ] Simple map with 3 locations
- [ ] Stats HUD (money, health)
- [ ] Working dialogue system
- [ ] At least 1 AI-generated scenario (with fallback)
- [ ] Energy system (limited actions per day)
- [ ] Day/week progression
- [ ] Simple ending screen
- [ ] Works on mobile

### Suggested Structure:

```
Scenes:
1. MainMenu - Title, Start button
2. PersonaSelect - Choose Fresh Grad or Single Parent
3. Game - Map with player and locations
4. Ending - Show final stats

Managers (DontDestroyOnLoad):
- GameManager - Stats, progression
- AudioManager - Sound effects, music

Scene-Specific:
- UIManager (per scene)
- DialogueManager (Game scene)
- MapManager (Game scene)
```

### Bonus Challenges:

1. **Add Sound Effects:**
   ```csharp
   // AudioManager.cs
   public class AudioManager : MonoBehaviour
   {
       public static AudioManager Instance;
       public AudioSource sfxSource;
       public AudioClip buttonClick;
       public AudioClip moneyGain;
       public AudioClip moneyLose;

       public void PlaySFX(AudioClip clip)
       {
           sfxSource.PlayOneShot(clip);
       }
   }
   ```

2. **Add Simple Animation:**
   ```csharp
   // Use DOTween (free asset) for easy animations
   using DG.Tweening;

   // Bounce effect
   transform.DOScale(1.1f, 0.1f).SetLoops(2, LoopType.Yoyo);

   // Fade in
   canvasGroup.DOFade(1f, 0.5f);

   // Move
   transform.DOMove(targetPos, 1f);
   ```

3. **Save/Load Game:**
   - Save to `Application.persistentDataPath`
   - Use `JsonUtility.ToJson()` / `FromJson()`

---

## Quick Reference Cheat Sheet

### Lifecycle Methods
```csharp
void Awake()      // First, before Start. Use for self-init.
void Start()      // After Awake. Use for external refs.
void Update()     // Every frame. Use for input, logic.
void FixedUpdate() // Fixed time step. Use for physics.
void LateUpdate() // After Update. Use for camera follow.
void OnDestroy()  // When object destroyed. Use for cleanup.
```

### Common Components
```csharp
GetComponent<T>()           // Get component on same object
GetComponentInChildren<T>() // Get in children
FindObjectOfType<T>()       // Find in scene (slow!)

transform.position          // World position
transform.localPosition     // Local to parent
transform.rotation          // Rotation
transform.localScale        // Scale
```

### Input
```csharp
Input.GetKey(KeyCode.Space)      // Held down
Input.GetKeyDown(KeyCode.Space)  // Just pressed
Input.GetKeyUp(KeyCode.Space)    // Just released
Input.GetAxis("Horizontal")      // -1 to 1 smoothed
Input.GetAxisRaw("Horizontal")   // -1, 0, or 1
Input.mousePosition              // Screen position
Input.GetMouseButton(0)          // Left click held
```

### Instantiate/Destroy
```csharp
Instantiate(prefab)                    // Clone
Instantiate(prefab, position, rotation) // Clone at position
Instantiate(prefab, parent)            // Clone as child
Destroy(gameObject)                    // Destroy this object
Destroy(gameObject, 2f)                // Destroy after 2 seconds
```

### Coroutines
```csharp
StartCoroutine(MyCoroutine());
StopCoroutine(coroutineReference);
StopAllCoroutines();

IEnumerator MyCoroutine()
{
    yield return null;                          // Wait 1 frame
    yield return new WaitForSeconds(1f);        // Wait 1 second
    yield return new WaitUntil(() => condition); // Wait for condition
    yield return StartCoroutine(Other());       // Wait for other coroutine
}
```

### PlayerPrefs (Simple Save)
```csharp
PlayerPrefs.SetInt("HighScore", 100);
PlayerPrefs.SetFloat("Volume", 0.8f);
PlayerPrefs.SetString("Name", "Player");
int score = PlayerPrefs.GetInt("HighScore", 0);  // 0 = default
PlayerPrefs.Save();
```

---

## Next Steps After Completing These Tasks

1. **Watch Brackeys' 2D Platformer Tutorial** - Great production quality
2. **Read Unity's 2D Documentation** - Fill in the gaps
3. **Join Unity Discord** - Get help when stuck
4. **Build small projects** - Clone simple games (Pong, Snake) before big ones

Good luck! Remember: the best way to learn Unity is to build things and break them.
