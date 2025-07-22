# Educational App - Development Workflow Script
# PowerShell script for common development tasks

param(
    [string]$Option = ""
)

function Show-Menu {
    Clear-Host
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host "    Educational App - Development Menu" -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1) Kill all Node processes" -ForegroundColor Green
    Write-Host "2) Clear caches (npm, node_modules)" -ForegroundColor Green  
    Write-Host "3) Start dev server (Vite)" -ForegroundColor Green
    Write-Host "4) Fresh start (Kill + Clear + Dev server)" -ForegroundColor Yellow
    Write-Host "5) Full workflow (Kill + Clear + Dev + Build test)" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "6) Build production" -ForegroundColor Blue
    Write-Host "7) Preview production build" -ForegroundColor Blue
    Write-Host "8) Run linter" -ForegroundColor Blue
    Write-Host ""
    Write-Host "0) Exit" -ForegroundColor Red
    Write-Host ""
}

function Kill-NodeProcesses {
    Write-Host "🔄 Killing all Node.js processes..." -ForegroundColor Yellow
    try {
        Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
        Get-Process *node* -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Host "✅ Node processes terminated" -ForegroundColor Green
    }
    catch {
        Write-Host "ℹ️  No Node processes found to kill" -ForegroundColor Gray
    }
}

function Clear-Caches {
    Write-Host "🧹 Clearing caches..." -ForegroundColor Yellow
    
    # Clear npm cache
    npm cache clean --force
    Write-Host "✅ NPM cache cleared" -ForegroundColor Green
    
    # Remove node_modules and package-lock
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
        Write-Host "✅ node_modules removed" -ForegroundColor Green
    }
    
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
        Write-Host "✅ package-lock.json removed" -ForegroundColor Green
    }
    
    # Fresh install
    Write-Host "📦 Installing fresh dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

function Start-DevServer {
    Write-Host "🚀 Starting Vite development server..." -ForegroundColor Yellow
    Write-Host "🌐 Server will be available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    npm run dev
}

function Build-Production {
    Write-Host "🏗️  Building for production..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Production build completed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
    }
}

function Preview-Production {
    Write-Host "👀 Starting production preview..." -ForegroundColor Yellow
    npm run preview
}

function Run-Linter {
    Write-Host "🔍 Running ESLint..." -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ No linting errors!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Linting issues found" -ForegroundColor Yellow
    }
}

function Wait-ForKeyPress {
    Write-Host ""
    Write-Host "Press any key to continue..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Main execution
if ($Option -ne "") {
    # Handle command line option
    switch ($Option) {
        "1" { Kill-NodeProcesses; Wait-ForKeyPress }
        "2" { Clear-Caches; Wait-ForKeyPress }
        "3" { Start-DevServer }
        "4" { Kill-NodeProcesses; Clear-Caches; Start-DevServer }
        "5" { Kill-NodeProcesses; Clear-Caches; Build-Production; Start-DevServer }
        "6" { Build-Production; Wait-ForKeyPress }
        "7" { Preview-Production }
        "8" { Run-Linter; Wait-ForKeyPress }
        default { Write-Host "Invalid option: $Option" -ForegroundColor Red }
    }
} else {
    # Interactive menu
    do {
        Show-Menu
        $choice = Read-Host "Select an option (0-8)"
        
        switch ($choice) {
            "1" { Kill-NodeProcesses; Wait-ForKeyPress }
            "2" { Clear-Caches; Wait-ForKeyPress }
            "3" { Start-DevServer; break }
            "4" { Kill-NodeProcesses; Clear-Caches; Start-DevServer; break }
            "5" { Kill-NodeProcesses; Clear-Caches; Build-Production; Start-DevServer; break }
            "6" { Build-Production; Wait-ForKeyPress }
            "7" { Preview-Production; break }
            "8" { Run-Linter; Wait-ForKeyPress }
            "0" { 
                Write-Host "👋 Goodbye!" -ForegroundColor Green
                break 
            }
            default { 
                Write-Host "❌ Invalid choice. Please select 0-8." -ForegroundColor Red
                Wait-ForKeyPress
            }
        }
    } while ($choice -ne "0" -and $choice -ne "3" -and $choice -ne "4" -and $choice -ne "5" -and $choice -ne "7")
}
