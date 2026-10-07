const SITE = {
    name: "Water",
    discord: "hoekpy",
    roblox: "https://www.roblox.com/users/2878666652/profile",

    // BGM track selection
    bgm: "assets/music/theme.mp3",
    bgmMode: "default",
    bgmOptions: [
        "assets/music/theme.mp3",
        "assets/music/theme2.mp3",
        "assets/music/theme3.mp3",
    ],
    volume: 0.7,

    // SFX paths (JDSherbert UI SFX Pack)
    sfx: {
        hover: "assets/sounds/JDSherbert - Ultimate UI SFX Pack (FREE)/Stereo/mp3/JDSherbert - Ultimate UI SFX Pack - Cursor - 1.mp3",
        click: "assets/sounds/JDSherbert - Ultimate UI SFX Pack (FREE)/Stereo/mp3/JDSherbert - Ultimate UI SFX Pack - Select - 1.mp3",
        boot: "assets/sounds/JDSherbert - Ultimate UI SFX Pack (FREE)/Stereo/mp3/JDSherbert - Ultimate UI SFX Pack - Popup Open - 1.mp3",
        initiate: "assets/sounds/JDSherbert - Ultimate UI SFX Pack (FREE)/Stereo/mp3/JDSherbert - Ultimate UI SFX Pack - Select - 2.mp3",
        open: "assets/sounds/JDSherbert - Ultimate UI SFX Pack (FREE)/Stereo/mp3/JDSherbert - Ultimate UI SFX Pack - Popup Open - 1.mp3",
        close: "assets/sounds/JDSherbert - Ultimate UI SFX Pack (FREE)/Stereo/mp3/JDSherbert - Ultimate UI SFX Pack - Popup Close - 1.mp3",
        swipe: "assets/sounds/JDSherbert - Ultimate UI SFX Pack (FREE)/Stereo/mp3/JDSherbert - Ultimate UI SFX Pack - Swipe - 1.mp3",
        error: "assets/sounds/JDSherbert - Ultimate UI SFX Pack (FREE)/Stereo/mp3/JDSherbert - Ultimate UI SFX Pack - Error - 1.mp3",
    },

    stats: [
        { value: "20+", label: "Projects Shipped" },
        { value: "4 yrs", label: "Experience" },
        { value: "-40%", label: "Peak Lag Cut" },
    ],

    timeline: [
        {
            title: "Freelance Systems Engineer",
            period: "2022 - Present",
            desc: "Building backend systems, gameplay mechanics, and interfaces for Roblox games. Everything from quick commissions to full experiences with DataStore, optimization, and clean UI.",
            tags: ["DataStore", "UI", "Gameplay", "Optimization"],
            accent: true,
        },
        {
            title: "Junior Developer",
            period: "2021 - 2022",
            desc: "Learned Luau through trial, error, and lots of late-night debugging. Started taking small commissions and figuring out how things actually work under the hood.",
            tags: [],
            accent: false,
        },
        {
            title: "The Beginning",
            period: "~2020",
            desc: "Opened Studio for the first time, moved a baseplate around, and thought I was already a game developer.",
            tags: [],
            accent: false,
            dim: true,
        },
    ],

    // Client proof / testimonials (config-only until real quotes are ready)
    testimonials: [
        // { quote: "...", author: "...", platform: "Discord" }
    ],

    projects: [
        // FEATURED WORK
        {
            title: "Chillin Place",
            category: "FULL GAME",
            group: "featured",
            desc: "Complete hangout experience with solid DataStore persistence, clean UI, and session saving.",
            role: "Sole Scripter",
            result: "Live on Roblox - player data persists smoothly across sessions",
            tags: ["Game Design", "DataStore", "UI"],
            link: "https://www.roblox.com/games/17290214724/Chillin-Place",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-c69740761a8556385075f48b5b71147a/768/432/Image/Png/noFilter",
            color: "gold",
            // Case study placeholder: hidden from UI for now
            caseStudy: {
                enabled: false,
                problem: "Players were losing inventory and state on server hops.",
                solution: "Rewrote data pipeline with auto-saving, session-locking, and retry pings.",
                result: "100% data reliability across thousands of sessions."
            }
        },
        {
            title: "Farm Optimization",
            category: "OPTIMIZATION",
            group: "featured",
            desc: "Backend refactor on a live farming game that cut server lag by 40% and stopped memory leaks.",
            role: "Scripter",
            result: "Server lag reduced by ~40% on live servers",
            tags: ["Optimization", "Memory", "Profiling"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/YyX5ma58v2Q",
            color: "gray",
            caseStudy: {
                enabled: false,
                problem: "Server heartbeat spiked whenever hundreds of crops updated at once.",
                solution: "Replaced heavy per-instance loops with batch spatial updates and decoupled visual rendering to clients.",
                result: "Cut server CPU usage and reduced lag by 40%."
            }
        },
        {
            title: "Quest Engine",
            category: "RPG SYSTEM",
            group: "featured",
            desc: "Modular branching dialogue and quest progression engine with smooth UI transitions.",
            role: "Scripter",
            result: "Plug-and-play quest trees with zero headache",
            tags: ["ModuleScript", "UI Tweening", "Architecture"],
            link: "",
            media: "youtube",
            src: "https://www.youtube.com/watch?v=_HTzGpFwIiU",
            color: "purple",
            caseStudy: {
                enabled: false,
                problem: "Hardcoded quests were messy to edit and broke when dialogues branched.",
                solution: "Built a node-based ModuleScript system that handles dialogue states, conditions, and rewards dynamically.",
                result: "Quests can be created and updated in minutes without touching core scripts."
            }
        },
        {
            title: "Escape Lava: Collect Brainrots",
            category: "FULL GAME",
            group: "featured",
            desc: "Casual progression game with stage tracking, UI flow, and reliable player saving.",
            role: "Sole Scripter",
            result: "Live on Roblox - saves stage progress reliably",
            tags: ["Game Design", "DataStore", "UI"],
            link: "https://www.roblox.com/games/85862915773488/Escape-Lava-to-collect-brainrots",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-1f5e4f49f3ff9eddbf732387c8b19cd7/768/432/Image/Webp/noFilter",
            color: "gold",
        },

        // SYSTEMS & DEMOS
        {
            title: "Weather System",
            category: "GAMEPLAY",
            group: "systems",
            desc: "Dynamic weather engine with smooth lighting transitions and realistic rain/storm cycles.",
            role: "Scripter",
            result: "Smooth transitions between weather states",
            tags: ["Lighting", "Visual Effects", "Atmosphere"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/_GEdA3nrXy8",
            color: "blue",
        },
        {
            title: "Dialogue System",
            category: "RPG SYSTEM",
            group: "systems",
            desc: "FPS-style dialogue system built for readability, pacing, and clean interaction flow.",
            role: "Scripter",
            result: "Reusable ModuleScript with snappy pacing",
            tags: ["ModuleScript", "UI Tweening"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/XJgOCA_q4mM",
            color: "purple",
        },
        {
            title: "Door Kicking Engine",
            category: "GAMEPLAY",
            group: "systems",
            desc: "Physics-based door breach interaction using CFrame math and responsive player controls.",
            role: "Scripter",
            result: "Physics-based, responsive door mechanics",
            tags: ["ModuleScript", "CFrame", "Physics"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/FjZHsIuzUlY",
            color: "purple",
        },
        {
            title: "Blind Mode Logic",
            category: "GAMEPLAY",
            group: "systems",
            desc: "Vision restriction mechanic with dynamic spawn handling and clean game-state control.",
            role: "Scripter",
            result: "Working vision limiting with clean state handling",
            tags: ["Lighting", "Camera", "Logic"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/k8hV66kJ8cc",
            color: "blue",
        },
        {
            title: "Project Halo",
            category: "FULL GAME",
            group: "systems",
            desc: "Story-driven FPS with combat systems, UI, and narrative structure. Currently being remade.",
            role: "Scripter",
            result: "Playable on Roblox, active rework in progress",
            tags: ["FPS", "Combat", "UI"],
            link: "https://www.roblox.com/games/140471518514522/Project-Halo",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-1384a973e73995479b5db690aa51e902/768/432/Image/Png/noFilter",
            color: "blue",
        },

        // OTHER WORK & SHOWCASES
        {
            title: "Yan-Chan Simulator",
            category: "FULL GAME",
            group: "other",
            desc: "Roblox adaptation with progression mechanics, custom camera polish, and gameplay flow.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Story", "Simulator", "UI"],
            link: "https://www.roblox.com/games/90515983274647/Yan-Chan-Simulator",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-cae9bb90f7a6e78c66ed1e18af2727e6/768/432/Image/Webp/noFilter",
            color: "purple",
        },
        {
            title: "Blue Archive - Noa Recollection",
            category: "FULL GAME",
            group: "other",
            desc: "Live2D showcase experience featuring Noa. Scripted the presentation layer.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18471104087/Blue-archive-Noa-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-c698047e6fdbf080fdefd4a7a3f5f9b1/768/432/Image/Webp/noFilter",
            color: "blue",
        },
        {
            title: "Blue Archive - Serika Recollection",
            category: "FULL GAME",
            group: "other",
            desc: "Live2D showcase featuring Serika. Handled all scripting.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18272638182/Blue-archive-Serika-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-b77b650189b4584b07497a50962c6d4e/768/432/Image/Webp/noFilter",
            color: "blue",
        },
        {
            title: "Blue Archive - Hina Recollection",
            category: "FULL GAME",
            group: "other",
            desc: "Live2D showcase featuring Hina. Scripted camera and interaction.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18466780591/Blue-Archive-Hina-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-8afd178236abfcb92489eebb5fea1ad1/768/432/Image/Png/noFilter",
            color: "purple",
        },
        {
            title: "Blue Archive - Miyu Recollection",
            category: "FULL GAME",
            group: "other",
            desc: "Live2D showcase featuring Miyu.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18453893127/Blue-archive-Miyu-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-21b2c2ac83ed7b1ba823f11727324877/768/432/Image/Webp/noFilter",
            color: "purple",
        },
        {
            title: "Blue Archive - Hanako Recollection",
            category: "FULL GAME",
            group: "other",
            desc: "Live2D showcase featuring Hanako.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18344506909/Blue-archive-Hanako-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-da8e371843f085b4ee3f19c813bcc00b/768/432/Image/Webp/noFilter",
            color: "pink",
        },
        {
            title: "Blue Archive - Arona Room",
            category: "FULL GAME",
            group: "other",
            desc: "Showcase recreating the Shittim Chest interface from Blue Archive.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "UI"],
            link: "https://www.roblox.com/games/18290768266/Blue-archive-Arona-Room",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-e7a9b4d89bebc8d9aafbbc640ede61d0/768/432/Image/Webp/noFilter",
            color: "blue",
        },
        {
            title: "Blue Archive - Train",
            category: "FULL GAME",
            group: "other",
            desc: "Showcase recreating the train scene from Blue Archive.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Atmosphere"],
            link: "https://www.roblox.com/games/18485180189/Blue-archive-Train",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-4234c54049fc9ea063501b1bb27f0969/768/432/Image/Png/noFilter",
            color: "blue",
        },
        {
            title: "Figma UI Design - Concept 1",
            category: "UI DESIGN",
            group: "other",
            desc: "Figma interface design exploring clean game menus and quick navigation.",
            role: "UI Designer",
            result: "Full Figma layout",
            tags: ["Figma", "UI/UX"],
            link: "",
            media: "image",
            src: "assets/images/UI1.png",
            color: "purple",
        },
        {
            title: "Figma UI Design - Concept 2",
            category: "UI DESIGN",
            group: "other",
            desc: "Figma interface design focused on clear visual hierarchy and readable stats.",
            role: "UI Designer",
            result: "Full Figma layout",
            tags: ["Figma", "UI/UX"],
            link: "",
            media: "image",
            src: "assets/images/UI2.png",
            color: "purple",
        },
    ],

    hub: [
        { title: "Project Halo", status: "IN PROGRESS" },
        { title: "Quest Engine", status: "SHIPPED" },
        { title: "Chillin Place", status: "SHIPPED" },
        { title: "Escape Lava: Collect Brainrots", status: "SHIPPED" },
        { title: "Farm Optimization", status: "SHIPPED", params: { lagReduction: "40%" } },
        { title: "Door Kicking Engine", status: "SHIPPED" },
        { title: "Yan-Chan Simulator", status: "SHIPPED" },
        { title: "Project Unist", status: "IN PROGRESS" },
        { title: "Weather System", status: "SHIPPED" },
        { title: "Blue Archive - Noa Recollection", status: "SHIPPED" },
        { title: "Blue Archive - Serika Recollection", status: "SHIPPED" },
        { title: "Blue Archive - Hina Recollection", status: "SHIPPED" },
        { title: "Blue Archive - Hanako Recollection", status: "SHIPPED" },
        { title: "Blue Archive - Arona Room", status: "SHIPPED" },
        { title: "Blue Archive - Train", status: "SHIPPED" },
    ],

    specimens: [
        {
            file: "Welcome.server.luau",
            note: "Greets every player who joins. Flat guard clauses keep it clean.",
            code: `local Players = game:GetService("Players")

local welcomeText = "Welcome to the game, "

local function greet(player: Player)
\tif not player then return end
\tprint(welcomeText .. player.Name .. "!")
end

Players.PlayerAdded:Connect(greet)`
        },
        {
            file: "CoinPickup.server.luau",
            note: "Touch the coin, collect the coin. Fast debounce check and guard clauses.",
            code: `local Players = game:GetService("Players")

local coin = script.Parent
local coinValue = 1

local function onTouched(hit: BasePart)
\tlocal player = Players:GetPlayerFromCharacter(hit.Parent)
\tif not player then return end

\tlocal stats = player:FindFirstChild("leaderstats")
\tlocal coins = stats and stats:FindFirstChild("Coins")
\tif not coins then return end

\tcoins.Value += coinValue
\tcoin:Destroy()
end

coin.Touched:Connect(onTouched)`
        },
        {
            file: "BlinkLight.server.luau",
            note: "Continuous light cycle. task.spawn keeps the loop isolated from the main thread.",
            code: `local light = script.Parent :: PointLight
local blinkDelay = 0.5

task.spawn(function()
\twhile true do
\t\tlight.Enabled = not light.Enabled
\t\ttask.wait(blinkDelay)
\tend
end)`
        }
    ],

    // Availability + terms
    commission: {
        status: "OPEN",
        note: "Taking commissions for gameplay systems, UI scripting, and lag fixing.",
        terms: [
            ["Services", "Gameplay mechanics, UI systems, DataStore setups, lag reduction"],
            ["Pricing", "Quoted per project - shoot me a DM on Discord"],
            ["Turnaround", "Fast and agreed upon before work starts"],
            ["Payment", "Robux or USD (agreed upfront)"],
            ["Contact", "Discord: hoekpy"],
        ],
    },

    // Rotating hero phrases
    phrases: [
        "Game Systems That Work."
    ],

    konami: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"],

    sections: [
        { id: "home", label: "Home" },
        { id: "about", label: "Profile" },
        { id: "hub", label: "Hub" },
        { id: "code", label: "Code" },
        { id: "history", label: "History" },
        { id: "projects", label: "Projects" },
        { id: "contact", label: "Contact" },
    ],
};
