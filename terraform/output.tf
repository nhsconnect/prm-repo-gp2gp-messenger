resource "aws_ssm_parameter" "service_url" {
  name  = "/repo/${var.environment}/output/${var.repo_name}/service-url"
  type  = "String"
  value = "https://${var.environment}.${var.dns_name}.patient-deductions.nhs.uk"
}