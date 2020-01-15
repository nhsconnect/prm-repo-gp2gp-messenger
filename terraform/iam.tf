data "aws_iam_policy_document" "ecs-assume-role-policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = [
        "ecs-tasks.amazonaws.com"
      ]
    }
  }
}

resource "aws_iam_role" "gp2gp" {
  name               = "${var.environment}-gp2gp-EcsTaskRole"
  assume_role_policy = "${data.aws_iam_policy_document.ecs-assume-role-policy.json}"
  description        = "Role assumed by gp2gp ECS task"
}

data "aws_iam_policy_document" "gp2gp-s3" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject"
    ]

    resources = [
      "arn:aws:s3:::${var.s3_bucket_name}/*"
    ]
  }
}

data "aws_iam_policy_document" "gp2gp-s3-bucket" {
  statement {
    actions = [
      "s3:HeadBucket"
    ]

    resources = [
      "arn:aws:s3:::${var.s3_bucket_name}"
    ]
  }
}

resource "aws_iam_policy" "gp2gp-s3" {
  name   = "${var.environment}-gp2gp-s3"
  policy = "${data.aws_iam_policy_document.gp2gp-s3.json}"
}

resource "aws_iam_policy" "gp2gp-s3-bucket" {
  name   = "${var.environment}-gp2gp-s3-bucket"
  policy = "${data.aws_iam_policy_document.gp2gp-s3-bucket.json}"
}

resource "aws_iam_role_policy_attachment" "gp2gp-s3-attach" {
  role       = "${aws_iam_role.gp2gp.name}"
  policy_arn = aws_iam_policy.gp2gp-s3.arn
}

resource "aws_iam_role_policy_attachment" "gp2gp-s3-bucket-attach" {
  role       = "${aws_iam_role.gp2gp.name}"
  policy_arn = aws_iam_policy.gp2gp-s3-bucket.arn
}
