locals {
    task_role_arn                = aws_iam_role.gp2gp.arn
    task_execution_role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.environment}-${var.component_name}-EcsTaskRole"
    task_ecr_url                 = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.region}.amazonaws.com"
    task_log_group               = "/nhs/deductions/${var.environment}-${data.aws_caller_identity.current.account_id}/${var.component_name}"
    environment_variables        = [
      { name = "GP2GP_ADAPTOR_REPOSITORY_ODS_CODE", value = data.aws_ssm_parameter.GP2GP_ADAPTOR_REPOSITORY_ODS_CODE.value },
      { name = "GP2GP_ADAPTOR_REPOSITORY_ASID", value = data.aws_ssm_parameter.GP2GP_ADAPTOR_REPOSITORY_ASID.value },
      { name = "NHS_ENVIRONMENT", value = var.environment },
      { name = "GP2GP_ADAPTOR_MHS_OUTBOUND_URL", value = data.aws_ssm_parameter.GP2GP_ADAPTOR_MHS_OUTBOUND_URL.value },
      { name = "GP2GP_ADAPTOR_MHS_ROUTE_URL", value = "https://route.mhs.${var.environment}.non-prod.patient-deductions.nhs.uk" },
      { name = "NHS_NUMBER_PREFIX", value = data.aws_ssm_parameter.nhs_number_prefix.value },
      { name = "TOGGLE_USE_SDS_FHIR", value = var.toggle_use_sds_fhir },
      { name = "SDS_FHIR_API_KEY", value = data.aws_ssm_parameter.sds_fhir_api_key.value },
      { name = "SDS_FHIR_URL", value = data.aws_ssm_parameter.sds_fhir_url.value },
      { name = "LOG_LEVEL", value = var.log_level}
    ]
}

resource "aws_ecs_task_definition" "task" {
  family                    = var.component_name
  network_mode              = "awsvpc"
  requires_compatibilities  = ["FARGATE"]
  cpu                       = var.task_cpu
  memory                    = var.task_memory
  execution_role_arn        = local.task_execution_role
  task_role_arn             = local.task_role_arn


  container_definitions  =  templatefile("${path.module}/templates/ecs-task-def.tmpl", {
        container_name        = "${var.component_name}-container",
        ecr_url               = local.task_ecr_url,
        image_name            = "deductions/${var.component_name}",
        image_tag             = var.task_image_tag,
        cpu                   = var.task_cpu,
        memory                = var.task_memory,
        container_port        = var.port,
        host_port             = var.port,
        log_region            = var.region,
        log_group             = local.task_log_group,
        environment_variables = jsonencode(local.environment_variables)
    })

  tags = {
    Environment = var.environment
    CreatedBy = var.repo_name
  }
}

resource "aws_security_group" "ecs-tasks-sg" {
  name        = "${var.environment}-${var.component_name}-ecs-tasks-sg"
  vpc_id      = data.aws_ssm_parameter.deductions_private_vpc_id.value

  ingress {
    description     = "Allow traffic from internal ALB of GP2GP Adaptor"
    protocol        = "tcp"
    from_port       = "3000"
    to_port         = "3000"
    security_groups = [
      aws_security_group.gp2gp_adaptor_alb.id
    ]
  }

  egress {
    description = "Allow All Outbound"
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-${var.component_name}-ecs-tasks-sg"
    CreatedBy   = var.repo_name
    Environment = var.environment
  }
}

data "aws_ssm_parameter" "service-to-ehr-repo-sg-id" {
  name = "/repo/${var.environment}/output/prm-deductions-ehr-repository/service-to-ehr-repo-sg-id"
}

resource "aws_security_group_rule" "gp2gp-adaptor-to-ehr-repo" {
  type = "ingress"
  protocol = "TCP"
  from_port = 443
  to_port = 443
  security_group_id = data.aws_ssm_parameter.service-to-ehr-repo-sg-id.value
  source_security_group_id = local.ecs_task_sg_id
}

data "aws_ssm_parameter" "service-to-mhs-outbound-sg-id" {
  name = "/repo/${var.environment}/output/prm-mhs-infra/service-to-mhs-outbound-sg-id"
}

resource "aws_security_group_rule" "gp2gp-adaptor-to-mhs-outbound" {
  type = "ingress"
  protocol = "TCP"
  from_port = 443
  to_port = 443
  security_group_id = data.aws_ssm_parameter.service-to-mhs-outbound-sg-id.value
  source_security_group_id = local.ecs_task_sg_id
}

data "aws_ssm_parameter" "service-to-mhs-route-sg-id" {
  name = "/repo/${var.environment}/output/prm-mhs-infra/service-to-mhs-route-sg-id"
}

resource "aws_security_group_rule" "gp2gp-adaptor-to-mhs-route" {
  type = "ingress"
  protocol = "TCP"
  from_port = 443
  to_port = 443
  security_group_id = data.aws_ssm_parameter.service-to-mhs-route-sg-id.value
  source_security_group_id = local.ecs_task_sg_id
}
