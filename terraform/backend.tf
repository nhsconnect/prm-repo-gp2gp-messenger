terraform{
      backend "s3" {
        bucket  = "prm-deductions-terraform-state"
        key     = "gp2gp-adaptor/terraform.tfstate"
        region  = "eu-west-2"
        encrypt = true
    }
}
