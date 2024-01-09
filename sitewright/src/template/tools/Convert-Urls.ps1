param (
    $urls
)

$data = $urls | % {
    @{ 
        loc=$_;
        lastmod=$null
    }
}

$i = 1
$total = $data.length

Write-Progress -Activity "Starting conversion" -PercentComplete 0

$data `
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
