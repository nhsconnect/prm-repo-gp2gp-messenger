resource "aws_cloudwatch_log_group" "log_group" {
  name = "/nhs/deductions/${var.environment}-${data.aws_caller_identity.current.account_id}/${var.component_name}"

  tags = {
    Terraform = "true"
    Environment = var.environment
    Deductions-Component = var.component_name
  }
}