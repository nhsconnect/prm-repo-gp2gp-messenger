terraform{
      backend "s3" {
        bucket = "prm-327778747031-terraform-states"
        key = "gp2gp-adaptor/terraform.tfstate"
        region = "eu-west-2"
        encrypt = true
    }
}