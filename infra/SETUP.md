# CodeArena — CI/CD & Monitoring Setup Guide

After running Terraform + Ansible, complete these one-time manual steps.

---

## Step 0 — Fill in inventory.ini

```bash
# Get IPs from terraform output
cd infra/terraform
terraform output
```

Edit `infra/ansible/inventory.ini` and replace every `YOUR_*` placeholder with real IPs.

---

## Step 1 — Run Ansible Playbooks (in order)

```bash
cd infra/ansible

# App EC2 — Docker, Nginx, EBS mount, node_exporter
ansible-playbook -i inventory.ini app.yml

# SonarQube EC2 — SonarQube + node_exporter
ansible-playbook -i inventory.ini sonar.yml

# Jenkins EC2 — Jenkins, Docker, node_exporter, Prometheus, Grafana
ansible-playbook -i inventory.ini jenkins.yml
```

> The last command prints the **Jenkins initial admin password** — copy it.

---

## Step 2 — Jenkins First-Time Setup

1. Open `http://<JENKINS_IP>:8080`
2. Enter the admin password from the Ansible output
3. Click **Install suggested plugins**
4. Create your admin user

---

## Step 3 — Install Required Jenkins Plugins

Jenkins → Manage Jenkins → Plugins → Available plugins

Install these (search and tick each):

| Plugin | Why |
|--------|-----|
| `GitHub Integration` | Enables `githubPush()` trigger |
| `SonarQube Scanner` | Connects to SonarQube server |
| `SSH Agent` | For `sshagent()` in Jenkinsfile |
| `Workspace Cleanup` | For `cleanWs()` in post block |

Click **Install** → **Restart Jenkins after installation**

---

## Step 4 — Add SSH Credential for App EC2

Jenkins → Manage Jenkins → Credentials → (global) → Add Credentials

```
Kind:        SSH Username with private key
ID:          app-ec2-ssh-key          ← must match Jenkinsfile
Username:    ubuntu
Private Key: [paste your .pem contents]
```

---

## Step 5 — Configure SonarQube Server in Jenkins

Jenkins → Manage Jenkins → System → SonarQube servers

```
Name:                sonarqube          ← must match SONAR_SERVER in Jenkinsfile
Server URL:          http://<SONAR_IP>:9000
Server auth token:   [generate in SonarQube UI, paste here]
```

### Generate SonarQube token

1. Open `http://<SONAR_IP>:9000` (default login: admin / admin — change it!)
2. Top-right avatar → My Account → Security → Generate Token
3. Copy token → paste into Jenkins credential above

---

## Step 6 — Clone Repo on App EC2 (first deploy only)

```bash
ssh ubuntu@<APP_IP>
sudo mkdir -p /opt/codearena
sudo chown ubuntu:ubuntu /opt/codearena
git clone https://github.com/YOUR_ORG/YOUR_REPO.git /opt/codearena
cp /opt/codearena/.env.example /opt/codearena/.env
# Edit .env with your real values
nano /opt/codearena/.env
```

---

## Step 7 — Set APP_HOST in Jenkins

Jenkins → Manage Jenkins → System → Global properties → Environment variables

```
Name:  APP_HOST
Value: <your App EC2 public IP>
```

---

## Step 8 — Create Jenkins Pipeline Job

1. Jenkins → New Item → **Pipeline** → name it `codearena`
2. Under **Pipeline**:
   - Definition: `Pipeline script from SCM`
   - SCM: Git
   - Repository URL: `https://github.com/YOUR_ORG/YOUR_REPO.git`
   - Credentials: add GitHub token if private repo
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
3. Save

---

## Step 9 — Add GitHub Webhook

GitHub repo → Settings → Webhooks → Add webhook

```
Payload URL:   http://<JENKINS_IP>:8080/github-webhook/
Content type:  application/json
Events:        Just the push event
```

Click **Add webhook** → it should show a green tick on the first ping.

---

## Step 10 — Import Grafana Dashboard

1. Open `http://<JENKINS_IP>:3000` (admin / admin)
2. Left sidebar → Dashboards → Import
3. Enter dashboard ID: **`1860`** (Node Exporter Full) → Load
4. Select **Prometheus** as the datasource → Import

You'll see CPU, memory, disk, and network metrics for all 3 EC2s.

---

## URLs Summary

| Service | URL |
|---------|-----|
| Jenkins | `http://<JENKINS_IP>:8080` |
| SonarQube | `http://<SONAR_IP>:9000` |
| Prometheus | `http://<JENKINS_IP>:9090` |
| Grafana | `http://<JENKINS_IP>:3000` |
| App | `http://<APP_IP>` |

> Run `terraform output` in `infra/terraform/` to get all IPs.

---

## Triggering a Build

After the webhook is set, **push any commit to `main`** → Jenkins auto-builds within ~30 seconds.

To trigger manually: Jenkins → `codearena` → **Build Now**
