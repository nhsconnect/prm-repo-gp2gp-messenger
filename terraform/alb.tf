
resource "aws_alb_target_group" "alb-tg" {
  name                 = "${var.environment}-${var.component_name}-tg"
  port                 = 80
  protocol             = "HTTP"
  vpc_id               = data.aws_ssm_parameter.deductions_private_vpc_id.value
  target_type          = "ip"
  deregistration_delay = var.alb_deregistration_delay

  health_check {
    healthy_threshold   = 3
    unhealthy_threshold = 5
    timeout             = 5
    interval            = 10
    path                = "/health"
    port                = 3000
  }
}

resource "aws_alb_listener_rule" "alb-http-listener-rule" {
  listener_arn = data.aws_ssm_parameter.deductions_private_alb_httpl_arn.value
  priority     = 301

  action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }

  condition {
    field  = "host-header"
    values = ["${var.environment}.${var.dns_name}.patient-deductions.nhs.uk"]
  }
}

resource "aws_alb_listener_rule" "alb-https-listener-rule" {
  listener_arn = data.aws_ssm_parameter.deductions_private_alb_httpsl_arn.value
  priority     = 101

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.alb-tg.arn
  }

  condition {
    field  = "host-header"
    values = ["${var.environment}.${var.dns_name}.patient-deductions.nhs.uk"]
  }
}


# resource "aws_alb_target_group" "gp2gp-alb-internal-tg" {
#   name        = "${var.environment}-${var.component_name}-priv-int-tg"
#   port        = 3000
#   protocol    = "HTTP"
#   vpc_id      = module.vpc.vpc_id
#   target_type = "ip"
#   deregistration_delay = var.priv_deregistration_delay
#   health_check {
#     healthy_threshold   = 3
#     unhealthy_threshold = 5
#     timeout             = 5
#     interval            = 10
#     path                = "/health"
#     port                = 3000
#   }
# }

# # Redirect all traffic from the ALB to the target group
# resource "aws_alb_listener" "alb-internal-listener" {
#   load_balancer_arn = aws_alb.alb-internal.arn
#   port              = "80"
#   protocol          = "HTTP"

#   default_action {
#     type = "fixed-response"

#     fixed_response {
#       content_type = "text/plain"
#       message_body = "Error"
#       status_code  = "501"
#     }
#   }
# }