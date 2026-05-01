output "jenkins_public_ip" {
  value       = aws_instance.jenkins.public_ip
  description = "Public IP for Jenkins EC2"
}

output "sonar_public_ip" {
  value       = aws_instance.sonar.public_ip
  description = "Public IP for SonarQube EC2"
}

output "app_public_ip" {
  value       = aws_instance.app.public_ip
  description = "Public IP for App EC2"
}

output "jenkins_url" {
  value       = "http://${aws_instance.jenkins.public_ip}:8080"
  description = "Jenkins UI URL"
}

output "sonarqube_url" {
  value       = "http://${aws_instance.sonar.public_ip}:9000"
  description = "SonarQube UI URL"
}

output "prometheus_url" {
  value       = "http://${aws_instance.jenkins.public_ip}:9090"
  description = "Prometheus UI URL"
}

output "grafana_url" {
  value       = "http://${aws_instance.jenkins.public_ip}:3000"
  description = "Grafana UI URL (admin / admin)"
}

output "app_url" {
  value       = "http://${aws_instance.app.public_ip}"
  description = "CodeArena app URL"
}
