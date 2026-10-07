const SITE = {
    name: "Water",
    age: 16,
    discord: "hokpy",
    roblox: "https://www.roblox.com/users/2878666652/profile",

    // Set a single track here, or use bgmOptions + bgmMode for multi-track selection.
    bgm: "assets/music/theme3.mp3",
    bgmMode: "default",
    bgmOptions: [
        "assets/music/theme.mp3",
        "assets/music/theme2.mp3",
        "assets/music/theme3.mp3",
    ],
    volume: 0.7,

    stats: [
        { value: "20+", label: "Commissions" },
        { value: "4 yrs", label: "Experience" },
        { value: "40%", label: "Avg Lag Fix" },
    ],

    timeline: [
        {
            title: "Freelance Systems Engineer",
            period: "2022 – Present",
            desc: "Built backend systems, gameplay mechanics, and user interfaces for Roblox games ranging from small commissions to full experiences.",
            tags: ["DataStore", "UI", "Gameplay", "Optimization"],
            accent: true,
        },
        {
            title: "Junior Developer",
            period: "2021 – 2022",
            desc: "Started with Lua and learned through practice, mistakes, debugging, and a lot of trial and error.",
            tags: [],
            accent: false,
        },
        {
            title: "The Beginning",
            period: "~2020",
            desc: "Opened Studio for the first time, moved a baseplate around, and thought that counted as development.",
            tags: [],
            accent: false,
            dim: true,
        },
    ],

    projects: [
        {
            title: "Chillin Place",
            category: "FULL GAME",
            desc: "Complete hangout place with DataStore persistence and polished presentation.",
            role: "Scripter",
            result: "Live on Roblox, saves player data",
            tags: ["Game Design", "DataStore", "UI"],
            link: "https://www.roblox.com/games/17290214724/Chillin-Place",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-c69740761a8556385075f48b5b71147a/768/432/Image/Png/noFilter",
            color: "gold",
        },
        {
            title: "Escape Lava: Collect Brainrots",
            category: "FULL GAME",
            desc: "Casual escape game with progression, UI flow, and saved player data.",
            role: "Scripter",
            result: "Live on Roblox, saves player progress",
            tags: ["Game Design", "DataStore", "UI"],
            link: "https://www.roblox.com/games/85862915773488/Escape-Lava-to-collect-brainrots",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-1f5e4f49f3ff9eddbf732387c8b19cd7/768/432/Image/Webp/noFilter",
            color: "gold",
        },
        {
            title: "Project Halo [Still in remaking]",
            category: "FULL GAME",
            desc: "Story-driven FPS with systems, UI, and narrative structure inspired by Blue Archive.",
            role: "Scripter",
            result: "Playable on Roblox, in development",
            tags: ["FPS", "Narrative", "UI"],
            link: "https://www.roblox.com/games/140471518514522/Project-Halo",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-1384a973e73995479b5db690aa51e902/768/432/Image/Png/noFilter",
            color: "blue",
        },
        {
            title: "Yan - Chan Simulator",
            category: "FULL GAME",
            desc: "A Roblox adaptation focused on progression, presentation, and gameplay flow.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Story", "Simulator", "UI"],
            link: "https://www.roblox.com/games/90515983274647/Yan-Chan-Simulator",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-cae9bb90f7a6e78c66ed1e18af2727e6/768/432/Image/Webp/noFilter",
            color: "purple",
        },
        {
            title: "Blue archive - Noa Recollection",
            category: "FULL GAME",
            desc: "A showcased game based from Live2D of Noa.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18471104087/Blue-archive-Noa-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-c698047e6fdbf080fdefd4a7a3f5f9b1/768/432/Image/Webp/noFilter",
            color: "blue",
        },
        {
            title: "Blue archive - Serika Recollection",
            category: "FULL GAME",
            desc: "A showcased game based from Live2D of Serika.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18272638182/Blue-archive-Serika-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-b77b650189b4584b07497a50962c6d4e/768/432/Image/Webp/noFilter",
            color: "blue",
        },
        {
            title: "Blue archive - Hina Recollection",
            category: "FULL GAME",
            desc: "A showcased game based from Live2D of Hina.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18466780591/Blue-Archive-Hina-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-8afd178236abfcb92489eebb5fea1ad1/768/432/Image/Png/noFilter",
            color: "purple",
        },
        {
            title: "Blue archive - Miyu Recollection",
            category: "FULL GAME",
            desc: "A showcased game based from Live2D of Miyu.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18453893127/Blue-archive-Miyu-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-21b2c2ac83ed7b1ba823f11727324877/768/432/Image/Webp/noFilter",
            color: "purple",
        },
        {
            title: "Blue archive - Hanako Recollection",
            category: "FULL GAME",
            desc: "A showcased game based from Live2D of Hanako.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18344506909/Blue-archive-Hanako-Recollection",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-da8e371843f085b4ee3f19c813bcc00b/768/432/Image/Webp/noFilter",
            color: "pink",
        },
        {
            title: "Blue archive - Arona Room",
            category: "FULL GAME",
            desc: "A showcased game based from Shittim Chest.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18290768266/Blue-archive-Arona-Room",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-e7a9b4d89bebc8d9aafbbc640ede61d0/768/432/Image/Webp/noFilter",
            color: "blue",
        },
        {
            title: "Blue archive - Train",
            category: "FULL GAME",
            desc: "A showcased game based from Train Scene.",
            role: "Scripter",
            result: "Live on Roblox",
            tags: ["Showcase", "Live2D"],
            link: "https://www.roblox.com/games/18485180189/Blue-archive-Train",
            media: "image",
            src: "https://tr.rbxcdn.com/180DAY-4234c54049fc9ea063501b1bb27f0969/768/432/Image/Png/noFilter",
            color: "blue",
        },
        {
            title: "Blind Mode Logic",
            category: "GAMEPLAY",
            desc: "Vision restriction mechanic with dynamic spawn handling and clean game-state control.",
            role: "Scripter",
            result: "Vision limit with clean game-state handling",
            tags: ["Lighting", "Camera"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/k8hV66kJ8cc",
            color: "blue",
        },
        {
            title: "Weather System",
            category: "System",
            desc: "A smart weather system, that can be used in any game. With a weather realistic weather cycles.",
            role: "Scripter",
            result: "Smooth and clean weathers.",
            tags: ["Lighting", "Visual Effects"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/_GEdA3nrXy8",
            color: "blue",
        },
        {
            title: "Quest Engine",
            category: "RPG SYSTEM",
            desc: "Branching dialogue system with quest progression and smooth UI transitions.",
            role: "Scripter",
            result: "Branching quests with smooth UI transitions",
            tags: ["ModuleScript", "UI Tweening"],
            link: "",
            media: "youtube",
            src: "https://www.youtube.com/watch?v=_HTzGpFwIiU",
            color: "purple",
        },
        {
            title: "Dialogue System",
            category: "RPG SYSTEM",
            desc: "Simple FPS dialogue system built for readability, pacing, and clean interaction flow.",
            role: "Scripter",
            result: "Reusable ModuleScript, readable pacing",
            tags: ["ModuleScript", "UI Tweening"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/XJgOCA_q4mM",
            color: "purple",
        },
        {
            title: "Farm Optimization",
            category: "OPTIMIZATION",
            desc: "Backend refactor that reduced server lag by 40% and improved overall stability.",
            role: "Scripter",
            result: "Server lag down 40%",
            tags: ["Optimization", "Memory"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/YyX5ma58v2Q",
            color: "gray",
        },
        {
            title: "Door Kicking Engine",
            category: "GAMEPLAY",
            desc: "Physics-based door interaction system using CFrame and responsive player control.",
            role: "Scripter",
            result: "Physics-based, responsive controls",
            tags: ["ModuleScript", "CFrame"],
            link: "",
            media: "youtube",
            src: "https://youtu.be/FjZHsIuzUlY",
            color: "purple",
        },
        {
            title: "My First UI Design",
            category: "UI DESIGN",
            desc: "Figma UI design.",
            role: "UI designer",
            result: "Full Figma mockup",
            tags: ["Figma", "UI/UX"],
            link: "",
            media: "image",
            src: "assets/images/UI1.png",
            color: "purple",
        },
        {
            title: "My Second UI Design",
            category: "UI DESIGN",
            desc: "Figma UI design.",
            role: "UI designer",
            result: "Full Figma mockup",
            tags: ["Figma", "UI/UX"],
            link: "",
            media: "image",
            src: "assets/images/UI2.png",
            color: "purple",
        },
    ],


    hub: [
        { title: "Project Halo [Still in remaking]", status: "IN PROGRESSED" },
        { title: "Quest Engine", status: "SHIPPED" },
        { title: "Chillin Place", status: "SHIPPED" },
        { title: "Escape Lava: Collect Brainrots", status: "SHIPPED" },
        { title: "Farm Optimization", status: "SHIPPED", params: { lagReduction: "40%" } },
        { title: "Door Kicking Engine", status: "SHIPPED" },
        { title: "Yan - Chan Simulator", status: "SHIPPED" },
        { title: "Project Unist", status: "IN PROGRESSED" },
        { title: "Weather System", status: "SHIPPED" },
        { title: "Blue archive - Noa Recollection", status: "SHIPPED" },
        { title: "Blue archive - Serika Recollection", status: "SHIPPED" },
        { title: "Blue archive - Hina Recollection", status: "SHIPPED" },
        { title: "Blue archive - Hanako Recollection", status: "SHIPPED" },
        { title: "Blue archive - Arona Room", status: "SHIPPED" },
        { title: "Blue archive - Train", status: "SHIPPED" },

    ],

    specimens: [
        {
            file: "Welcome.server.luau", note: "Says hi to every player who joins. The smallest useful script.", code: `local Players = game:GetService("Players")

local welcomeText = "Welcome to the game, "

local function greet(player: Player)
	if not player then return end
	print(welcomeText .. player.Name .. "!")
end

Players.PlayerAdded:Connect(greet)` },
        {
            file: "CoinPickup.server.luau", note: "Touch the coin, get a coin. Guard clauses keep it flat.", code: `local Players = game:GetService("Players")

local coin = script.Parent
local coinValue = 1

local function onTouched(hit: BasePart)
	local player = Players:GetPlayerFromCharacter(hit.Parent)
	if not player then return end

	local stats = player:FindFirstChild("leaderstats")
	local coins = stats and stats:FindFirstChild("Coins")
	if not coins then return end

	coins.Value += coinValue
	coin:Destroy()
end

coin.Touched:Connect(onTouched)` },
        {
            file: "BlinkLight.server.luau", note: "A light that blinks forever. task.spawn keeps the loop off the main thread.", code: `local light = script.Parent :: PointLight
local blinkDelay = 0.5

task.spawn(function()
	while true do
		light.Enabled = not light.Enabled
		task.wait(blinkDelay)
	end
end)` }
    ],

    // Availability + terms. status: OPEN, LIMITED or CLOSED. Edit the text to match your real terms.
    commission: {
        status: "OPEN",
        note: "Taking commissions for gameplay systems, UI scripting and optimization.",
        terms: [
            ["Takes", "Gameplay systems, UI, DataStore, optimization"],
            ["Rates", "Quoted per project. Message me on Discord."],
            ["Turnaround", "Agreed before work starts"],
            ["Payment", "Robux or USD, agreed up front"],
        ],
    },

    // words the hero line cycles through
    phrases: ["Broken Code.", "Clean Systems.", "Smooth UIs.", "Fast Servers."],

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
