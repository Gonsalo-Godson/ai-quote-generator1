pipeline {
    agent any

    environment {
        AZURE_CREDENTIALS = credentials('azure-sp')
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Gonsalo-Godson/ai-quote-generator1.git'
            }
        }

        stage('Setup Terraform') {
            steps {
                sh 'terraform -version'
                dir('terraform-azure-function') {
                    sh 'terraform init'
                }
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform-azure-function') {
                    withCredentials([usernamePassword(credentialsId: 'azure-sp', usernameVariable: 'ARM_CLIENT_ID', passwordVariable: 'ARM_CLIENT_SECRET')]) {
                        withEnv([
                            "ARM_SUBSCRIPTION_ID=ef430051-b4d4-4273-a587-ef6d687b47d8",
                            "ARM_TENANT_ID=065d3a74-4585-45ad-933d-de0d78a98f02"
                        ]) {
                            sh 'terraform apply -auto-approve'
                        }
                    }
                }
            }
        }
    }
}
