[CmdletBinding()]
param(
  [ValidateSet('Audit','Prepare','Test','Review','Commit','Push','Verify')]
  [string]$Step = 'Audit',
  [string]$Branch,
  [string[]]$Paths = @(),
  [string]$Message,
  [switch]$PreserveLocalChanges
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
function Run([string]$Exe, [string[]]$Arguments) {
  & $Exe @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Exe failed (exit $LASTEXITCODE). Stop and resolve the error." }
}
function GitText([string[]]$Arguments) {
  $result = & git @Arguments
  if ($LASTEXITCODE -ne 0) { throw 'Git inspection failed.' }
  return ($result -join "`n")
}
function Clean {
  if (GitText @('status','--porcelain')) { throw 'Uncommitted/untracked files exist. Review and commit intended files; preserve everything else. Nothing was stashed or deleted.' }
}
function FeatureBranch {
  $current = GitText @('branch','--show-current')
  if (!$current -or $current -in @('main','master','market-data')) { throw 'Use a feature branch; direct release pushes are disabled.' }
  return $current
}
function Validate {
  Run 'npm.cmd' @('test')
  Run 'node' @('--test','scripts/record-history.test.mjs','scripts/service-worker.test.mjs')
  Run 'npm.cmd' @('run','build')
}
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
  $origin = GitText @('remote','get-url','origin')
  if ($origin -notin @('https://github.com/RabbitHour/poke-pulse-ticker.git','https://github.com/RabbitHour/poke-pulse-ticker','git@github.com:RabbitHour/poke-pulse-ticker.git')) {
    throw 'Origin is not the expected RabbitHour/poke-pulse-ticker repository.'
  }
  if (GitText @('diff','--name-only','--diff-filter=U')) { throw 'Resolve existing merge conflicts first.' }
  switch ($Step) {
    Audit {
      Run 'git' @('status','--short')
      Run 'git' @('log','-1','--oneline')
      Run 'git' @('diff','--stat')
    }
    Prepare {
      if (!$Branch -or $Branch -notmatch '^fix/[a-zA-Z0-9][a-zA-Z0-9/-]*$') { throw 'Supply a new fix/... branch name.' }
      if (!$PreserveLocalChanges) { Clean }
      Run 'git' @('fetch','origin')
      # Branch from current HEAD: carries local edits, never resets to remote.
      Run 'git' @('switch','-c',$Branch)
      Write-Host 'Created a branch from local HEAD. Review origin/main divergence before integration.'
      Run 'git' @('log','--oneline','--left-right','HEAD...origin/main')
    }
    Test { Validate }
    Review {
      Run 'git' @('status','--short')
      Run 'git' @('diff','--check')
      Run 'git' @('diff','--stat')
      Run 'git' @('diff','--cached','--stat')
      Write-Host 'Review full changes in PyCharm, including untracked files. Do not include secrets, backups, or generated catalog data.'
    }
    Commit {
      $null = FeatureBranch
      if (!$Paths.Count -or !$Message) { throw 'Supply explicit -Paths and -Message.' }
      if (GitText @('diff','--cached','--name-only')) { throw 'Existing staged changes must be reviewed separately first.' }
      foreach ($p in $Paths) {
        if ($p -match '(^|[/\\])(\.env[^/\\]*|node_modules[^/\\]*|\.git|\.wrangler|public[/\\]data)([/\\]|$)' -or
            $p -match '(^[/\\]|:|\.\.|[*?])' -or !(Test-Path -LiteralPath $p -PathType Leaf)) {
          throw "Not an eligible explicit source file: $p"
        }
      }
      Validate
      Run 'git' (@('add','--') + $Paths)
      Run 'git' @('diff','--cached','--check')
      Run 'git' @('diff','--cached','--stat')
      Run 'git' @('commit','-m',$Message)
    }
    Push {
      $current = FeatureBranch
      Clean
      Run 'git' @('fetch','origin')
      & git merge-base --is-ancestor origin/main HEAD
      if ($LASTEXITCODE -ne 0) { throw 'origin/main is not included. Review and merge it explicitly, resolve conflicts, then rerun tests. No automatic merge performed.' }
      Validate
      Run 'git' @('push','--set-upstream','origin',("HEAD:refs/heads/" + $current))
      Write-Host 'Feature branch pushed. Open a pull request and inspect its checks. This is not deployment verification.'
    }
    Verify { Run 'node' @('scripts/verify-hosts.mjs') }
  }
} finally { Pop-Location }
