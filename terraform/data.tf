data "aws_caller_identity" "current" {}

data "aws_ssm_parameter" "root_zone_id" {
  name = "/repo/output/prm-deductions-base-infra/root-zone-id"
}

data "aws_ssm_parameter" "private_zone_id" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/private-root-zone-id"
}

data "aws_ssm_parameter" "gp2gp_adaptor_authorization_keys" {
  name = "/repo/${var.environment}/user-input/gp2gp-adaptor-authorization-keys"
}

data "aws_ssm_parameter" "gp2gp_adaptor_authorization_keys_for_ehr_repo" {
  name = "/repo/${var.environment}/user-input/ehr-repo-authorization-keys"
}

data "aws_ssm_parameter" "GP2GP_ADAPTOR_REPOSITORY_ODS_CODE" {
  name = "/repo/${var.environment}/user-input/gp2gp-adaptor-deductions-ods-code"
}

data "aws_ssm_parameter" "GP2GP_ADAPTOR_REPOSITORY_ASID" {
  name = "/repo/${var.environment}/user-input/gp2gp-adaptor-deductions-asid"
}

data "aws_ssm_parameter" "stomp-endpoint_0" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/stomp-endpoint-0"
}

data "aws_ssm_parameter" "stomp-endpoint_1" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/stomp-endpoint-1"
}

data "aws_ssm_parameter" "amq-username" {
  name = "/repo/${var.environment}/user-input/mq-app-username"
}

data "aws_ssm_parameter" "amq-password" {
  name = "/repo/${var.environment}/user-input/mq-app-password"
}

data "aws_ssm_parameter" "deductions_private_ecs_cluster_id" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/deductions-private-ecs-cluster-id"
}

data "aws_ssm_parameter" "deductions_private_private_subnets" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/deductions-private-private-subnets"
}

data "aws_ssm_parameter" "deductions_private_vpc_id" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/private-vpc-id"
}

data "aws_ssm_parameter" "deductions_private_int_alb_httpl_arn" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/deductions-private-int-alb-httpl-arn"
}

data "aws_ssm_parameter" "deductions_private_int_alb_httpsl_arn" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/deductions-private-int-alb-httpsl-arn"
}

data "aws_ssm_parameter" "deductions_private_gp2gp_adaptor_sg_id" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/deductions-private-gp2gp-adaptor-sg-id"
}

data "aws_ssm_parameter" "GP2GP_ADAPTOR_MHS_OUTBOUND_URL" {
  name = "/repo/${var.environment}/output/prm-mhs-infra/mhs-outbound-url"
}

data "aws_ssm_parameter" "GP2GP_ADAPTOR_MHS_ROUTE_URL" {
  name = "/repo/${var.environment}/output/prm-mhs-infra/mhs-route-url"
}

data "aws_ssm_parameter" "deductions_private_alb_internal_dns" {
  name = "/repo/${var.environment}/output/prm-deductions-infra/deductions-private-alb-internal-dns"
}

data "aws_ssm_parameter" "GP2GP_ADAPTOR_GP_TO_REPO_URL" {
  name = "/repo/${var.environment}/output/prm-deductions-gp-to-repo/service-url"
}

data "aws_ssm_parameter" "GP2GP_ADAPTOR_AUTHORIZATION_KEYS_FOR_GP_TO_REPO" {
  name = "/repo/${var.environment}/user-input/gp-to-repo-authorization-keys"
}