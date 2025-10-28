terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">=4.0.0"
    }
    random = {
      source  = "hashicorp/random"
      version = ">=3.0.0"
    }
  }
  required_version = ">=1.5.0"
}

provider "azurerm" {
  features {}
  subscription_id = "ef430051-b4d4-4273-a587-ef6d687b47d8"
  tenant_id       = "065d3a74-4585-45ad-933d-de0d78a98f02"
}

# Unique suffix
resource "random_integer" "suffix" {
  min = 10000
  max = 99999
}

# Resource group
resource "azurerm_resource_group" "rg" {
  name     = "aiquote-static-rg"
  location = "East Asia"
}

# Storage account for static web hosting
resource "azurerm_storage_account" "static_sa" {
  name                     = "aiquotesa${random_integer.suffix.result}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# Static website (correct syntax for v4.x)
resource "azurerm_storage_account_static_website" "website" {
  storage_account_id = azurerm_storage_account.static_sa.id
  index_document     = "index.html"
  error_404_document = "index.html"
}

# Upload website files
resource "azurerm_storage_blob" "index" {
  name                   = "index.html"
  storage_account_name   = azurerm_storage_account.static_sa.name
  storage_container_name = "$web"
  type                   = "Block"
  source                 = "${path.module}/../index.html"
  content_type           = "text/html"
}

resource "azurerm_storage_blob" "style" {
  name                   = "style.css"
  storage_account_name   = azurerm_storage_account.static_sa.name
  storage_container_name = "$web"
  type                   = "Block"
  source                 = "${path.module}/../style.css"
  content_type           = "text/css"
}

resource "azurerm_storage_blob" "script" {
  name                   = "script.js"
  storage_account_name   = azurerm_storage_account.static_sa.name
  storage_container_name = "$web"
  type                   = "Block"
  source                 = "${path.module}/../script.js"
  content_type           = "application/javascript"
}

# Output
output "static_website_url" {
  value = azurerm_storage_account.static_sa.primary_web_endpoint
}
