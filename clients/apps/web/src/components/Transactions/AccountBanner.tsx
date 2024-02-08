import { ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { AccountType, Organization, Status, UserRead } from '@polar-sh/sdk'
import Link from 'next/link'
import { ACCOUNT_TYPE_DISPLAY_NAMES, ACCOUNT_TYPE_ICON } from 'polarkit/account'
import { Button, ShadowBox } from 'polarkit/components/ui/atoms'
import { Banner } from 'polarkit/components/ui/molecules'
import { useAccount } from 'polarkit/hooks'
import Icon from '../Icons/Icon'

interface AccountBannerProps {
  organization: Organization
  user?: UserRead
  isPersonal?: boolean
  isSubscriptionsPage?: boolean
}

const AccountBanner: React.FC<AccountBannerProps> = ({
  organization,
  user,
  isPersonal,
  isSubscriptionsPage,
}) => {
  const { data: organizationAccount } = useAccount(organization.account_id)
  const { data: personalAccount } = useAccount(user?.account_id)

  const setupLink = isPersonal
    ? '/finance/account'
    : `/maintainer/${organization.name}/finance/account`

  const currentAccount = isPersonal
    ? organizationAccount || personalAccount
    : organizationAccount
  const bothOrganizationAndPersonal =
    isPersonal &&
    organizationAccount !== undefined &&
    personalAccount !== undefined &&
    organizationAccount.id !== personalAccount.id
  const isActive =
    currentAccount?.status === Status.UNREVIEWED ||
    currentAccount?.status === Status.ACTIVE
  const isUnderReview = currentAccount?.status === Status.UNDER_REVIEW

  if (!currentAccount) {
    if (isSubscriptionsPage) {
      return (
        <ShadowBox className="relative flex flex-row items-end justify-between bg-blue-100/40 dark:bg-blue-800/20">
          <div className="flex w-full flex-row gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="mt-0 text-lg font-medium [text-wrap:balance]">
                Setup paid subscriptions
              </h3>

              <p className="dark:text-polar-500 text-gray-500 [text-wrap:pretty]">
                Connect Polar with Stripe to enable creation of paid
                subscription tiers.
              </p>
            </div>

            <Link href={setupLink}>
              <Button size="lg" className="whitespace-nowrap">
                Setup Stripe
              </Button>
            </Link>
          </div>
        </ShadowBox>
      )
    }

    return (
      <>
        <Banner
          color="default"
          right={
            <Link href={setupLink}>
              <Button size="sm">Setup</Button>
            </Link>
          }
        >
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <span className="text-sm">
            You need to set up <strong>Stripe</strong> or{' '}
            <strong>Open Collective</strong> to receive transfers
          </span>
        </Banner>
      </>
    )
  }

  if (bothOrganizationAndPersonal) {
    return (
      <>
        <Banner
          color="default"
          right={
            <Link href={setupLink}>
              <Button size="sm">Fix</Button>
            </Link>
          }
        >
          <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
          <span className="text-sm">
            You have two payout accounts selected, both as a backer and
            maintainer.
          </span>
        </Banner>
      </>
    )
  }

  if (currentAccount && isUnderReview) {
    const AccountTypeIcon = ACCOUNT_TYPE_ICON[currentAccount.account_type]
    return (
      <Banner
        color="default"
        right={
          <Link href={setupLink}>
            <Button size="sm">Read more</Button>
          </Link>
        }
      >
        <Icon classes="bg-blue-500 p-1" icon={<AccountTypeIcon />} />
        <span className="text-sm">
          Your{' '}
          <strong>
            {ACCOUNT_TYPE_DISPLAY_NAMES[currentAccount.account_type]}
          </strong>{' '}
          account is under review
        </span>
      </Banner>
    )
  }

  if (currentAccount && !isActive && !isUnderReview) {
    const AccountTypeIcon = ACCOUNT_TYPE_ICON[currentAccount.account_type]
    return (
      <Banner
        color="default"
        right={
          <Link href={setupLink}>
            <Button size="sm">Continue setup</Button>
          </Link>
        }
      >
        <Icon classes="bg-blue-500 p-1" icon={<AccountTypeIcon />} />
        <span className="text-sm">
          Continue the setup of your{' '}
          <strong>
            {ACCOUNT_TYPE_DISPLAY_NAMES[currentAccount.account_type]}
          </strong>{' '}
          account to receive transfers
        </span>
      </Banner>
    )
  }

  if (currentAccount && isActive) {
    const accountType = currentAccount.account_type
    const AccountTypeIcon = ACCOUNT_TYPE_ICON[accountType]
    return (
      <>
        <Banner
          color="muted"
          right={
            <>
              <Link href={setupLink}>
                <Button size="sm">Manage</Button>
              </Link>
            </>
          }
        >
          <Icon classes="bg-blue-500 p-1" icon={<AccountTypeIcon />} />
          <span className="dark:text-polar-400 text-sm">
            {accountType === AccountType.STRIPE &&
              'Transfers will be sent to the connected Stripe account'}
            {accountType === AccountType.OPEN_COLLECTIVE &&
              'Transfers will be sent in bulk once per month to the connected Open Collective account'}
          </span>
        </Banner>
      </>
    )
  }

  return null
}

export default AccountBanner
