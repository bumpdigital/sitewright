param (
    $fileOrUrl
)

$data = $null

if ($fileOrUrl.StartsWith("http")) {
    $data = [xml](irm $fileOrUrl)
} else {
    $data = [xml](Get-Content $fileOrUrl)
}

$i = 1
$total = $data.urlset.url.length
Write-Progress -Activity "Starting conversion" -PercentComplete 0

$data.urlset.url `
| sort -property loc -unique `
| % {
    $url = $_.loc
    Write-Progress -Activity "Converting" -Status $url -PercentComplete ($i++ / $total * 100)
    [array]$parts = ($url.Split("/") | select -skip 3 | where { $_ -ne "" }) ?? @()
    @{
        url = $url
        parts = $parts
        depth = $parts.length
        length = [int]$url.length
        mod = $_.lastmod
    }
} `
| sort -property @{Expression="depth"}, @{Expression="length"} `
| ConvertTo-Json

Write-Progress -Activity "Done" -Completed