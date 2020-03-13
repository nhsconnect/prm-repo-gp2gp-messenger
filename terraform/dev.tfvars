environment    = "dev"
component_name = "gp2gp-adaptor"
dns_name       = "gp2gp-adaptor"

s3_bucket_name       = "dev-gp2gp-bucket"

task_cpu    = 256
task_memory = 512
port        = 3000

service_desired_count = "1"

alb_deregistration_delay = 15
