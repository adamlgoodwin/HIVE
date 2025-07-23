# Educational App Development Manager
# PowerShell script for managing the dev environment

param(
    [int]$Choice = 0
)

# Set console title
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
    Write-ColorOutput "Green" "[SUCCESS] $Message"
}

function Write-Info($Message) {
    Write-ColorOutput "Yellow" "[INFO] $Message"
}

function Write-Error($Message) {
    Write-ColorOutput "Red" "[ERROR] $Message"
}

function Stop-AllServers {
    Write-Header "STOPPING ALL DEVELOPMENT SERVERS"
    
    try {
        # Kill Node.js processes
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
                            Write-Info "Stopped process $processId using port $port"
                        } catch {
                            # Process might already be stopped
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
    Write-Header "OPENING WINDSURF BROWSER PREVIEW"
    
    try {
        # First detect which port the server is running on
        $port = 3000
        $portFound = $false
        
        # Check common ports
        foreach ($testPort in @(3000, 3001, 5173)) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$testPort" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    $port = $testPort
                    $portFound = $true
                    break
                }
            } catch {
                # Port not available
            }
        }
        
        if (-not $portFound) {
            Write-Error "No development server found on common ports (3000, 3001, 5173)"
            Write-Info "Make sure to start the dev server first (option 3)"
            return
        }
        
        $url = "http://localhost:$port"
        $quickLoginUrl = "http://localhost:$port/quick-login"
        
        Write-Info "Server detected on port $port"
        Write-Info "Opening Windsurf browser preview..."
        Write-ColorOutput "Magenta" "Main app: $url"
        Write-ColorOutput "Magenta" "Quick login: $quickLoginUrl"
        
        # Open Windsurf browser preview using file:// protocol to trigger preview
        Write-Info "Triggering Windsurf browser preview..."
        
        # Create a temporary file with URL to trigger browser preview
        $tempFile = [System.IO.Path]::GetTempFileName() + ".html"
        $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Windsurf Browser Preview</title>
    <meta http-equiv="refresh" content="0; url=$url">
    <script>
        // Auto-redirect and close temp window
        setTimeout(() => {
            window.location.href = '$url';
        }, 100);
    </script>
</head>
<body>
    <h2>🚀 Opening Educational App...</h2>
    <p>Redirecting to: <a href="$url">$url</a></p>
    <p><a href="$quickLoginUrl">Quick Login Page</a></p>
    <script>console.log('Windsurf browser preview opened!');</script>
</body>
</html>
"@
        
        $htmlContent | Out-File -FilePath $tempFile -Encoding UTF8
        
        # Open the temp file which should trigger Windsurf browser preview
        Start-Process $tempFile
        
        Write-ColorOutput "Cyan" "✅ Windsurf Browser Features Available:"
        Write-ColorOutput "Cyan" "  📊 Console logs (React errors, Supabase responses)"
        Write-ColorOutput "Cyan" "  🔗 Network requests (API calls to Supabase)"
        Write-ColorOutput "Cyan" "  🐛 Real-time debugging info"
        Write-ColorOutput "Cyan" "  📱 Responsive design testing"
        Write-ColorOutput "Cyan" "  🔍 Element inspection"
        
        Write-Success "Browser preview should open in Windsurf!"
        
        # Clean up temp file after a delay
        Start-Sleep -Seconds 3
        if (Test-Path $tempFile) {
            Remove-Item $tempFile -ErrorAction SilentlyContinue
        }
    }
    catch {
        Write-Error "Error opening browser: $($_.Exception.Message)"
        Write-Info "Fallback: Manually use browser preview in Windsurf with URL: http://localhost:3000"
    }
}

function Invoke-QuickStart {
    Write-Header "QUICK START - SKIP CACHE CLEARING"
    Write-Info "This will: Stop servers -> Start server -> Open dev browser"
    Write-Host ""
    
    # Step 1: Stop servers
    Stop-AllServers
    
    # Step 2: Wait for system to settle
    Write-Info "Waiting for system to settle..."
    Start-Sleep -Seconds 2
    
    # Step 3: Start server in background
    Write-Info "Starting development server..."
    Start-Job -ScriptBlock {
        Set-Location $args[0]
        npm run dev
    } -ArgumentList (Get-Location).Path | Out-Null
    
    # Step 4: Wait for server to start
    Write-Info "Waiting for server to start..."
    $maxWait = 15
    $waited = 0
    do {
        Start-Sleep -Seconds 1
        $waited++
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "Server is ready!"
                break
            }
        } catch {
            # Server not ready yet
        }
        
        if ($waited -ge $maxWait) {
            Write-Error "Server did not start within $maxWait seconds"
            break
        }
    } while ($true)
    
    # Step 5: Show browser info
    Write-Info "Quick start complete! Server running in background."
    Write-Info "To see backend logs and debug:"
    Write-ColorOutput "Cyan" "  1. Use Windsurf browser preview for console logs"
    Write-ColorOutput "Cyan" "  2. Terminal shows Vite dev server logs"
    Write-ColorOutput "Cyan" "  3. Supabase errors appear in browser console"
    Write-Success "Ready for development! Use browser preview to debug."
}

function Invoke-AllSteps {
    Write-Header "EXECUTING ALL STEPS IN SEQUENCE"
    Write-Info "This will: Stop servers -> Clear caches -> Start server -> Open browser"
    Write-Host ""
    
    # Step 1: Stop servers
    Stop-AllServers
    
    # Step 2: Clear caches
    Clear-Caches
    
    # Step 3: Wait for system to settle
    Write-Info "Waiting for system to settle..."
    Start-Sleep -Seconds 3
    
    # Step 4: Show connection info
    Write-Info "Server will be available at detected port (3000, 3001, etc)"
    Write-Info "Use Windsurf browser preview to access with console logs"
    
    # Step 5: Start server (this will block)
    Start-DevServer
}

function Show-Menu {
    Clear-Host
    Write-Header "EDUCATIONAL APP DEVELOPMENT MANAGER"
    Write-Host ""
    Write-ColorOutput "White" "Choose an option:"
    Write-Host ""
    Write-ColorOutput "Yellow" "1 - Stop all servers and processes"
    Write-ColorOutput "Yellow" "2 - Clear caches and reinstall dependencies"
    Write-ColorOutput "Yellow" "3 - Start development server"
    Write-ColorOutput "Yellow" "4 - Open application in browser"
    Write-ColorOutput "Yellow" "5 - Do all of the above (full clean start)"
    Write-ColorOutput "Cyan" "6 - Quick start (skip cache clearing)"
    Write-Host ""
    Write-ColorOutput "Gray" "0 - Exit"
    Write-Host ""
}

# Main script logic
if ($Choice -eq 0) {
    do {
        Show-Menu
        $Choice = Read-Host "Enter your choice (0-6)"
        
        switch ($Choice) {
            1 { Stop-AllServers; Read-Host "Press Enter to continue" }
            2 { Clear-Caches; Read-Host "Press Enter to continue" }
            3 { Start-DevServer }
            4 { Open-Browser; Read-Host "Press Enter to continue" }
            5 { Invoke-AllSteps }
            6 { Invoke-QuickStart }
            0 { 
                Write-ColorOutput "Green" "Goodbye!"
                exit 
            }
            default { 
                Write-Error "Invalid choice. Please select 0-6."
                Start-Sleep -Seconds 2
            }
        }
        
        if ($Choice -ne 3 -and $Choice -ne 5 -and $Choice -ne 6 -and $Choice -ne 0) {
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
        6 { Invoke-QuickStart }
        default { 
            Write-Error "Invalid choice. Use 1-6."
            exit 1
        }
    }
}
