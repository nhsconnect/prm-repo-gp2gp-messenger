environment          = "dev"
component_name       = "gp2gp-adaptor"

task_execution_role  = "ecsTaskExecutionRole"
task_family          = "gp2gp-adaptor"

task_container_name  = "gp2gp-adaptor-container"
task_image_name      = "deductions/gp2gp-adaptor"
task_cpu             = 256
task_memory          = 512
task_container_port  = 3000
task_host_port       = 3000

service_container_port  = "3000"
service_container_name  = "gp2gp-adaptor-container"
service_desired_count   = "2"