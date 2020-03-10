locals {
  account_id = data.aws_caller_identity.current.account_id
}

data "aws_iam_policy_document" "ecs-assume-role-policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"
      identifiers = [
        "ecs-tasks.amazonaws.com"
      ]
    }
  }
}

resource "aws_iam_role" "gp2gp" {
  name               = "${var.environment}-${var.component_name}-EcsTaskRole"
  assume_role_policy = data.aws_iam_policy_document.ecs-assume-role-policy.json
  description        = "Role assumed by ${var.component_name} ECS task"

  tags = {
    Terraform = "true"
    Environment = var.environment
    Deductions-Component = var.component_name
  }
}

data "aws_iam_policy_document" "gp2gp-s3" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject"
    ]

    resources = [
      "arn:aws:s3:::${var.s3_bucket_name}/*"
    ]
  }
}

data "aws_iam_policy_document" "gp2gp-s3-bucket" {
  statement {
    actions = [
      "s3:ListBucket"
    ]

    resources = [
      "arn:aws:s3:::${var.s3_bucket_name}"
    ]
  }
}

data "aws_iam_policy_document" "ecr_policy_doc" {
  statement {
    actions = [
      "ecr:*"
    ]

    resources = [
      "arn:aws:ecr:${var.region}:${local.account_id}:repository/deductions/${var.component_name}"
    ]
  }
  statement {
    actions = [
      "ecr:GetAuthorizationToken"
    ]

    resources = [
      "*"
    ]
  }
}

data "aws_iam_policy_document" "logs_policy_doc" {
  statement {
    actions = [
      "logs:*"
    ]

    resources = [
      "*"
    ]
  }
}

data "aws_iam_policy_document" "ssm_policy_doc" {
  statement {
    actions = [
      "ssm:*"
    ]

    resources = [
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/NHS/${var.environment}-${local.account_id}/${var.component_name}/authorization_keys",
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/nhs/${var.environment}/mq/app-username",
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/nhs/${var.environment}/mq/app-password",
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/NHS/${var.environment}-${local.account_id}/${var.component_name}/deductions_asid",
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/NHS/${var.environment}-${local.account_id}/${var.component_name}/deductions_ods_code"
    ]
  }
}


resource "aws_iam_policy" "gp2gp-s3" {
  name   = "${var.environment}-gp2gp-s3"
  policy = data.aws_iam_policy_document.gp2gp-s3.json
}

resource "aws_iam_policy" "gp2gp-s3-bucket" {
  name   = "${var.environment}-gp2gp-s3-bucket"
  policy = data.aws_iam_policy_document.gp2gp-s3-bucket.json
}

resource "aws_iam_policy" "gp2gp-ecr" {
  name   = "${var.environment}-gp2gp-ecr"
  policy = data.aws_iam_policy_document.ecr_policy_doc.json
}

resource "aws_iam_policy" "gp2gp-logs" {
  name   = "${var.environment}-gp2gp-logs"
  policy = data.aws_iam_policy_document.logs_policy_doc.json
}

resource "aws_iam_policy" "gp2gp-ssm" {
  name   = "${var.environment}-gp2gp-ssm"
  policy = data.aws_iam_policy_document.ssm_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "gp2gp-s3-attach" {
  role       = aws_iam_role.gp2gp.name
  policy_arn = aws_iam_policy.gp2gp-s3.arn
}

resource "aws_iam_role_policy_attachment" "gp2gp-s3-bucket-attach" {
  role       = aws_iam_role.gp2gp.name
  policy_arn = aws_iam_policy.gp2gp-s3-bucket.arn
}

resource "aws_iam_role_policy_attachment" "gp2gp-ecr-attach" {
  role       = aws_iam_role.gp2gp.name
  policy_arn = aws_iam_policy.gp2gp-ecr.arn
}

resource "aws_iam_role_policy_attachment" "gp2gp-ssm" {
  role       = aws_iam_role.gp2gp.name
  policy_arn = aws_iam_policy.gp2gp-ssm.arn
}

resource "aws_iam_role_policy_attachment" "gp2gp-logs" {
  role       = aws_iam_role.gp2gp.name
  policy_arn = aws_iam_policy.gp2gp-logs.arn
}
