# Educational App Development Manager
# PowerShell script for managing the dev environment

param(
    [int]$Choice = 0
)

# Colors for better output
$Host.UI.RawUI.WindowTitle = "Educational App Dev Manager"

function Write-ColorOutput($ForegroundColor, $Message) {
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Write-Header($Message) {
    Write-Host ""
    Write-ColorOutput "Cyan" "=========================================="
    Write-ColorOutput "Cyan" $Message
    Write-ColorOutput "Cyan" "=========================================="
}

function Write-Success($Message) {
    Write-ColorOutput "Green" "✅ $Message"
}

function Write-Info($Message) {
    Write-ColorOutput "Yellow" "ℹ️  $Message"
}

function Write-Error($Message) {
    Write-ColorOutput "Red" "❌ $Message"
}

function Stop-AllServers {
    Write-Header "KILLING ALL DEVELOPMENT SERVERS"
    
    try {
        # Kill Node.js processes (Vite dev server)
        Write-Info "Stopping Node.js processes..."
        Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        
        # Kill processes using common dev ports
        Write-Info "Freeing up development ports (3000, 5173, 8080, 4000)..."
        $ports = @(3000, 5173, 8080, 4000)
        foreach ($port in $ports) {
            $processes = netstat -ano | findstr ":$port"
            if ($processes) {
                $processIds = $processes | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
                foreach ($processId in $processIds) {
                    if ($processId -match '^\d+$') {
                        try {
                            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                            Write-Info "Killed process $processId using port $port"
                        } catch {
                            # Process might already be dead
                        }
                    }
                }
            }
        }
        
        Write-Success "All development servers stopped"
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Error "Error stopping servers: $($_.Exception.Message)"
    }
}

function Clear-Caches {
    Write-Header "CLEARING ALL CACHES"
    
    try {
        # Clear npm cache
        Write-Info "Clearing npm cache..."
        npm cache clean --force 2>$null
        
        # Remove node_modules and package-lock.json
        if (Test-Path "node_modules") {
            Write-Info "Removing node_modules directory..."
            Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        if (Test-Path "package-lock.json") {
            Write-Info "Removing package-lock.json..."
            Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
        }
        
        # Clear Vite cache
        if (Test-Path ".vite") {
            Write-Info "Clearing Vite cache..."
            Remove-Item ".vite" -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        # Clear dist folder
        if (Test-Path "dist") {
            Write-Info "Clearing dist folder..."
            Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        # Reinstall dependencies
        Write-Info "Reinstalling dependencies..."
        npm install
        
        Write-Success "All caches cleared and dependencies reinstalled"
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Error "Error clearing caches: $($_.Exception.Message)"
    }
}

function Start-DevServer {
    Write-Header "STARTING DEVELOPMENT SERVER"
    
    try {
        Write-Info "Starting Vite development server on port 3000..."
        Write-Info "Press Ctrl+C to stop the server when ready"
        Write-ColorOutput "Magenta" "Server will be available at: http://localhost:3000"
        Write-ColorOutput "Magenta" "Quick Login page: http://localhost:3000/quick-login"
        Write-Host ""
        
        # Start the dev server
        npm run dev
    }
    catch {
        Write-Error "Error starting dev server: $($_.Exception.Message)"
    }
}

function Open-Browser {
    Write-Header "OPENING BROWSER"
    
    try {
        $url = "http://localhost:3000"
        Write-Info "Opening browser to $url..."
        Start-Process $url
        
        Start-Sleep -Seconds 2
        
        $quickLoginUrl = "http://localhost:3000/quick-login"
        Write-Info "Opening Quick Login page in new tab: $quickLoginUrl..."
        Start-Process $quickLoginUrl
        
        Write-Success "Browser opened successfully"
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Error "Error opening browser: $($_.Exception.Message)"
    }
}

function Invoke-AllSteps {
    Write-Header "EXECUTING ALL STEPS IN SEQUENCE"
    Write-Info "This will: Kill servers → Clear caches → Start server → Open browser"
    Write-Host ""
    
    # Step 1: Kill servers
    Stop-AllServers
    
    # Step 2: Clear caches
    Clear-Caches
    
    # Step 3: Wait a moment for system to settle
    Write-Info "Waiting for system to settle..."
    Start-Sleep -Seconds 3
    
    # Step 4: Open browser first (before server starts)
    Write-Info "Pre-opening browser tabs (they'll load once server starts)..."
    Start-Process "http://localhost:3000"
    Start-Sleep -Seconds 1
    Start-Process "http://localhost:3000/quick-login"
    
    # Step 5: Start server (this will block)
    Start-DevServer
}

function Show-Menu {
    Clear-Host
    Write-Header "EDUCATIONAL APP DEVELOPMENT MANAGER"
    Write-Host ""
    Write-ColorOutput "White" "Choose an option:"
    Write-Host ""
    Write-ColorOutput "Yellow" "1) Kill all servers and processes"
    Write-ColorOutput "Yellow" "2) Clear caches and reinstall dependencies"
    Write-ColorOutput "Yellow" "3) Start development server"
    Write-ColorOutput "Yellow" "4) Open application in browser"
    Write-ColorOutput "Yellow" "5) Do all of the above (recommended)"
    Write-Host ""
    Write-ColorOutput "Gray" "0) Exit"
    Write-Host ""
}

# Main script logic
if ($Choice -eq 0) {
    do {
        Show-Menu
        $Choice = Read-Host "Enter your choice (0-5)"
        
        switch ($Choice) {
            1 { Stop-AllServers; Read-Host "Press Enter to continue" }
            2 { Clear-Caches; Read-Host "Press Enter to continue" }
            3 { Start-DevServer }
            4 { Open-Browser; Read-Host "Press Enter to continue" }
            5 { Invoke-AllSteps }
            0 { 
                Write-ColorOutput "Green" "Goodbye! 👋"
                exit 
            }
            default { 
                Write-Error "Invalid choice. Please select 0-5."
                Start-Sleep -Seconds 2
            }
        }
        
        if ($Choice -ne 3 -and $Choice -ne 5 -and $Choice -ne 0) {
            $Choice = 0  # Return to menu unless starting server or doing all steps
        }
    } while ($Choice -eq 0)
} else {
    # Direct execution with parameter
    switch ($Choice) {
        1 { Stop-AllServers }
        2 { Clear-Caches }
        3 { Start-DevServer }
        4 { Open-Browser }
        5 { Invoke-AllSteps }
        default { 
            Write-Error "Invalid choice. Use 1-5."
            exit 1
        }
    }
}
