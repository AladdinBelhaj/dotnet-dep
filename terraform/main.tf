terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=2.91.0"
    }
  }

}


provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "iv-rg" {
  name     = "iv-rg"
  location = "France Central"
  tags = {
    environment = "dev"
  }
}