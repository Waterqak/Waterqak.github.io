const codeSnippets = [

    // ── SNIPPET 1 ─────────────────────────────────────────────
    {
        name: "RetentionEngine.lua",
        content:
`--[[
    [RETENTION ENGINE CORE]
    Author: YourNameHere
    Description: Centralized server-side manager for Daily Rewards.
]]

local RetentionEngine = {}

local ONE_DAY = 86400
local STREAK_BREAK = ONE_DAY * 2

function RetentionEngine.CheckDailyStatus(player, data)
    local now = os.time()
    local timeDiff = now - data.LastLogin

    if timeDiff >= STREAK_BREAK then
        data.Streak = 0 -- Reset streak if they missed a day
        return "Ready", data.Streak
    elseif timeDiff >= ONE_DAY then
        return "Ready", data.Streak
    else
        return "Waiting", ONE_DAY - timeDiff
    end
end

function RetentionEngine.ClaimDaily(player, data)
    data.LastLogin = os.time()
    data.Streak += 1
    return data.Streak
end

-- Mock profile loader (Replace with actual DataStore2/ProfileService logic)
function RetentionEngine.LoadProfile(player)
    return { LastLogin = 0, Streak = 0 }
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
local Players = game:GetService("Players")

local TWEEN_INFO = TweenInfo.new(0.5, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)

function NotificationSystem:_BuildNotificationFrame(text, color)
    local player = Players.LocalPlayer
    local gui = player:WaitForChild("PlayerGui"):FindFirstChild("NotificationGui")
    
    if not gui then
        gui = Instance.new("ScreenGui")
        gui.Name = "NotificationGui"
        gui.Parent = player.PlayerGui
    end

    local frame = Instance.new("TextLabel")
    frame.Size = UDim2.new(0, 250, 0, 50)
    frame.BackgroundColor3 = color or Color3.fromRGB(40, 40, 40)
    frame.TextColor3 = Color3.new(1, 1, 1)
    frame.Text = text
    frame.Parent = gui
    return frame
end

function NotificationSystem:Notify(text, color)
    local frame = self:_BuildNotificationFrame(text, color)
    
    -- Start off-screen to the right
    frame.Position = UDim2.new(1, 10, 0.8, 0)
    
    -- Slide in
    local slideIn = TweenService:Create(frame, TWEEN_INFO, {
        Position = UDim2.new(1, -260, 0.8, 0)
    })
    slideIn:Play()

    -- Cleanup after 3 seconds
    task.delay(3, function()
        local slideOut = TweenService:Create(frame, TWEEN_INFO, {
            Position = UDim2.new(1, 10, 0.8, 0)
        })
        slideOut:Play()
        slideOut.Completed:Wait()
        frame:Destroy()
    end)
end

return NotificationSystem`,
    },

    // ── SNIPPET 3 ─────────────────────────────────────────────
    {
        name: "DataHandler.server.lua",
        content:
`--[[
    [RETENTION SERVER HANDLER]
    Description: Bridges client requests with the Retention Engine.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RetentionEngine = require(script.Parent.RetentionEngine)

-- Create Remotes
local GetStatusFunc = Instance.new("RemoteFunction")
GetStatusFunc.Name = "GetDailyStatus"
GetStatusFunc.Parent = ReplicatedStorage

local ClaimEvent = Instance.new("RemoteEvent")
ClaimEvent.Name = "ClaimDaily"
ClaimEvent.Parent = ReplicatedStorage

GetStatusFunc.OnServerInvoke = function(player)
    local data = RetentionEngine.LoadProfile(player)
    local status, timeOrStreak = RetentionEngine.CheckDailyStatus(player, data)

    return {
        DailyStatus = status,
        Value = timeOrStreak, -- Returns time remaining OR current streak
        Streak = data.Streak
    }
end

ClaimEvent.OnServerEvent:Connect(function(player)
    local data = RetentionEngine.LoadProfile(player)
    local status = RetentionEngine.CheckDailyStatus(player, data)

    if status == "Ready" then
        local newStreak = RetentionEngine.ClaimDaily(player, data)
        print(player.Name .. " claimed daily! New Streak: " .. newStreak)
        -- TODO: Award player currency/items here based on newStreak
    end
end)`,
    },

    // ── SNIPPET 4 (NEW) ────────────────────────────────────────
    {
        name: "ClientController.local.lua",
        content:
`--[[
    [CLIENT CONTROLLER]
    Description: Checks daily status on join and notifies the player.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local NotificationSystem = require(script.Parent.NotificationSystem)

local GetStatusFunc = ReplicatedStorage:WaitForChild("GetDailyStatus")
local ClaimEvent = ReplicatedStorage:WaitForChild("ClaimDaily")

local function InitializeDailyRewards()
    local data = GetStatusFunc:InvokeServer()
    
    if data.DailyStatus == "Ready" then
        NotificationSystem:Notify(
            "Daily Reward Ready! Streak: " .. data.Streak, 
            Color3.fromRGB(50, 200, 50) -- Green
        )
        
        -- Mocking a button click to claim:
        task.wait(1)
        ClaimEvent:FireServer()
    else
        local hoursLeft = math.floor(data.Value / 3600)
        NotificationSystem:Notify(
            "Next reward in " .. hoursLeft .. " hours.", 
            Color3.fromRGB(200, 50, 50) -- Red
        )
    end
end

InitializeDailyRewards()`,
    }
];

// ── SNIPPET 5 ────────────────────────────────────────
    {
        name: "DataManager.server.lua",
        content:
`--[[
    [DATASTORE MANAGER]
    Description: Handles persistent saving and loading for Retention Engine.
    Features: Caching, Error Handling (pcall), and Server-Close protection.
]]

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local PlayerDataStore = DataStoreService:GetDataStore("DailyRewards_V1")
local sessionData = {}

local DataManager = {}

local function createDefaultData()
    return {
        LastLogin = 0,
        Streak = 0
    }
end

function DataManager.LoadProfile(player)
    -- Return cached data if it exists to prevent DataStore throttling
    if sessionData[player.UserId] then
        return sessionData[player.UserId]
    end

    local success, data = pcall(function()
        return PlayerDataStore:GetAsync(player.UserId)
    end)

    if success then
        sessionData[player.UserId] = data or createDefaultData()
    else
        warn("Failed to load data for " .. player.Name)
        sessionData[player.UserId] = createDefaultData() -- Fallback so game doesn't break
    end

    return sessionData[player.UserId]
end

function DataManager.SaveProfile(player)
    local data = sessionData[player.UserId]
    if not data then return end

    local success, errorMessage = pcall(function()
        PlayerDataStore:SetAsync(player.UserId, data)
    end)

    if not success then
        warn("Failed to save data for " .. player.Name .. ": " .. tostring(errorMessage))
    end
end

-- Save and cleanup memory when a player leaves
Players.PlayerRemoving:Connect(function(player)
    DataManager.SaveProfile(player)
    sessionData[player.UserId] = nil 
end)

-- Ensure all remaining players are saved if the server shuts down
game:BindToClose(function()
    for _, player in ipairs(Players:GetPlayers()) do
        DataManager.SaveProfile(player)
    end
end)

return DataManager`,
    }
