locals {
  deductions_private_alb_dns = data.aws_ssm_parameter.deductions_private_alb_dns.value
}
resource "aws_route53_record" "gp2gp-r53-record" {
  zone_id = data.aws_ssm_parameter.root_zone_id.value
  name    = "${var.environment}.gp2gp-adaptor"
  type    = "CNAME"
  ttl     = "300"
  records = [local.deductions_private_alb_dns]
}
