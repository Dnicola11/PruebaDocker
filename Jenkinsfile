pipeline {
    agent any

    environment {
        NODE_ENV = 'development'
    }

    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/Dnicola11/PruebaDocker.git', branch: 'main'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Start Expo build') {
            steps {
                sh 'npx expo install'
                sh 'npx expo prebuild'
            }
        }

        stage('Build Android APK (optional)') {
            steps {
                sh 'npx expo build:android'
            }
        }
    }

    post {
        success {
            echo '✅ Proyecto Expo compilado con éxito.'
        }
        failure {
            echo '❌ Falló el proceso de construcción.'
        }
    }
}

