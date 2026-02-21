/* ============================================================
   ✏️  SNIPPETS.JS — Your Code Vault showcased snippets
   Add, remove, or replace these with your own Lua code.
   ============================================================ */

const codeSnippets = [

    // ── SNIPPET 1 ─────────────────────────────────────────────
    {
        name: "RetentionEngine.lua",
        content:
`--[[
    [RETENTION ENGINE CORE]
    Author: Waterqak
    Description: Centralized server-side manager for Daily Rewards.
]]

local RetentionEngine = {}
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

function RetentionEngine.CheckDailyStatus(player, data)
    local now = os.time()
    local timeDiff = now - data.LastLogin
    local oneDay = 86400

    if timeDiff >= oneDay then
        return "Ready", data.Streak
    else
        return "Waiting", oneDay - timeDiff
    end
end

return RetentionEngine`,
    },

    // ── SNIPPET 2 ─────────────────────────────────────────────
    {
        name: "NotificationSystem.lua",
        content:
`--[[
    [UNIFIED NOTIFICATION SYSTEM]
    Description: Modular UI system using TweenService.
]]

local NotificationSystem = {}
local TweenService = game:GetService("TweenService")

function NotificationSystem:Notify(player, text, color)
    local frame = self:_BuildNotificationFrame(text, color)
    frame.Position = UDim2.new(1.5, 0, 0, 0)
    local tween = TweenService:Create(frame, TWEEN_INFO, {
        Position = UDim2.new(0, 0, 0, 0)
    })
    tween:Play()
end

return NotificationSystem`,
    },

    // ── SNIPPET 3 ─────────────────────────────────────────────
    {
        name: "DataHandler.server.lua",
        content:
`--[[
    [RETENTION SERVER HANDLER]
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RetentionEngine = require(script.Parent.RetentionEngine)

function GetStatusFunc.OnServerInvoke(player)
    local data = RetentionEngine.LoadProfile(player)
    local dailyStatus = RetentionEngine.CheckDailyStatus(player, data)

    return {
        DailyStatus = dailyStatus,
        DailyStreak = data.Streak
    }
end`,
    },

    // ── ADD A NEW SNIPPET HERE ─────────────────────────────────
    // {
    //     name: "MyScript.lua",
    //     content:
    // `-- paste your Lua code here`,
    // },

];

/* ============================================================
   CODE VAULT LOGIC — don't edit below this line
   ============================================================ */

function buildCodeTabs() {
    const tabsEl = document.getElementById('code-tabs');
    tabsEl.innerHTML = codeSnippets.map((s, i) =>
        `<div class="code-tab${i === 0 ? ' active' : ''}" onclick="switchTab(${i}, this)">${s.name}</div>`
    ).join('');
}

function switchTab(index, el) {
    playClick(800, 0.05);
    document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const codeEl = document.getElementById('code-display');
    codeEl.textContent = codeSnippets[index].content;
    Prism.highlightElement(codeEl);
}

function copyCode() {
    navigator.clipboard.writeText(document.getElementById('code-display').textContent).then(() => {
        const win = document.querySelector('.code-window');
        win.style.borderColor = '#00ff88';
        setTimeout(() => win.style.borderColor = '#333', 300);
    });
}
