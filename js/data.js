/* ============================================================
   data.js — Static content: projects, code snippets, i18n
   ============================================================ */

// ----- PROJECTS -----
const myProjects = [
    {
        title:       "Chillin Place",
        category:    "FULL GAME",
        description: "A complete Hangout place.",
        techStack:   ["Game Design", "Hangout", "DataStore"],
        mediaType:   "image",
        source:      "https://cdn.discordapp.com/attachments/1352066563213230134/1456328761074122762/RobloxScreenShot20251215_022652029.png?ex=6957f759&is=6956a5d9&hm=bb6f5b4550db1891a74b51695d3fcbcd06541d61678eae242aa2c2a22431a881",
        icon:  "gamepad-2",
        color: "gold",
    },
    {
        title:       "Blind Mode Logic",
        category:    "GAMEPLAY",
        description: "Immersive vision restriction mechanic with dynamic spawn handling.",
        techStack:   ["Lighting", "SpawnLocation", "Camera"],
        mediaType:   "video",
        source:      "https://youtu.be/k8hV66kJ8cc",
        icon:  "eye-off",
        color: "schale",
    },
    {
        title:       "Quest Engine",
        category:    "RPG SYSTEM",
        description: "Visual Novel style interaction system with branching dialogue paths.",
        techStack:   ["ModuleScript", "RichText", "UI Tweening"],
        mediaType:   "video",
        source:      "https://www.youtube.com/watch?v=_HTzGpFwIiU",
        icon:  "message-square",
        color: "halo",
    },
    {
        title:       "Farm Optimization",
        category:    "OPTIMIZATION",
        description: "Fixed critical bugs and optimized backend logic, reducing server lag by 40%.",
        techStack:   ["Refactoring", "Optimization", "Memory"],
        mediaType:   "video",
        source:      "https://youtu.be/YyX5ma58v2Q",
        icon:  "sprout",
        color: "momo",
    },
];

// ----- CODE SNIPPETS -----
const codeSnippets = [
    {
        name: "RetentionEngine.lua",
        content: `--[[
    [RETENTION ENGINE CORE]
    Author: Carzycaft4S
    Description: Centralized server-side manager for Daily Rewards and Playtime Gifts.
]]

local RetentionEngine = {}
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

--// CORE LOGIC: DAILY REWARDS
function RetentionEngine.CheckDailyStatus(player, data)
    local now = os.time()
    local lastLogin = data.LastLogin
    local timeDiff = now - lastLogin
    local oneDay = 86400

    if timeDiff >= oneDay then
        return "Ready", data.Streak
    else
        local timeLeft = oneDay - timeDiff
        return "Waiting", timeLeft
    end
end

return RetentionEngine`,
    },
    {
        name: "NotificationSystem.lua",
        content: `--[[
    [UNIFIED NOTIFICATION SYSTEM]
    Description: Modular UI system using TweenService.
]]

local NotificationSystem = {}
local TweenService = game:GetService("TweenService")

function NotificationSystem:Notify(player, text, color)
    local PlayerGui = player:FindFirstChild("PlayerGui")
    local frame = self:_BuildNotificationFrame(text, color)

    -- Visual Animation
    frame.Position = UDim2.new(1.5, 0, 0, 0)
    local enterTween = TweenService:Create(frame, TWEEN_INFO, {Position = UDim2.new(0, 0, 0, 0)})
    enterTween:Play()
end

return NotificationSystem`,
    },
    {
        name: "DataHandler.server.lua",
        content: `--[[
    [RETENTION SERVER HANDLER]
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RetentionEngine = require(script.Parent.RetentionEngine)

--// HANDLE CLIENT REQUESTS
function GetStatusFunc.OnServerInvoke(player)
    local data = RetentionEngine.LoadProfile(player)
    local dailyStatus = RetentionEngine.CheckDailyStatus(player, data)

    return {
        DailyStatus = dailyStatus,
        DailyStreak = data.Streak
    }
end`,
    },
];

// ----- i18n STRINGS -----
const translations = {
    EN: {
        nav_about:      "Home",
        nav_work:       "Projects",
        nav_estimator:  "Estimator",
        nav_hire:       "MomoTalk",
        hero_prefix:    "Sensei, I fix",
        hero_desc:      "Specialized Roblox Systems Engineer...",
        status_online:  "System Online",
        btn_see_work:   "VIEW DATABASE",
        contact_title:  "MomoTalk",
        contact_sub:    "Sensei, you have a new message.",
        calc_title:     "RESOURCE ESTIMATOR",
        calc_subtitle:  "Calculate budget requirements.",
        calc_type:      "OPERATION TYPE",
        serv_quick:     "Quick Task",
        serv_fix:       "Bug Fix",
        serv_sys:       "System",
        serv_game:      "Full Game",
        label_complexity: "Complexity",
        label_timeline: "Urgency",
    },
    TH: {
        nav_about:      "หน้าหลัก",
        nav_work:       "ผลงาน",
        nav_estimator:  "ราคา",
        nav_hire:       "MomoTalk",
        hero_prefix:    "เซ็นเซย์ครับ... ผมซ่อม",
        hero_desc:      "วิศวกรระบบ Roblox เชี่ยวชาญด้าน Backend...",
        status_online:  "สถานะ: ออนไลน์",
        btn_see_work:   "ดูฐานข้อมูล",
        contact_title:  "MomoTalk",
        contact_sub:    "เซ็นเซย์ มีข้อความใหม่ครับ",
        calc_title:     "ประเมินงบประมาณ",
        calc_subtitle:  "คำนวณงบประมาณที่ต้องใช้",
        calc_type:      "ประเภทภารกิจ",
        serv_quick:     "งานด่วน",
        serv_fix:       "แก้บั๊ก",
        serv_sys:       "ทำระบบ",
        serv_game:      "เกมเต็ม",
        label_complexity: "ความซับซ้อน",
        label_timeline: "ความเร่งด่วน",
    },
};
