pipeline {
  agent any

  parameters {
    string(name: 'APP_HOST', defaultValue: 'app.example.com', description: 'Public DNS or IP of the App EC2')
    string(name: 'APP_USER', defaultValue: 'ubuntu', description: 'SSH user for App EC2')
    string(name: 'APP_PATH', defaultValue: '/opt/codearena', description: 'Path to repo on App EC2')
    string(name: 'DEPLOY_BRANCH', defaultValue: 'main', description: 'Git branch to deploy')
    string(name: 'SSH_CREDENTIALS_ID', defaultValue: 'app-ec2-ssh-key', description: 'Jenkins SSH credential ID')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('SonarQube Scan') {
      steps {
        dir('backend') {
          withSonarQubeEnv('sonarqube') {
            sh './mvnw -B -DskipTests sonar:sonar'
          }
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Deploy') {
      steps {
        sshagent(credentials: [params.SSH_CREDENTIALS_ID]) {
          sh "ssh -o StrictHostKeyChecking=no ${params.APP_USER}@${params.APP_HOST} 'cd ${params.APP_PATH} && git fetch --all && git checkout ${params.DEPLOY_BRANCH} && git pull && docker compose up --build -d'"
        }
      }
    }
  }
}
