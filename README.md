Simple POC for developing, deploying and publishing HubsPot modules.

Requirements:
* A secret must be placed in github actions secrets located in https://github.com/*Repository*/settings/secrets/actions
    * This secret is the content of hubspot.config.yml file, and it will be used to upload assets

Use:
* Create a PR to target desired branch, ex dev, once merged, a deployment process will start and upload the changed modules only to modules/dev/module_name
* Create a PR to main (prod), once merge, a deployment to PROD will occur, and modules will be publicly available to all pages