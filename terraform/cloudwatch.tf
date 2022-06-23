locals {
  error_logs_metric_name              = "ErrorCountInLogs"
  gp2gp_messenger_service_metric_namespace = "Gp2GpMessenger"
}

resource "aws_cloudwatch_log_group" "log_group" {
  name = "/nhs/deductions/${var.environment}-${data.aws_caller_identity.current.account_id}/${var.component_name}"

  tags = {
    Environment = var.environment
    CreatedBy = var.repo_name
  }
}

resource "aws_cloudwatch_log_metric_filter" "log_metric_filter" {
  name           = "${var.environment}-${var.component_name}-error-logs"
  pattern        = "{ $.level = \"ERROR\" }"
  log_group_name = aws_cloudwatch_log_group.log_group.name

  metric_transformation {
    name          = local.error_logs_metric_name
    namespace     = local.gp2gp_messenger_service_metric_namespace
    value         = 1
    default_value = 0
  }
}

resource "aws_ssm_parameter" "error_log_metric_namespace_name" {
  name = "/repo/${var.environment}/output/${var.repo_name}/error_log_metric_namespace"
  type = "String"
  value = local.gp2gp_messenger_service_metric_namespace
  tags = {
    CreatedBy   = var.repo_name
    Environment = var.environment
  }
}