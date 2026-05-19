const SITE = {

    name:    "Water",
    age:     15,
    discord: "hokpy",
    roblox:  "https://www.roblox.com/users/2878666652/profile",

    bgm:    "assets/music/theme.mp3",
    volume: 1,

    profilePin: "water2025",
    adminPin:   "water2025",

    stats: [
        { value: "20+",   label: "Commissions" },
        { value: "4 yrs", label: "Experience"  },
        { value: "40%",   label: "Avg Lag Fix"  },
    ],

    skills: [
        { name: "Luau",        pct: 98, desc: "OOP · Metatables · Parallel Luau",   color: "blue"   },
        { name: "DataStores",  pct: 95, desc: "ProfileService · Session Locking",    color: "blue"   },
        { name: "Interface",   pct: 85, desc: "Roact · Fusion · TweenService",       color: "purple" },
        { name: "Systems",     pct: 92, desc: "Knit Framework · ECS Pattern",        color: "gold"   },
    ],

    funSkills: [
        { name: "Sleep Schedule",      pct: 2,  desc: "caffeine-dependent",       color: "red"   },
        { name: "Touching Grass",      pct: 5,  desc: "rare event, treat gently", color: "green" },
        { name: "Googling Errors",     pct: 99, desc: "Stack Overflow MVP",        color: "gold"  },
        { name: "Charging Fair Rates", pct: 75, desc: "use the estimator ↓",      color: "blue"  },
    ],

    timeline: [
        {
            title:  "Freelance Systems Engineer",
            period: "2022 – Present",
            desc:   "Backend systems for high-traffic Roblox games. muuch commissions shipped. Zero reported memory leaks (that I know of).",
            tags:   ["DataStore2", "ProfileService", "Anti-Exploit", "Optimization"],
            accent: true,
        },
        {
            title:  "Junior Developer",
            period: "2021 – 2022",
            desc:   "Started with Lua. Made terrible code. Googled a lot. Slowly became less wrong.",
            tags:   [],
            accent: false,
        },
        {
            title:  "The Beginning",
            period: "~2020",
            desc:   "Opened Studio for the first time. Moved a baseplate brick for 40 minutes. Thought I was a developer.",
            tags:   [],
            accent: false,
            dim:    true,
        },
    ],

    snippets: [
        {
            name: "RetentionEngine.lua",
            code: `-- [RETENTION ENGINE] Author: Water
-- Daily reward streak tracking system

local RetentionEngine = {}
local ONE_DAY    = 86400
local STREAK_GAP = ONE_DAY * 2

function RetentionEngine.CheckDailyStatus(player, data)
    local diff = os.time() - data.LastLogin
    if diff >= STREAK_GAP  then data.Streak = 0; return "Ready", data.Streak
    elseif diff >= ONE_DAY then return "Ready",   data.Streak
    end
    return "Waiting", ONE_DAY - diff
end

function RetentionEngine.ClaimDaily(player, data)
    data.LastLogin = os.time()
    data.Streak   += 1
    return data.Streak
end

function RetentionEngine.LoadProfile(player)
    return { LastLogin = 0, Streak = 0 }
end

return RetentionEngine`,
        },
        {
            name: "DataManager.server.lua",
            code: `-- [DATASTORE MANAGER]
-- Persistent save/load with caching + error handling

local DSS     = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local Store   = DSS:GetDataStore("PlayerData_V1")
local cache   = {}

local DataManager = {}

local function defaultData()
    return { LastLogin = 0, Streak = 0 }
end

function DataManager.Load(player)
    if cache[player.UserId] then return cache[player.UserId] end
    local ok, data = pcall(Store.GetAsync, Store, player.UserId)
    cache[player.UserId] = (ok and data) or defaultData()
    if not ok then warn("Load failed:", player.Name) end
    return cache[player.UserId]
end

function DataManager.Save(player)
    local data = cache[player.UserId]
    if not data then return end
    local ok, err = pcall(Store.SetAsync, Store, player.UserId, data)
    if not ok then warn("Save failed:", player.Name, err) end
end

Players.PlayerRemoving:Connect(function(p)
    DataManager.Save(p)
    cache[p.UserId] = nil
end)

game:BindToClose(function()
    for _, p in Players:GetPlayers() do DataManager.Save(p) end
end)

return DataManager`,
        },
        {
            name: "NotificationSystem.lua",
            code: `-- [NOTIFICATION SYSTEM]
-- Modular slide-in UI notifications via TweenService

local NS   = {}
local TS   = game:GetService("TweenService")
local PLR  = game:GetService("Players")
local INFO = TweenInfo.new(0.5, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)

local function getGui()
    local pg  = PLR.LocalPlayer.PlayerGui
    local gui = pg:FindFirstChild("Notifs") or Instance.new("ScreenGui")
    gui.Name = "Notifs"; gui.Parent = pg
    return gui
end

function NS:Notify(text, color)
    local f = Instance.new("TextLabel")
    f.Size             = UDim2.new(0, 260, 0, 52)
    f.BackgroundColor3 = color or Color3.fromRGB(30, 30, 45)
    f.TextColor3       = Color3.new(1, 1, 1)
    f.Font             = Enum.Font.GothamBold
    f.TextSize         = 13
    f.Text             = text
    f.Position         = UDim2.new(1, 10, 0.85, 0)
    f.Parent           = getGui()

    TS:Create(f, INFO, { Position = UDim2.new(1, -270, 0.85, 0) }):Play()
    task.delay(3.5, function()
        TS:Create(f, INFO, { Position = UDim2.new(1, 10, 0.85, 0) }):Play()
        task.wait(0.5); f:Destroy()
    end)
end

return NS`,
        },
    ],

    projects: [
        {
            title:    "Chillin Place",
            category: "FULL GAME",
            desc:     "Complete hangout place with full DataStore persistence.",
            tags:     ["Game Design", "DataStore"],
            link:     "https://www.roblox.com/games/17290214724/Chillin-Place",
            media:    "image",
            src:      "https://tr.rbxcdn.com/180DAY-c69740761a8556385075f48b5b71147a/768/432/Image/Png/noFilter",
            color:    "gold",
        },
        {
            title:    "Escape Lava: Collect Brainrots",
            category: "FULL GAME",
            desc:     "Casual escape game with DataStore progression.",
            tags:     ["Game Design", "DataStore"],
            link:     "https://www.roblox.com/games/85862915773488/Escape-Lava-to-collect-brainrots",
            media:    "image",
            src:      "https://tr.rbxcdn.com/180DAY-1f5e4f49f3ff9eddbf732387c8b19cd7/768/432/Image/Webp/noFilter",
            color:    "gold",
        },
        {
            title:    "Operation: Azure Rift",
            category: "FULL GAME",
            desc:     "Story-driven FPS based on Blue Archive.",
            tags:     ["FPS", "Narrative"],
            link:     "https://www.roblox.com/games/140471518514522/Operation-Azure-Rift",
            media:    "image",
            src:      "https://tr.rbxcdn.com/180DAY-1384a973e73995479b5db690aa51e902/768/432/Image/Png/noFilter",
            color:    "blue",
        },
        {
            title: "Yan - Chan Simulator",
            category: "FULL GAME",
            desc:     "Yandere Simulator Ports into roblox!",
            tags:     ["Story", "Simulator"],
            link:     "https://www.roblox.com/games/90515983274647/Yan-Chan-Simulator",
            media:    "image",
            src:      "https://tr.rbxcdn.com/180DAY-cae9bb90f7a6e78c66ed1e18af2727e6/768/432/Image/Webp/noFilter",
            color:    "purple",
        },
        {
            title:    "Blind Mode Logic",
            category: "GAMEPLAY",
            desc:     "Vision restriction mechanic with dynamic spawn handling.",
            tags:     ["Lighting", "Camera"],
            link:     "",
            media:    "youtube",
            src:      "https://youtu.be/k8hV66kJ8cc",
            color:    "blue",
        },
        {
            title:    "Quest Engine",
            category: "RPG SYSTEM",
            desc:     "Visual Novel–style branching dialogue system.",
            tags:     ["ModuleScript", "UI Tweening"],
            link:     "",
            media:    "youtube",
            src:      "https://www.youtube.com/watch?v=_HTzGpFwIiU",
            color:    "purple",
        },
        {
            title:    "Dialogue System",
            category: "RPG SYSTEM",
            desc:     "Simple FPS Dialogue system.",
            tags:     ["ModuleScript", "UI Tweening"],
            link:     "",
            media:    "youtube",
            src:      "https://youtu.be/XJgOCA_q4mM",
            color:    "purple",
        },
        {
            title:    "Farm Optimization",
            category: "OPTIMIZATION",
            desc:     "Full backend refactor — 40% server lag reduction.",
            tags:     ["Optimization", "Memory"],
            link:     "",
            media:    "youtube",
            src:      "https://youtu.be/YyX5ma58v2Q",
            color:    "gray",
        },
        {
            title:    "Door Kicking Engine",
            category: "GAMEPLAY",
            desc:     "Physics-based door interaction system via CFrame.",
            tags:     ["ModuleScript", "CFrame"],
            link:     "",
            media:    "youtube",
            src:      "https://youtu.be/FjZHsIuzUlY",
            color:    "purple",
        },
    ],

    pricing: {
        services: [
            { label: "Quick Task", base: 500   },
            { label: "Bug Fix",    base: 2500  },
            { label: "System",     base: 10000 },
            { label: "Full Game",  base: 30000 },
        ],
        currencies: {
            "R$":  { rate: 1,      prefix: false, sym: " R$" },
            "USD": { rate: 0.0035, prefix: true,  sym: "$"   },
            "THB": { rate: 0.12,   prefix: true,  sym: "฿"  },
            "VND": { rate: 90,     prefix: false, sym: "₫"  },
        },
    },

    seedReviews: [
        { id: "s1", name: "Kurokami_Dev",  stars: 5, text: "Fixed a DataStore corruption bug in under an hour that had been killing our game for weeks. 10/10 would hire again.", date: "2025-02-14", verified: true },
        { id: "s2", name: "StellarForge",  stars: 5, text: "Built our entire quest engine from scratch. Clean code, great communication, delivered ahead of schedule.",            date: "2025-03-02", verified: true },
        { id: "s3", name: "NexusRBX",      stars: 5, text: "Reduced server lag by 40% on our farm sim. Rewrote the backend the right way. Professional level work.",              date: "2025-04-20", verified: true },
    ],

    konami: ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"],

    sections: [
        { id: "home",      label: "Home"      },
        { id: "about",     label: "Profile"   },
        { id: "skills",    label: "Skills"    },
        { id: "history",   label: "History"   },
        { id: "code",      label: "Code Vault"},
        { id: "projects",  label: "Projects"  },
        { id: "estimator", label: "Estimator" },
        { id: "reviews",   label: "Reviews"   },
        { id: "contact",   label: "Contact"   },
    ],
};
