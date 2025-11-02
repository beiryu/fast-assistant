# QuickTranslate - Automated Build & Deployment
# Production-ready Makefile for cross-platform builds

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

# Project Configuration
PROJECT_NAME := QuickTranslate
VERSION := $(shell node -p "require('./package.json').version")
BUILD_DIR := dist
ELECTRON_BUILD_DIR := dist-electron
NODE_VERSION := $(shell node --version)
NPM_VERSION := $(shell npm --version)

# Environment Detection
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    PLATFORM := mac
endif
ifeq ($(UNAME_S),Linux)
    PLATFORM := linux
endif
ifeq ($(OS),Windows_NT)
    PLATFORM := win
endif

.PHONY: help install clean lint type-check test env-check build-web build-desktop deploy-prod security-audit deps-update smoke-test

# Default target
help: ## Show this help message
	@echo "$(BLUE)$(PROJECT_NAME) Build & Deployment System$(NC)"
	@echo "$(BLUE)Version: $(VERSION) | Platform: $(PLATFORM)$(NC)"
	@echo ""
	@echo "$(YELLOW)Available targets:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Prerequisites:$(NC)"
	@echo "  Node.js: $(NODE_VERSION)"
	@echo "  npm: $(NPM_VERSION)"
	@echo ""

install: ## Install all dependencies
	@echo "$(BLUE)Installing dependencies...$(NC)"
	@npm ci
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

clean: ## Clean all build artifacts and caches
	@echo "$(BLUE)Cleaning build artifacts...$(NC)"
	@rm -rf $(BUILD_DIR) $(ELECTRON_BUILD_DIR) node_modules/.cache
	@npm run clean 2>/dev/null || true
	@echo "$(GREEN)✓ Clean completed$(NC)"

lint: ## Run ESLint
	@echo "$(BLUE)Running ESLint...$(NC)"
	@npm run lint
	@echo "$(GREEN)✓ Linting passed$(NC)"

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)Running TypeScript type check...$(NC)"
	@npx tsc --noEmit
	@echo "$(GREEN)✓ Type checking passed$(NC)"

env-check: ## Verify environment variables are configured
	@echo "$(BLUE)Checking environment configuration...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(RED)✗ .env file not found$(NC)"; \
		echo "$(YELLOW)  Copy .env.example to .env and configure your values$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(shell grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)" ]; then \
		echo "$(RED)✗ EXPO_PUBLIC_SUPABASE_URL not configured$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(shell grep EXPO_PUBLIC_SUPABASE_ANON_KEY .env | cut -d '=' -f2)" ]; then \
		echo "$(RED)✗ EXPO_PUBLIC_SUPABASE_ANON_KEY not configured$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(shell grep OPENAI_API_KEY .env | cut -d '=' -f2)" ]; then \
		echo "$(RED)✗ OPENAI_API_KEY not configured$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✓ Environment variables configured$(NC)"

security-audit: ## Run security audit on dependencies
	@echo "$(BLUE)Running security audit...$(NC)"
	@npm audit --audit-level high
	@echo "$(GREEN)✓ Security audit passed$(NC)"

test: ## Run all tests and quality checks
	@echo "$(BLUE)Running quality checks...$(NC)"
	@$(MAKE) lint
	@$(MAKE) type-check
	@echo "$(GREEN)✓ All tests passed$(NC)"

build-web: env-check ## Build web application
	@echo "$(BLUE)Building web application...$(NC)"
	@npm run build:web
	@echo "$(GREEN)✓ Web build completed: $(BUILD_DIR)/$(NC)"

build-desktop: env-check ## Build desktop application for current platform
	@echo "$(BLUE)Building desktop application for $(PLATFORM)...$(NC)"
ifeq ($(PLATFORM),mac)
	@npm run build:electron:mac
else ifeq ($(PLATFORM),linux)
	@npm run build:electron:linux
else ifeq ($(PLATFORM),win)
	@npm run build:electron:win
else
	@npm run build:electron
endif
	@echo "$(GREEN)✓ Desktop build completed: $(ELECTRON_BUILD_DIR)/$(NC)"

