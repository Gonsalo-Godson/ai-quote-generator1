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
    null = {
      source  = "hashicorp/null"
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

# Generate unique suffix for storage account
resource "random_integer" "suffix" {
  min = 10000
  max = 99999
}

# Resource group (ignore if already exists)
resource "azurerm_resource_group" "rg" {
  name     = "aiquote-static-rg"
  location = "East Asia"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

# Storage account for static web hosting
resource "azurerm_storage_account" "static_sa" {
  name                     = "aiquotesa${random_integer.suffix.result}"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  allow_blob_public_access = true
}

# Enable static website feature
resource "azurerm_storage_account_static_website" "website" {
  storage_account_id = azurerm_storage_account.static_sa.id
  index_document     = "index.html"
  error_404_document = "index.html"
}

# Wait to ensure $web container is available
resource "null_resource" "wait_for_static_site" {
  depends_on = [azurerm_storage_account_static_website.website]

  provisioner "local-exec" {
    command = "powershell -Command \"Start-Sleep -Seconds 10\""
  }
}

# Upload static files
resource "azurerm_storage_blob" "index" {
  depends_on             = [null_resource.wait_for_static_site]
  name                   = "index.html"
  storage_account_name   = azurerm_storage_account.static_sa.name
  storage_container_name = "$web"
  type                   = "Block"
  source                 = "${path.module}/../index.html"
  content_type           = "text/html"
}

resource "azurerm_storage_blob" "style" {
  depends_on             = [null_resource.wait_for_static_site]
  name                   = "style.css"
  storage_account_name   = azurerm_storage_account.static_sa.name
  storage_container_name = "$web"
  type                   = "Block"
  source                 = "${path.module}/../style.css"
  content_type           = "text/css"
}

resource "azurerm_storage_blob" "script" {
  depends_on             = [null_resource.wait_for_static_site]
  name                   = "script.js"
  storage_account_name   = azurerm_storage_account.static_sa.name
  storage_container_name = "$web"
  type                   = "Block"
  source                 = "${path.module}/../script.js"
  content_type           = "application/javascript"
}

# Outputs
output "resource_group_name" {
  description = "Azure Resource Group Name"
  value       = azurerm_resource_group.rg.name
}

output "storage_account_name" {
  description = "Storage Account Name"
  value       = azurerm_storage_account.static_sa.name
}

output "static_website_url" {
  description = "URL of the deployed static website"
  value       = azurerm_storage_account.static_sa.primary_web_endpoint
}
