data "aws_caller_identity" "current" {}

data "terraform_remote_state" "prm-deductions-infra" {
  backend = "s3"

  config = {
        bucket  = "prm-327778747031-terraform-states"
        key     = "gpportal/terraform.tfstate"
        region  = "eu-west-2"
        encrypt = true
  }
}

data "aws_ssm_parameter" "root_zone_id" {
  name = "/NHS/deductions-${data.aws_caller_identity.current.account_id}/root_zone_id"
}

data "aws_ssm_parameter" "authorization_keys" {
  name = "/NHS/${var.environment}-${data.aws_caller_identity.current.account_id}/gp2gp-adaptor/authorization_keys"
}

data "aws_ssm_parameter" "deductions_ods_code" {
  name = "/NHS/${var.environment}-${data.aws_caller_identity.current.account_id}/gp2gp-adaptor/deductions_ods_code"
}

data "aws_ssm_parameter" "deductions_asid" {
  name = "/NHS/${var.environment}-${data.aws_caller_identity.current.account_id}/gp2gp-adaptor/deductions_asid"
}

data "aws_ssm_parameter" "stomp-endpoint_0" {
  name = "/NHS/${var.environment}-${data.aws_caller_identity.current.account_id}/stomp-endpoint/0"
}

data "aws_ssm_parameter" "stomp-endpoint_1" {
  name = "/NHS/${var.environment}-${data.aws_caller_identity.current.account_id}/stomp-endpoint/1"
}

data "aws_secretsmanager_secret" "amq-username" {
  name = "/nhs/${var.environment}/mq/app-username"
}

data "aws_secretsmanager_secret" "amq-password" {
  name = "/nhs/${var.environment}/mq/app-password"
}