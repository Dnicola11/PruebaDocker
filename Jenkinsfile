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

        stage('Validate Expo project') {
            steps {
                sh 'npx expo install'  // Asegura que las dependencias nativas estén bien
            }
        }

        stage('TypeScript check (opcional)') {
            steps {
                sh 'npx tsc --noEmit'  // Solo valida los tipos, no compila
            }
        }
    }

    post {
        success {
            echo '✅ Proyecto validado correctamente en Jenkins (sin ejecución).'
        }
        failure {
            echo '❌ Error en la validación del proyecto.'
        }
    }
}