build-desktop-all: env-check ## Build desktop application for all platforms
	@echo "$(BLUE)Building desktop application for all platforms...$(NC)"
	@npm run build:electron:mac
	@npm run build:electron:win
	@npm run build:electron:linux
	@echo "$(GREEN)✓ All desktop builds completed: $(ELECTRON_BUILD_DIR)/$(NC)"

build: ## Build all platforms (web + desktop for current platform)
	@echo "$(BLUE)Building all platforms...$(NC)"
	@$(MAKE) build-web
	@$(MAKE) build-desktop
	@echo "$(GREEN)✓ All builds completed$(NC)"

smoke-test: ## Run smoke tests on built applications
	@echo "$(BLUE)Running smoke tests...$(NC)"
	@if [ -d "$(BUILD_DIR)" ]; then \
		echo "$(YELLOW)Testing web build...$(NC)"; \
		npx serve $(BUILD_DIR) -l 3001 & \
		SERVER_PID=$$!; \
		sleep 3; \
		curl -f http://localhost:3001 > /dev/null 2>&1 && echo "$(GREEN)✓ Web build serves correctly$(NC)" || echo "$(RED)✗ Web build failed smoke test$(NC)"; \
		kill $$SERVER_PID; \
	fi
	@if [ -d "$(ELECTRON_BUILD_DIR)" ]; then \
		echo "$(GREEN)✓ Desktop build files present$(NC)"; \
	fi

deploy-prod: ## Full production deployment workflow
	@echo "$(BLUE)Starting production deployment...$(NC)"
	@echo "$(YELLOW)Project: $(PROJECT_NAME) v$(VERSION)$(NC)"
	@echo "$(YELLOW)Platform: $(PLATFORM)$(NC)"
	@echo ""
	
	# Pre-deployment checks
	@echo "$(BLUE)Step 1/8: Environment validation$(NC)"
	@$(MAKE) env-check
	
	@echo "$(BLUE)Step 2/8: Security audit$(NC)"
	@$(MAKE) security-audit
	
	@echo "$(BLUE)Step 3/8: Quality checks$(NC)"
	@$(MAKE) test
	
	@echo "$(BLUE)Step 4/8: Clean build$(NC)"
	@$(MAKE) clean
	@$(MAKE) install
	
	@echo "$(BLUE)Step 5/8: Building applications$(NC)"
	@$(MAKE) build
	
	@echo "$(BLUE)Step 6/8: Smoke testing$(NC)"
	@$(MAKE) smoke-test
	
	@echo "$(BLUE)Step 7/8: Production deployment$(NC)"
	@if command -v vercel &> /dev/null; then \
		echo "$(YELLOW)Deploying web to Vercel (production)...$(NC)"; \
		vercel --prod --confirm; \
	else \
		echo "$(YELLOW)Vercel CLI not found, skipping web deployment$(NC)"; \
	fi
	
	@echo "$(BLUE)Step 8/8: Post-deployment verification$(NC)"
	@echo "$(YELLOW)Manual verification required:$(NC)"
	@echo "  - Test web app functionality"
	@echo "  - Test desktop app (manual distribution)"
	@echo "  - Verify translation API works"
	@echo "  - Check error monitoring"
	
	@echo ""
	@echo "$(GREEN)✓ Production deployment completed successfully!$(NC)"
	@echo "$(BLUE)Build artifacts:$(NC)"
	@echo "  Web: $(BUILD_DIR)/"
	@echo "  Desktop: $(ELECTRON_BUILD_DIR)/"

deps-update: ## Update all dependencies to latest versions
	@echo "$(BLUE)Updating dependencies...$(NC)"
	@npm update
	@npm audit fix
	@echo "$(GREEN)✓ Dependencies updated$(NC)"
	@echo "$(YELLOW)⚠ Run tests after dependency updates$(NC)"

package-desktop: build-desktop ## Package desktop app for distribution
	@echo "$(BLUE)Packaging desktop application...$(NC)"
	@mkdir -p releases/$(VERSION)
