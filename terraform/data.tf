data "aws_caller_identity" "current" {}

data "aws_ssm_parameter" "root_zone_id" {
  name = "/repo/prm-deductions-base-infra/output/root-zone-id"
}

data "aws_ssm_parameter" "private_zone_id" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/private-root-zone-id"
}

data "aws_ssm_parameter" "authorization_keys" {
  name = "/repo/${var.environment}/prm-deductions-component-template/user-input/gp2gp-adaptor-authorization-keys"
}

data "aws_ssm_parameter" "deductions_ods_code" {
  name = "/repo/${var.environment}/prm-deductions-gp2gp-adaptor/user-input/gp2gp-adaptor-deductions-ods-code"
}

data "aws_ssm_parameter" "deductions_asid" {
  name = "/repo/${var.environment}/prm-deductions-gp2gp-adaptor/user-input/gp2gp-adaptor-deductions-asid"
}

data "aws_ssm_parameter" "stomp-endpoint_0" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/stomp-endpoint-0"
}

data "aws_ssm_parameter" "stomp-endpoint_1" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/stomp-endpoint-1"
}

data "aws_ssm_parameter" "amq-username" {
  name = "/repo/${var.environment}/prm-deductions-infra/user-input/mq-app-username"
}

data "aws_ssm_parameter" "amq-password" {
  name = "/repo/${var.environment}/prm-deductions-infra/user-input/mq-app-password"
}

data "aws_ssm_parameter" "deductions_private_ecs_cluster_id" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-ecs-cluster-id"
}

data "aws_ssm_parameter" "deductions_private_private_subnets" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-private-subnets"
}

data "aws_ssm_parameter" "deductions_private_vpc_id" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/private-vpc-id"
}

data "aws_ssm_parameter" "deductions_private_int_alb_httpl_arn" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-int-alb-httpl-arn"
}

data "aws_ssm_parameter" "deductions_private_int_alb_httpsl_arn" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-int-alb-httpsl-arn"
}

data "aws_ssm_parameter" "deductions_private_gp2gp_adaptor_sg_id" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-gp2gp-adaptor-sg-id"
}

data "aws_ssm_parameter" "mhs_outbound_url" {
  name = "/repo/${var.environment}/prm-mhs-infra/output/mhs-outbound-url"
}

data "aws_ssm_parameter" "deductions_private_alb_internal_dns" {
  name = "/repo/${var.environment}/prm-deductions-infra/output/deductions-private-alb-internal-dns"
}
