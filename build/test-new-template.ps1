$version = "1.0.0-beta-001"

# Overwrite current pack

Set-Location "$PSScriptRoot\..\sitewright"
npm pack

# Initialize template folder

Set-Location "$PSScriptRoot\.."

$templatepath = './test-template'
if ($true -eq (Test-Path $templatepath)) {
    Remove-Item $templatepath -Recurse
}
New-Item $templatepath -type Directory | Out-Null

# Install package

Set-Location "$PSScriptRoot\..\test-template"

npm init -f
npm i "../sitewright/sitewright-$version.tgz"

npx sitewright init demo -r https://bump.digital -w bump.digital 