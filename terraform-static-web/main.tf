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

# ✅ Detect if Resource Group exists
data "azurerm_resource_group" "existing" {
  name = "aiquote-static-rg"
}

# ✅ Use existing RG (auto-detect or fallback)
locals {
  rg_name     = try(data.azurerm_resource_group.existing.name, "aiquote-static-rg")
  rg_location = try(data.azurerm_resource_group.existing.location, "East Asia")
}

# ✅ Random suffix for unique storage account
resource "random_integer" "suffix" {
  min = 10000
  max = 99999
}

# ✅ Storage account for static web hosting
resource "azurerm_storage_account" "static_sa" {
  name                     = "aiquotesa${random_integer.suffix.result}"
  resource_group_name      = local.rg_name
  location                 = local.rg_location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# ✅ Enable static website
resource "azurerm_storage_account_static_website" "website" {
  storage_account_id = azurerm_storage_account.static_sa.id
  index_document     = "index.html"
  error_404_document = "index.html"
}

# ✅ Wait for the $web container
resource "null_resource" "wait_for_static_site" {
  depends_on = [azurerm_storage_account_static_website.website]
  provisioner "local-exec" {
    command = "powershell -Command \"Start-Sleep -Seconds 10\""
  }
}

# ✅ Upload website files
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

resource "null_resource" "force_redeploy" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = "echo 'Redeploying website changes...'"
  }
}


# ✅ Outputs
output "resource_group_name" {
  description = "Azure Resource Group Name"
  value       = local.rg_name
}

output "storage_account_name" {
  description = "Storage Account Name"
  value       = azurerm_storage_account.static_sa.name
}

output "static_website_url" {
  description = "URL of the deployed static website"
  value       = azurerm_storage_account.static_sa.primary_web_endpoint
}
