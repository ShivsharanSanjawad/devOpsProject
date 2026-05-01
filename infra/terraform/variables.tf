variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "ap-south-1"
}

variable "aws_az" {
  type        = string
  description = "AWS availability zone"
  default     = "ap-south-1a"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  type        = string
  description = "Public subnet CIDR block"
  default     = "10.0.1.0/24"
}

variable "allowed_ssh_cidr" {
  type        = string
  description = "CIDR block allowed to SSH"
  default     = "0.0.0.0/0"
}

variable "ssh_key_name" {
  type        = string
  description = "Name of existing AWS key pair"
}

variable "jenkins_instance_type" {
  type        = string
  description = "Jenkins EC2 instance type"
  default     = "c7i-flex.large"
}

variable "sonar_instance_type" {
  type        = string
  description = "SonarQube EC2 instance type"
  default     = "c7i-flex.large"
}

variable "app_instance_type" {
  type        = string
  description = "App EC2 instance type"
  default     = "c7i-flex.large"
}

variable "mysql_ebs_size_gb" {
  type        = number
  description = "Size of MySQL data EBS volume"
  default     = 20
}
