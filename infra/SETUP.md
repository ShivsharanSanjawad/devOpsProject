# CodeArena — Deployment Guide

Everything is automated. **Two steps.**

---

## Step 1 — Fill in your secrets

Edit `infra/ansible/group_vars/all.yml`:

```yaml
jenkins_admin_password: "YourPassword"     # Jenkins UI login
sonar_admin_password:   "YourPassword"     # SonarQube UI login
grafana_admin_password: "YourPassword"     # Grafana UI login
github_repo:  "ShivsharanSanjawad/devOpsProject"
github_token: "ghp_..."                    # PAT with repo + admin:repo_hook scopes
app_db_password: "YourDBPassword"
app_jwt_secret:  "at-least-32-random-chars"
```

> Create a GitHub PAT at: https://github.com/settings/tokens  
> Required scopes: **repo** + **admin:repo_hook**

---

## Step 2 — Run the master playbook

```bash
cd infra/ansible

# Make sure your key has correct permissions
chmod 400 shivsharan.pem

# Fill in your EC2 IPs in inventory.ini first!
# Then run:
ansible-playbook site.yml
```

That's it. The playbook will:
- Configure all 3 EC2s (Docker, Nginx, EBS, node_exporter)
- Install and start SonarQube, generate its Jenkins API token
- Install Jenkins, skip the wizard, create admin user
- Install all required plugins
- Configure SSH credentials, SonarQube server, pipeline job
- Register the GitHub webhook automatically
- Clone the repo and do the first `docker compose up`
- Start Prometheus + Grafana

---

## After the playbook finishes

The last task prints all URLs:

| Service    | URL |
|-----------|-----|
| App        | `http://<APP_IP>` |
| Jenkins    | `http://<JENKINS_IP>:8080` |
| SonarQube  | `http://<SONAR_IP>:9000` |
| Prometheus | `http://<JENKINS_IP>:9090` |
| Grafana    | `http://<JENKINS_IP>:3000` (admin/admin) |

**Import Grafana dashboard:** Dashboards → Import → ID **`1860`** → select Prometheus datasource.

**Push to `main`** → Jenkins auto-builds. Done.