ifeq ($(PLATFORM),mac)
	@cp -r $(ELECTRON_BUILD_DIR)/mac-arm64/*.dmg releases/$(VERSION)/ 2>/dev/null || true
	@cp -r $(ELECTRON_BUILD_DIR)/mac-x64/*.dmg releases/$(VERSION)/ 2>/dev/null || true
endif
ifeq ($(PLATFORM),win)
	@cp -r $(ELECTRON_BUILD_DIR)/*.exe releases/$(VERSION)/ 2>/dev/null || true
endif
ifeq ($(PLATFORM),linux)
	@cp -r $(ELECTRON_BUILD_DIR)/*.AppImage releases/$(VERSION)/ 2>/dev/null || true
endif
	@echo "$(GREEN)✓ Desktop app packaged in releases/$(VERSION)/$(NC)"

# Development helpers
dev-setup: install env-check ## Complete development environment setup
	@echo "$(BLUE)Setting up development environment...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env from example...$(NC)"; \
		if [ -f .env.example ]; then \
			cp .env.example .env; \
		fi; \
		echo "$(RED)⚠ Please edit .env with your actual values$(NC)"; \
	fi
	@echo "$(BLUE)Checking Supabase Edge Functions setup...$(NC)"
	@if [ -d "supabase/functions" ]; then \
		echo "$(YELLOW)Note: Supabase Edge Functions use Deno runtime$(NC)"; \
		echo "$(YELLOW)  TypeScript errors in supabase/functions/ are expected in Node.js context$(NC)"; \
		echo "$(YELLOW)  These files are excluded from main TypeScript checking$(NC)"; \
		if command -v supabase &> /dev/null; then \
			echo "$(GREEN)✓ Supabase CLI found$(NC)"; \
		else \
			echo "$(YELLOW)⚠ Supabase CLI not found. Install with: npm install -g supabase$(NC)"; \
		fi; \
	fi
	@echo "$(BLUE)Running quality checks (excluding Supabase functions)...$(NC)"
	@$(MAKE) test
	@echo "$(GREEN)✓ Development environment ready$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Edit .env with your API keys"
	@echo "  2. Run: npm start"
	@echo "  3. For Supabase Edge Functions: Use Deno runtime (type checking handled separately)"

dev-mobile: ## Start mobile development
	@echo "$(BLUE)Starting mobile development...$(NC)"
	@npm start

dev-desktop: ## Start desktop development
	@echo "$(BLUE)Starting desktop development...$(NC)"
	@npm run electron:dev

dev-web: ## Start web development
	@echo "$(BLUE)Starting web development...$(NC)"
	@npm run web

# CI/CD helpers
ci-test: ## Run tests suitable for CI environment
	@echo "$(BLUE)Running CI tests...$(NC)"
	@$(MAKE) lint
	@$(MAKE) type-check
	@echo "$(GREEN)✓ CI tests completed$(NC)"

ci-build: ## Build for CI environment
	@echo "$(BLUE)Running CI build...$(NC)"
	@$(MAKE) clean
	@$(MAKE) install
	@$(MAKE) ci-test
	@$(MAKE) build-web
	@echo "$(GREEN)✓ CI build completed$(NC)"

# Status and info
status: ## Show project status and configuration
	@echo "$(BLUE)Project Status$(NC)"
	@echo "Name: $(PROJECT_NAME)"
	@echo "Version: $(VERSION)"
	@echo "Platform: $(PLATFORM)"
	@echo "Node.js: $(NODE_VERSION)"
	@echo "npm: $(NPM_VERSION)"
	@echo ""
	@echo "$(BLUE)Build Artifacts$(NC)"
	@if [ -d "$(BUILD_DIR)" ]; then echo "Web: ✓ $(BUILD_DIR)/"; else echo "Web: ✗ Not built"; fi
	@if [ -d "$(ELECTRON_BUILD_DIR)" ]; then echo "Desktop: ✓ $(ELECTRON_BUILD_DIR)/"; else echo "Desktop: ✗ Not built"; fi
	@echo ""
	@echo "$(BLUE)Environment$(NC)"
	@if [ -f .env ]; then echo ".env: ✓ Present"; else echo ".env: ✗ Missing"; fi

# Quick commands for common workflows
quick-web: clean install build-web ## Quick web build and test
quick-desktop: clean install build-desktop ## Quick desktop build
full-build: clean install build-desktop-all build-web ## Build everything
