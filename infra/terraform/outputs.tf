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
