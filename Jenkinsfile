pipeline {
  agent any

  // ── Auto-trigger on GitHub webhook push ───────────────────────
  triggers {
    githubPush()
  }

  environment {
    // SonarQube server name (must match what you configure in Jenkins → Manage → Configure System)
    SONAR_SERVER     = 'sonarqube'
    // Jenkins SSH credential ID for the App EC2 (add this in Jenkins → Credentials)
    APP_SSH_CRED     = 'app-ec2-ssh-key'
    // App EC2 settings — override at runtime or set as Jenkins global env vars
    APP_HOST         = "${env.APP_HOST ?: 'REPLACE_WITH_APP_EC2_IP'}"
    APP_USER         = 'ubuntu'
    APP_PATH         = '/opt/codearena'
    DEPLOY_BRANCH    = 'main'
    // Health-check endpoint (nginx proxies / → frontend, /api/actuator/health → backend)
    HEALTH_CHECK_URL = "http://${env.APP_HOST ?: 'REPLACE_WITH_APP_EC2_IP'}/api/actuator/health"
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
    stage('SonarQube Scan') {
      steps {
        dir('backend') {
          withSonarQubeEnv(env.SONAR_SERVER) {
            // Uses ./mvnw + sonar-maven-plugin declared in pom.xml
            sh './mvnw -B -DskipTests sonar:sonar'
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    stage('Quality Gate') {
      steps {
        // Wait up to 5 minutes for SonarQube to compute the gate result.
        // Fails the build if the quality gate is not "OK".
        timeout(time: 5, unit: 'MINUTES') {
          waitForQualityGate abortPipeline: true
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    stage('Build Docker Images') {
      steps {
        // Build all images defined in docker-compose.yml
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
              # Clone repo if it doesn't exist yet
              if [ ! -d "${APP_PATH}/.git" ]; then
                git clone https://github.com/${env.GIT_URL?.replaceFirst("https://github.com/", "") ?: "YOUR_ORG/YOUR_REPO"} ${APP_PATH}
              fi
              cd ${APP_PATH}
              git fetch --all
              git checkout ${DEPLOY_BRANCH}
              git pull origin ${DEPLOY_BRANCH}
              # Bring up all services; --build rebuilds changed images
              docker compose up --build -d
              # Remove dangling images to save disk space
              docker image prune -f
            '
          """
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    stage('Health Check') {
      steps {
        // Give containers ~30s to become healthy, then verify nginx is serving
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
        ║  Check the stage that failed above.   ║
        ╚═══════════════════════════════════════╝
      """
    }
    always {
      // Clean workspace to avoid stale files between builds
      cleanWs()
    }
  }
}
