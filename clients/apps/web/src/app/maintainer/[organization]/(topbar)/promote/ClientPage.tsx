'use client'

import { GitHubAppInstallationUpsell } from '@/components/Dashboard/Upsell'
import { FundOurBacklog } from '@/components/Embed/FundOurBacklog'
import { SeeksFundingShield } from '@/components/Embed/SeeksFundingShield'
import { Subscribe } from '@/components/Embed/Subscribe'
import { DashboardBody } from '@/components/Layout/DashboardLayout'
import { RepoPickerHeader } from '@/components/Organization/RepoPickerHeader'
import DashboardTopbar from '@/components/Shared/DashboardTopbar'
import { useCurrentOrgAndRepoFromURL } from '@/hooks/org'
import {
  CopyToClipboardInput,
  ShadowBox,
  Tabs,
  TabsTrigger,
} from 'polarkit/components/ui/atoms'
import { TabsList } from 'polarkit/components/ui/tabs'
import {
  useListRepositories,
  useSearchIssues,
  useSubscriptionSummary,
} from 'polarkit/hooks'
import { ReactElement, useState } from 'react'

export default function ClientPage() {
  const { org, isLoaded, repo: currentRepo } = useCurrentOrgAndRepoFromURL()

  const orgSlashRepo = currentRepo
    ? `${org?.name}/${currentRepo.name}`
    : `${org?.name}`

  const orgRepoParams = currentRepo
    ? `org=${org?.name}&repo=${currentRepo.name}`
    : `org=${org?.name}`

  const fundingYAML = `polar: ${org?.name}`

  const issues = useSearchIssues({
    organizationName: org?.name,
    haveBadge: true,
    repositoryName: currentRepo?.name,
  })

  // Get all repositories
  const listRepositoriesQuery = useListRepositories()
  const allRepositories = listRepositoriesQuery?.data?.items

  // Filter repos by current org & normalize for our select
  const allOrgRepositories =
    allRepositories?.filter((r) => r?.organization?.id === org?.id) || []

  const subscriptionsSummary = useSubscriptionSummary(org?.name ?? '', 3)

  const [currentEmbedTab, setCurrentEmbedTab] = useState('Tiers')

  if (!org && isLoaded) {
    return (
      <>
        <div className="mx-auto mt-32 flex max-w-[1100px] flex-col items-center">
          <span>Organization not found</span>
          <span>404 Not Found</span>
        </div>
      </>
    )
  }

  const previews: Record<string, ReactElement> = {
    Tiers: (
      <>
        <picture>
          <source
            media="(prefers-color-scheme: dark)"
            srcSet={`/embed/tiers.svg?org=${org?.name}&darkmode`}
          />
          <img
            alt="Subscription Tiers on Polar"
            src={`/tiers.svg?org=${org?.name}`}
          />
        </picture>
      </>
    ),
    Subscribe: (
      <Subscribe
        subscriptions={subscriptionsSummary.data?.items || []}
        totalSubscriptions={
          subscriptionsSummary.data?.pagination.total_count ?? 0
        }
        label="Subscribe"
        darkmode={false}
      />
    ),
    Issues: (
      <FundOurBacklog
        issues={issues.data?.items || []}
        issueCount={issues.data?.items?.length || 0}
      />
    ),
    Shield: (
      <div className="w-fit">
        <SeeksFundingShield count={issues.data?.items?.length || 0} />
      </div>
    ),
  }

  const embedCodes: Record<string, string> = {
    Tiers: `<a href="https://polar.sh/${orgSlashRepo}/subscriptions"><picture><source media="(prefers-color-scheme: dark)" srcset="https://polar.sh/embed/tiers.svg?org=${org?.name}&darkmode"><img alt="Subscription Tiers on Polar" src="https://polar.sh/embed/tiers.svg?org=${org?.name}"></picture></a>`,
    Subscribe: `<a href="https://polar.sh/${orgSlashRepo}"><picture><source media="(prefers-color-scheme: dark)" srcset="https://polar.sh/embed/subscribe.svg?org=${org?.name}&label=Subscribe&darkmode"><img alt="Subscribe on Polar" src="https://polar.sh/embed/subscribe.svg?org=${org?.name}&label=Subscribe"></picture></a>`,
    Issues: `<a href="https://polar.sh/${orgSlashRepo}"><img src="https://polar.sh/embed/fund-our-backlog.svg?${orgRepoParams}" /></a>`,
    Shield: `<a href="https://polar.sh/${orgSlashRepo}"><img src="https://polar.sh/embed/seeks-funding-shield.svg?${orgRepoParams}" /></a>`,
  }

  return (
    <>
      <DashboardTopbar isFixed useOrgFromURL>
        <RepoPickerHeader
          currentRepository={currentRepo}
          repositories={allOrgRepositories}
        />
      </DashboardTopbar>
      <DashboardBody>
        <div className="space-y-4">
          {!org?.has_app_installed && <GitHubAppInstallationUpsell />}
          <h2 className="text-lg font-medium">GitHub Sponsors</h2>
          <p className="dark:text-polar-400 text-sm text-gray-500">
            Make sure to link to your public funding page from GitHub&apos;s
            Sponsor section.
          </p>
          <ShadowBox>
            <div className="flex flex-col gap-4">
              <h3 className="dark:text-polar-200 font-medium text-gray-500">
                Link to your Polar funding page
              </h3>
              <div className="max-w-[600px]">
                <CopyToClipboardInput id="github-funding" value={fundingYAML} />
              </div>
              <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-500 dark:border-blue-500 dark:bg-blue-700 dark:text-blue-300">
                Follow the instructions{' '}
                <a
                  className="font-bold text-blue-500 dark:text-blue-200"
                  href="https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/displaying-a-sponsor-button-in-your-repository"
                >
                  here
                </a>{' '}
                and paste the above in your FUNDING.yml
              </div>
            </div>
          </ShadowBox>
          <h2 className="pt-8 text-lg font-medium">README Embeds</h2>
          <p className="dark:text-polar-400 text-sm text-gray-500">
            Polar Embeds allow you to promote Subscription Tiers & Issues on
            your GitHub README & website
          </p>
          <ShadowBox>
            <Tabs value={currentEmbedTab} onValueChange={setCurrentEmbedTab}>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="dark:text-polar-200 font-medium text-gray-500">
                      Preview
                    </h3>

                    <TabsList className="bg-transparent dark:bg-transparent">
                      {['Tiers', 'Subscribe', 'Issues', 'Shield'].map(
                        (item) => (
                          <TabsTrigger
                            key={item}
                            className="hover:text-blue-500 data-[state=active]:rounded-full data-[state=active]:bg-blue-50 data-[state=active]:text-blue-500 data-[state=active]:shadow-none dark:data-[state=active]:bg-blue-950 dark:data-[state=active]:text-blue-300"
                            value={item}
                            size="small"
                          >
                            {item}
                          </TabsTrigger>
                        ),
                      )}
                    </TabsList>
                  </div>

                  <div className="dark:bg-polar-800 dark:border-polar-700 flex w-full justify-center rounded-2xl border border-gray-200 bg-gray-50 p-12">
                    {previews[currentEmbedTab] || <></>}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="dark:text-polar-200 font-medium text-gray-500">
                    Embed code
                  </h3>
                  <div className="max-w-[600px]">
                    <CopyToClipboardInput
                      id="embed-svg"
                      value={embedCodes[currentEmbedTab] || ''}
                    />
                  </div>
                </div>
              </div>
            </Tabs>
          </ShadowBox>
        </div>
      </DashboardBody>
    </>
  )
}
