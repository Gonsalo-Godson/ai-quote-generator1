pipeline {
    agent any

    environment {
        ARM_SUBSCRIPTION_ID = 'ef430051-b4d4-4273-a587-ef6d687b47d8'
        ARM_TENANT_ID       = '065d3a74-4585-45ad-933d-de0d78a98f02'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Gonsalo-Godson/ai-quote-generator1.git'
            }
        }

        stage('Setup Terraform') {
            steps {
                bat 'terraform -version'
                bat 'cd terraform-azure-function && terraform init'
            }
        }

        stage('Terraform Apply') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'azure-sp', usernameVariable: 'ARM_CLIENT_ID', passwordVariable: 'ARM_CLIENT_SECRET')]) {
                    bat '''
                    cd terraform-azure-function
                    terraform apply -auto-approve
                    '''
                }
            }
        }
    }
}
