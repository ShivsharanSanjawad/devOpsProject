pipeline {
  agent any

  // ── Auto-trigger on GitHub webhook push ───────────────────────
  triggers {
    githubPush()
  }

  environment {
    // Jenkins credential IDs — must match what Ansible created
    SONAR_TOKEN_CRED = 'sonarqube-token'      // Secret-text credential
    APP_SSH_CRED     = 'app-ec2-ssh-key'       // SSH key credential

    // App EC2 settings (set as Jenkins global env vars via Ansible)
    APP_HOST         = "${env.APP_HOST ?: 'REPLACE_WITH_APP_EC2_IP'}"
    APP_USER         = 'ubuntu'
    APP_PATH         = '/opt/codearena'
    DEPLOY_BRANCH    = 'main'

    // SonarQube server (private IP reachable from Jenkins EC2 via VPC)
    SONAR_HOST_URL   = "${env.SONAR_HOST_URL ?: 'http://REPLACE_WITH_SONAR_PRIVATE_IP:9000'}"

    // Health-check endpoint
    HEALTH_CHECK_URL = "http://${env.APP_HOST ?: 'REPLACE_WITH_APP_EC2_IP'}/api/problems"
  }

  stages {

    // ─────────────────────────────────────────────────────────────
    stage('Checkout') {
      steps {
        checkout scm
        echo "Branch: ${env.GIT_BRANCH} | Commit: ${env.GIT_COMMIT?.take(8)}"
      }
    }

    // ─────────────────────────────────────────────────────────────
    // Pass SonarQube params directly — no withSonarQubeEnv needed.
    // This means we don't rely on the Jenkins SonarQube server config
    // being correctly set up via the Groovy init script.
    stage('SonarQube Scan') {
      steps {
        dir('backend') {
          withCredentials([string(credentialsId: env.SONAR_TOKEN_CRED, variable: 'SONAR_TOKEN')]) {
            sh '''
              chmod +x ./mvnw
              ./mvnw -B -DskipTests package sonar:sonar \
                -Dsonar.host.url=${SONAR_HOST_URL} \
                -Dsonar.token=${SONAR_TOKEN} \
                -Dsonar.projectKey=codearena \
                -Dsonar.projectName="CodeArena"
            '''
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    stage('Build Docker Images') {
      steps {
        // Prune dangling images/cache first to avoid "no space left on device"
        sh 'docker system prune -f --volumes || true'
        sh 'docker compose build --no-cache'
      }
    }

    // ─────────────────────────────────────────────────────────────
    stage('Deploy to App EC2') {
      steps {
        sshagent(credentials: [env.APP_SSH_CRED]) {
          sh """
            ssh -o StrictHostKeyChecking=no ${APP_USER}@${APP_HOST} '
              set -e
              if [ ! -d "${APP_PATH}/.git" ]; then
                git clone https://github.com/ShivsharanSanjawad/devOpsProject.git ${APP_PATH}
              fi
              cd ${APP_PATH}
              git fetch --all
              git checkout ${DEPLOY_BRANCH}
              git pull origin ${DEPLOY_BRANCH}
              docker compose up --build -d
              docker image prune -f
            '
          """
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    stage('Health Check') {
      steps {
        sleep(time: 30, unit: 'SECONDS')
        script {
          def response = sh(
            script: "curl -sf -o /dev/null -w '%{http_code}' ${HEALTH_CHECK_URL} || echo 'FAIL'",
            returnStdout: true
          ).trim()
          if (response != '200') {
            error("Health check failed! Got HTTP ${response} from ${HEALTH_CHECK_URL}")
          }
          echo "Health check passed — app is up (HTTP ${response})"
        }
      }
    }

  }

  // ── Post-build actions ────────────────────────────────────────
  post {
    success {
      echo """
        ╔═══════════════════════════════════════╗
        ║  ✅  Pipeline PASSED                  ║
        ║  Branch : ${env.GIT_BRANCH}
        ║  Commit : ${env.GIT_COMMIT?.take(8)}
        ╚═══════════════════════════════════════╝
      """
    }
    failure {
      echo """
        ╔═══════════════════════════════════════╗
        ║  ❌  Pipeline FAILED                  ║
        ║  TIP: Click the failed stage box      ║
        ║  then click 'Logs' to see the error.  ║
        ╚═══════════════════════════════════════╝
      """
    }
    always {
      cleanWs()
    }
  }
}
