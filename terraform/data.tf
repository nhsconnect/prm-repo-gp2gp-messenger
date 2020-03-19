data "aws_caller_identity" "current" {}

data "aws_ssm_parameter" "root_zone_id" {
  name = "/NHS/deductions-${data.aws_caller_identity.current.account_id}/root_zone_id"
}

data "aws_ssm_parameter" "private_zone_id" {
  name = "/NHS/deductions-${data.aws_caller_identity.current.account_id}/${var.environment}/private_root_zone_id"
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

data "aws_ssm_parameter" "amq-username" {
  name = "/nhs/${var.environment}/mq/app-username"
}

data "aws_ssm_parameter" "amq-password" {
  name = "/nhs/${var.environment}/mq/app-password"
}

data "aws_ssm_parameter" "deductions_private_ecs_cluster_id" {
  name = "/nhs/${var.environment}/deductions_private_ecs_cluster_id"
}

data "aws_ssm_parameter" "deductions_private_private_subnets" {
  name = "/nhs/${var.environment}/deductions_private_private_subnets"
}

# data "aws_ssm_parameter" "deductions_private_alb_dns" {
#   name = "/nhs/${var.environment}/deductions_private_alb_dns"
# }

data "aws_ssm_parameter" "deductions_private_vpc_id" {
  name = "/nhs/${var.environment}/deductions_private_vpc_id"
}

# data "aws_ssm_parameter" "deductions_private_alb_httpl_arn" {
#   name = "/nhs/${var.environment}/deductions_private_alb_httpl_arn"
# }

# data "aws_ssm_parameter" "deductions_private_alb_httpsl_arn" {
#   name = "/nhs/${var.environment}/deductions_private_alb_httpsl_arn"
# }

data "aws_ssm_parameter" "deductions_private_int_alb_httpl_arn" {
  name = "/nhs/${var.environment}/deductions_private_int_alb_httpl_arn"
}

data "aws_ssm_parameter" "deductions_private_int_alb_httpsl_arn" {
  name = "/nhs/${var.environment}/deductions_private_int_alb_httpsl_arn"
}

data "aws_ssm_parameter" "deductions_private_gp2gp_adaptor_sg_id" {
  name = "/nhs/${var.environment}/deductions_private_gp2gp_adaptor_sg_id"
}

data "aws_ssm_parameter" "mhs_outbound_url" {
  name = "/NHS/deductions-${data.aws_caller_identity.current.account_id}/mhs-${var.environment}/outbound_url"
}

data "aws_ssm_parameter" "deductions_private_alb_internal_dns" {
   name = "/nhs/${var.environment}/deductions_private_alb_internal_dns"
}
